using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentLanka.Api.Services;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard() => Ok(await _adminService.GetDashboardAsync());

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers() => Ok(await _adminService.GetUsersAsync());

    [HttpPatch("users/{id}/status")]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        try
        {
            await _adminService.ToggleUserStatusAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { title = "User not found" });
        }
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles() => Ok(await _adminService.GetVehiclesAsync());

    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings() => Ok(await _adminService.GetBookingsAsync());
}


