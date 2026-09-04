using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Dtos;
using RentLanka.Api.Models;

namespace RentLanka.Api.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;

    public BookingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<BookingResponseDto> CreateAsync(BookingRequestDto dto, int customerId)
    {
        var vehicle = await _db.Vehicles.FindAsync(dto.VehicleId);
        if (vehicle == null) throw new Exception("Vehicle not found");
        if (vehicle.Status != "AVAILABLE") throw new Exception("Vehicle is not available");

        // Check for conflicting bookings
        var conflicting = await _db.Bookings
            .Where(b => b.VehicleId == dto.VehicleId)
            .Where(b => b.Status == "PENDING" || b.Status == "ACCEPTED")
            .Where(b => b.StartDate < dto.EndDate && b.EndDate > dto.StartDate)
            .AnyAsync();
        if (conflicting) throw new Exception("Vehicle already booked for those dates");

        var days = (dto.EndDate - dto.StartDate).Days;
        if (days <= 0) throw new Exception("End date must be after start date");
        var total = vehicle.PricePerDay * days;

        var booking = new Booking
        {
            CustomerId = customerId,
            VehicleId = dto.VehicleId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalPrice = total,
            Status = "PENDING",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Mark vehicle as booked
        vehicle.Status = "BOOKED";
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(booking.Id);
    }

    public async Task<IEnumerable<BookingResponseDto>> GetCustomerBookingsAsync(int customerId)
    {
        return await _db.Bookings
            .Where(b => b.CustomerId == customerId)
            .Include(b => b.Vehicle)
            .Include(b => b.Customer)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<IEnumerable<BookingResponseDto>> GetOwnerBookingsAsync(int ownerId)
    {
        return await _db.Bookings
            .Where(b => b.Vehicle.OwnerId == ownerId)
            .Include(b => b.Vehicle)
            .Include(b => b.Customer)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<BookingResponseDto> GetByIdAsync(int id)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) throw new KeyNotFoundException("Booking not found");
        return MapToDto(booking);
    }

    public async Task CancelAsync(int id, int customerId)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) throw new KeyNotFoundException("Booking not found");
        if (booking.CustomerId != customerId) throw new UnauthorizedAccessException("You are not the customer of this booking");
        if (booking.Status != "PENDING") throw new Exception("Only pending bookings can be cancelled");

        booking.Status = "CANCELLED";
        booking.UpdatedAt = DateTime.UtcNow;
        // Make vehicle available again
        var vehicle = await _db.Vehicles.FindAsync(booking.VehicleId);
        if (vehicle != null) vehicle.Status = "AVAILABLE";
        await _db.SaveChangesAsync();
    }

    public async Task AcceptAsync(int id, int ownerId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) throw new KeyNotFoundException("Booking not found");
        if (booking.Vehicle.OwnerId != ownerId) throw new UnauthorizedAccessException("You are not the owner of this vehicle");

        booking.Status = "ACCEPTED";
        booking.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task RejectAsync(int id, int ownerId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) throw new KeyNotFoundException("Booking not found");
        if (booking.Vehicle.OwnerId != ownerId) throw new UnauthorizedAccessException("You are not the owner of this vehicle");

        booking.Status = "REJECTED";
        booking.UpdatedAt = DateTime.UtcNow;
        // Make vehicle available again
        var vehicle = await _db.Vehicles.FindAsync(booking.VehicleId);
        if (vehicle != null) vehicle.Status = "AVAILABLE";
        await _db.SaveChangesAsync();
    }

    private BookingResponseDto MapToDto(Booking b)
    {
        return new BookingResponseDto(
            b.Id,
            b.VehicleId,
            b.Vehicle?.Brand + " " + b.Vehicle?.Model ?? "Unknown",
            b.CustomerId,
            b.Customer?.Name ?? "Unknown",
            b.StartDate,
            b.EndDate,
            b.TotalPrice,
            b.Status
        );
    }
}
