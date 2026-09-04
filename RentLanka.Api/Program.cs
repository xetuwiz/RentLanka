using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RentLanka.Api.Data;
using RentLanka.Api.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RentLanka API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {{
        new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
        Array.Empty<string>()
    }});
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options => {
    options.AddPolicy("Production", policy =>
        policy.WithOrigins("https://app.xetuwiz.de")
              .AllowAnyMethod().AllowAnyHeader().AllowCredentials());
    options.AddPolicy("Development", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("Fixed", opt => {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromSeconds(60);
        opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    options.OnRejected = async (context, cancellationToken) => {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("""
        {
            "type": "https://tools.ietf.org/html/rfc6585#section-4",
            "title": "Too Many Requests",
            "status": 429,
            "detail": "Rate limit exceeded. Please wait 60 seconds."
        }
        """);
    };
});

var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "DefaultSecretKey32CharactersLong!!");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<SpatialImportService>();

var app = builder.Build();

app.UseExceptionHandler(errorApp => {
    errorApp.Run(async context => {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        context.Response.StatusCode = exception switch {
            ArgumentException => 400,
            UnauthorizedAccessException => 401,
            KeyNotFoundException => 404,
            _ => 500
        };
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsync($$"""
        {
            "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
            "title": "{{exception?.Message ?? "An error occurred"}}",
            "status": {{context.Response.StatusCode}},
            "traceId": "{{Guid.NewGuid()}}"
        }
        """);
    });
});

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(app.Environment.IsDevelopment() ? "Development" : "Production");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed spatial data
using (var scope = app.Services.CreateScope()) {
    var importService = scope.ServiceProvider.GetRequiredService<SpatialImportService>();
    await importService.ImportAllAsync();
}

// Seed admin user
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Users.Any(u => u.Email == "admin@rentlanka.com")) {
        db.Users.Add(new User {
            Name = "Admin",
            Email = "admin@rentlanka.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "ADMIN",
            Active = true,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
}

app.Run();
