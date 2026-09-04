using RentLanka.Api.Models;
using RentLanka.Api.Dtos;

namespace RentLanka.Api.Services;

public interface IAdminService
{
    Task<object> GetDashboardAsync();
    Task<IEnumerable<User>> GetUsersAsync();
    Task ToggleUserStatusAsync(int userId);
    Task UpdateUserAsync(int userId, UpdateUserDto dto);
    Task DeleteUserAsync(int userId);
    Task DeleteBookingAsync(int bookingId);
    Task<IEnumerable<Vehicle>> GetVehiclesAsync();
    Task<IEnumerable<Booking>> GetBookingsAsync();
}

