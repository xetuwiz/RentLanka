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

    public async Task<BookingResponseDto> CreateAsync(
        BookingRequestDto dto,
        int customerId)
    {
        if (dto.StartDate.Date < DateTime.UtcNow.Date)
            throw new ArgumentException("Start date cannot be in the past.");

        if (dto.EndDate.Date <= dto.StartDate.Date)
            throw new ArgumentException("End date must be after start date.");

        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == dto.VehicleId);

        if (vehicle == null)
            throw new KeyNotFoundException("Vehicle not found.");

        if (vehicle.Status != "AVAILABLE")
            throw new ArgumentException("Vehicle is not currently available.");

        var conflicting = await _db.Bookings
            .Where(b => b.VehicleId == dto.VehicleId)
            .Where(b => b.Status == "PENDING" || b.Status == "ACCEPTED")
            .Where(b =>
                b.StartDate < dto.EndDate &&
                b.EndDate > dto.StartDate)
            .AnyAsync();

        if (conflicting)
            throw new ArgumentException(
                "This vehicle is already booked for the selected dates.");

        var days = (dto.EndDate.Date - dto.StartDate.Date).Days;

        if (days <= 0)
            days = 1;

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

        _db.Bookings.Add(booking);

        await _db.SaveChangesAsync();

        return await MapBookingAsync(booking.Id);
    }

    public async Task<IEnumerable<BookingResponseDto>>
        GetCustomerBookingsAsync(int customerId)
    {
        var bookings = await _db.Bookings
            .Include(b => b.Vehicle)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(b => new BookingResponseDto
        {
            Id = b.Id,
            VehicleId = b.VehicleId,
            VehicleName = b.Vehicle.Name,
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            TotalPrice = b.TotalPrice,
            Status = b.Status,
            CreatedAt = b.CreatedAt
        });
    }

    public async Task<BookingResponseDto>
        GetBookingByIdAsync(int id, int userId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b =>
                b.Id == id &&
                b.CustomerId == userId);

        if (booking == null)
            throw new KeyNotFoundException("Booking not found.");

        return new BookingResponseDto
        {
            Id = booking.Id,
            VehicleId = booking.VehicleId,
            VehicleName = booking.Vehicle.Name,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt
        };
    }

    public async Task CancelAsync(int id, int customerId)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b =>
                b.Id == id &&
                b.CustomerId == customerId);

        if (booking == null)
            throw new KeyNotFoundException("Booking not found.");

        if (booking.Status == "CANCELLED")
            throw new ArgumentException("Booking is already cancelled.");

        if (booking.Status == "REJECTED")
            throw new ArgumentException("Rejected bookings cannot be cancelled.");

        booking.Status = "CANCELLED";
        booking.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task AcceptAsync(int id, int ownerId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b =>
                b.Id == id &&
                b.Vehicle.OwnerId == ownerId);

        if (booking == null)
            throw new KeyNotFoundException("Booking not found.");

        if (booking.Status != "PENDING")
            throw new ArgumentException("Only pending bookings can be accepted.");

        booking.Status = "ACCEPTED";
        booking.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task RejectAsync(int id, int ownerId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b =>
                b.Id == id &&
                b.Vehicle.OwnerId == ownerId);

        if (booking == null)
            throw new KeyNotFoundException("Booking not found.");

        if (booking.Status != "PENDING")
            throw new ArgumentException("Only pending bookings can be rejected.");

        booking.Status = "REJECTED";
        booking.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    private async Task<BookingResponseDto> MapBookingAsync(int id)
    {
        var booking = await _db.Bookings
            .Include(b => b.Vehicle)
            .FirstAsync(b => b.Id == id);

        return new BookingResponseDto
        {
            Id = booking.Id,
            VehicleId = booking.VehicleId,
            VehicleName = booking.Vehicle.Name,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt
        };
    }
}