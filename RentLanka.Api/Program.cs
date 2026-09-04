using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RentLanka.Api.Data;
using RentLanka.Api.Models;
using RentLanka.Api.Services;
using Serilog;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

//  Logging 
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

//  Controllers + Swagger 
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RentLanka API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

//  Database 
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

//  CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? new[] { "https://rentlanka-app.vercel.app", "https://rentlanka.vercel.app", "https://app.xetuwiz.de" })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
    options.AddPolicy("Development", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

//  Rate Limiting 
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("Fixed", opt =>
    {
        opt.PermitLimit = builder.Configuration.GetValue("RateLimiting:PermitLimit", 100);
        opt.Window = TimeSpan.FromSeconds(builder.Configuration.GetValue("RateLimiting:WindowSeconds", 60));
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    options.OnRejected = async (context, _) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/problem+json";
        await context.HttpContext.Response.WriteAsync(
            """{"type":"https://tools.ietf.org/html/rfc6585#section-4","title":"Too Many Requests","status":429}""");
    };
});

//  JWT 
var key = Encoding.UTF8.GetBytes(
    builder.Configuration["Jwt:Key"] ?? "DefaultSecretKey32CharactersLong!!");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

//  DI: Application Services 
builder.Services.AddScoped<ISpatialService, SpatialService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<SpatialImportService>();

//  Build 
var app = builder.Build();

//  Global Exception Handler 
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var ex = feature?.Error;
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = ex switch
        {
            ArgumentException       => 400,
            UnauthorizedAccessException => 403,
            KeyNotFoundException    => 404,
            _                       => 500
        };
        await context.Response.WriteAsync(
            $$"""{"title":"{{ex?.Message ?? "An error occurred"}}","status":{{context.Response.StatusCode}},"traceId":"{{Guid.NewGuid()}}"}""");
    });
});

//  Middleware Pipeline 
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(app.Environment.IsDevelopment() ? "Development" : "Production");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

//  Startup: Seed Data 
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var importService = scope.ServiceProvider.GetRequiredService<SpatialImportService>();
    
    // Apply migrations if needed
    db.Database.Migrate();

    // Seed Spatial Data
    await importService.ImportAllAsync();

    // Seed Users & Vehicles
    if (!await db.Users.AnyAsync(u => u.Email == "admin@rentlanka.com"))
    {
        var admin = new User { Name = "Admin", Email = "admin@rentlanka.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = "ADMIN", Active = true, CreatedAt = DateTime.UtcNow };
        var owner = new User { Name = "Kamal Perera", Email = "kamal@rentlanka.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("owner123"), Role = "OWNER", Active = true, CreatedAt = DateTime.UtcNow, Phone = "0711234567" };
        var customer = new User { Name = "Nimal Silva", Email = "nimal@rentlanka.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("customer123"), Role = "CUSTOMER", Active = true, CreatedAt = DateTime.UtcNow, Phone = "0777654321" };
        
        db.Users.AddRange(admin, owner, customer);
        await db.SaveChangesAsync();
        Log.Information("Sample users seeded");

        var colomboUnit = await db.SpatialUnits.FirstOrDefaultAsync(s => s.Pcode == "LK11");
        
        if (colomboUnit != null)
        {
            db.Vehicles.AddRange(
                new Vehicle { OwnerId = owner.Id, SpatialUnitId = colomboUnit.Id, Brand = "Toyota", Model = "Aqua", Year = 2018, VehicleType = "CAR", PricePerDay = 8500, Seats = 5, Transmission = "Automatic", FuelType = "Hybrid", Latitude = 6.9271m, Longitude = 79.8612m, Status = "AVAILABLE", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Vehicle { OwnerId = owner.Id, SpatialUnitId = colomboUnit.Id, Brand = "Honda", Model = "Fit", Year = 2019, VehicleType = "CAR", PricePerDay = 9000, Seats = 5, Transmission = "Automatic", FuelType = "Hybrid", Latitude = 6.9100m, Longitude = 79.8700m, Status = "AVAILABLE", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Vehicle { OwnerId = owner.Id, SpatialUnitId = colomboUnit.Id, Brand = "Suzuki", Model = "Wagon R", Year = 2020, VehicleType = "CAR", PricePerDay = 6500, Seats = 4, Transmission = "Automatic", FuelType = "Hybrid", Latitude = 6.8900m, Longitude = 79.8800m, Status = "AVAILABLE", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            );
            await db.SaveChangesAsync();
            Log.Information("Sample vehicles seeded");
        }
    }
}

app.Run();
