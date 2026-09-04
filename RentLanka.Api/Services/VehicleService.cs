using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Dtos;
using RentLanka.Api.Models;

namespace RentLanka.Api.Services;

public class VehicleService : IVehicleService
{
    private readonly AppDbContext _db;

    public VehicleService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<VehicleResponseDto>> GetAllAsync()
    {
        var vehicles = await _db.Vehicles
            .Include(v => v.Owner).Include(v => v.SpatialUnit)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
        return vehicles.Select(MapToDto);
    }

    public async Task<VehicleResponseDto> GetByIdAsync(int id)
    {
        var vehicle = await _db.Vehicles
            .Include(v => v.Owner).Include(v => v.SpatialUnit)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (vehicle == null) throw new KeyNotFoundException("Vehicle not found");
        return MapToDto(vehicle);
    }

    public async Task<IEnumerable<VehicleResponseDto>> SearchAsync(VehicleSearchRequest request)
    {
        var query = _db.Vehicles.Include(v => v.Owner).Include(v => v.SpatialUnit).AsQueryable();

        if (request.SpatialUnitId.HasValue)
            query = query.Where(v => v.SpatialUnitId == request.SpatialUnitId);
        if (!string.IsNullOrEmpty(request.VehicleType))
            query = query.Where(v => v.VehicleType == request.VehicleType);
        if (request.MinPrice.HasValue)
            query = query.Where(v => v.PricePerDay >= request.MinPrice.Value);
        if (request.MaxPrice.HasValue)
            query = query.Where(v => v.PricePerDay <= request.MaxPrice.Value);

        var vehicles = await query.OrderBy(v => v.PricePerDay).ToListAsync();
        return vehicles.Select(MapToDto);
    }

    public async Task<IEnumerable<VehicleResponseDto>> FindNearbyAsync(decimal lat, decimal lng, decimal radiusKm)
    {
        // Load AVAILABLE vehicles with coordinates then filter with Haversine in memory
        var vehicles = await _db.Vehicles
            .Where(v => v.Status == "AVAILABLE" && v.Latitude.HasValue && v.Longitude.HasValue)
            .Include(v => v.Owner).Include(v => v.SpatialUnit)
            .ToListAsync();

        return vehicles
            .Where(v => Haversine((double)lat, (double)lng,
                                  (double)v.Latitude!.Value, (double)v.Longitude!.Value) <= (double)radiusKm)
            .Select(MapToDto);
    }

    public async Task<VehicleResponseDto> CreateAsync(VehicleRequestDto dto, int ownerId)
    {
        var vehicle = new Vehicle
        {
            OwnerId      = ownerId,
            SpatialUnitId = dto.SpatialUnitId,
            VehicleType  = dto.VehicleType,
            Brand        = dto.Brand,
            Model        = dto.Model,
            Year         = dto.Year,
            Description  = dto.Description,
            PricePerDay  = dto.PricePerDay,
            Seats        = dto.Seats,
            Transmission = dto.Transmission,
            FuelType     = dto.FuelType,
            Latitude     = dto.Latitude,
            Longitude    = dto.Longitude,
            Status       = "AVAILABLE",
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        // Reload with Owner for the DTO
        await _db.Entry(vehicle).Reference(v => v.Owner).LoadAsync();
        return MapToDto(vehicle);
    }

    public async Task<VehicleResponseDto> UpdateAsync(int id, VehicleRequestDto dto, int userId)
    {
        var vehicle = await _db.Vehicles
            .Include(v => v.Owner).Include(v => v.SpatialUnit)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (vehicle == null) throw new KeyNotFoundException("Vehicle not found");

        var requestingUser = await _db.Users.FindAsync(userId);
        if (vehicle.OwnerId != userId && requestingUser?.Role != "ADMIN")
            throw new UnauthorizedAccessException("You do not own this vehicle");

        vehicle.SpatialUnitId = dto.SpatialUnitId;
        vehicle.VehicleType   = dto.VehicleType;
        vehicle.Brand         = dto.Brand;
        vehicle.Model         = dto.Model;
        vehicle.Year          = dto.Year;
        vehicle.Description   = dto.Description;
        vehicle.PricePerDay   = dto.PricePerDay;
        vehicle.Seats         = dto.Seats;
        vehicle.Transmission  = dto.Transmission;
        vehicle.FuelType      = dto.FuelType;
        vehicle.Latitude      = dto.Latitude;
        vehicle.Longitude     = dto.Longitude;
        vehicle.UpdatedAt     = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(vehicle);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle == null) throw new KeyNotFoundException("Vehicle not found");

        var requestingUser = await _db.Users.FindAsync(userId);
        if (vehicle.OwnerId != userId && requestingUser?.Role != "ADMIN")
            throw new UnauthorizedAccessException("You do not own this vehicle");

        var bookings = await _db.Bookings.Where(b => b.VehicleId == id).ToListAsync();
        _db.Bookings.RemoveRange(bookings);

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateStatusAsync(int id, string status, int userId)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle == null) throw new KeyNotFoundException("Vehicle not found");

        var requestingUser = await _db.Users.FindAsync(userId);
        if (vehicle.OwnerId != userId && requestingUser?.Role != "ADMIN")
            throw new UnauthorizedAccessException("You do not own this vehicle");

        vehicle.Status    = status;
        vehicle.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<VehicleResponseDto>> GetOwnerVehiclesAsync(int ownerId)
    {
        var vehicles = await _db.Vehicles
            .Where(v => v.OwnerId == ownerId)
            .Include(v => v.Owner).Include(v => v.SpatialUnit)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
        return vehicles.Select(MapToDto);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static VehicleResponseDto MapToDto(Vehicle v) => new(
        v.Id,
        v.Brand,
        v.Model,
        v.Year,
        v.PricePerDay,
        v.VehicleType,
        v.Status,
        v.Latitude,
        v.Longitude,
        v.Owner?.Name ?? "Unknown",
        v.SpatialUnitId,
        v.Seats,
        v.Transmission,
        v.FuelType,
        v.Description,
        v.SpatialUnit?.Name
    );

    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth radius km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}




