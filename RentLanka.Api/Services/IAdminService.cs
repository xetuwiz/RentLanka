using RentLanka.Api.Models;

namespace RentLanka.Api.Services;

public interface IAdminService
{
    Task<object> GetDashboardAsync();
    Task<IEnumerable<User>> GetUsersAsync();
    Task ToggleUserStatusAsync(int userId);
    Task<IEnumerable<Vehicle>> GetVehiclesAsync();
    Task<IEnumerable<Booking>> GetBookingsAsync();
}
