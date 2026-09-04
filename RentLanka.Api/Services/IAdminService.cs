using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentLanka.Api.Services;

public interface IAdminService
{
    Task<object> GetDashboardCountsAsync();
    Task<IEnumerable<object>> GetAllUsersAsync();
    Task ToggleUserStatusAsync(int id);
    Task<IEnumerable<object>> GetAllVehiclesAsync();
    Task<IEnumerable<object>> GetAllBookingsAsync();
}
