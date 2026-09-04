using Microsoft.AspNetCore.Mvc;
using RentLanka.Api.Services;
using System.Threading.Tasks;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var counts = await _adminService.GetDashboardCountsAsync();
        return Ok(counts);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPatch("users/{id}/status")]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        await _adminService.ToggleUserStatusAsync(id);
        return NoContent();
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles()
    {
        var vehicles = await _adminService.GetAllVehiclesAsync();
        return Ok(vehicles);
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings()
    {
        var bookings = await _adminService.GetAllBookingsAsync();
        return Ok(bookings);
    }
}
