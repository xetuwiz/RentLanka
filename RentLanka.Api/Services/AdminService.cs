using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Models;
using RentLanka.Api.Dtos;

namespace RentLanka.Api.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<object> GetDashboardAsync()
    {
        var userCount = await _db.Users.CountAsync();
        var vehicleCount = await _db.Vehicles.CountAsync();
        var bookingCount = await _db.Bookings.CountAsync();
        return new { UserCount = userCount, VehicleCount = vehicleCount, BookingCount = bookingCount };
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await _db.Users.ToListAsync();
    }

    public async Task ToggleUserStatusAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");
        user.Active = !user.Active;
        await _db.SaveChangesAsync();
    }

    public async Task UpdateUserAsync(int userId, UpdateUserDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");
        user.Name = dto.Name;
        user.Phone = dto.Phone;
        user.Role = dto.Role ?? user.Role;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");

        var customerBookings = await _db.Bookings.Where(b => b.CustomerId == userId).ToListAsync();
        _db.Bookings.RemoveRange(customerBookings);

        var ownerBookings = await _db.Bookings.Where(b => b.Vehicle.OwnerId == userId).ToListAsync();
        _db.Bookings.RemoveRange(ownerBookings);

        var vehicles = await _db.Vehicles.Where(v => v.OwnerId == userId).ToListAsync();
        _db.Vehicles.RemoveRange(vehicles);

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteBookingAsync(int bookingId)
    {
        var booking = await _db.Bookings.FindAsync(bookingId);
        if (booking == null) throw new KeyNotFoundException("Booking not found");
        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesAsync()
    {
        return await _db.Vehicles.Include(v => v.Owner).ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetBookingsAsync()
    {
        return await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Vehicle)
            .ToListAsync();
    }
}




