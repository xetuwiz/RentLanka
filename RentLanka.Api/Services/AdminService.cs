using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Models;

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

    public async Task DeleteUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");
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

