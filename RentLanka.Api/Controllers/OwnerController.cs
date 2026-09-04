using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentLanka.Api.Services;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "OWNER,ADMIN")]
public class OwnerController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly IBookingService _bookingService;

    public OwnerController(IVehicleService vehicleService, IBookingService bookingService)
    {
        _vehicleService = vehicleService;
        _bookingService = bookingService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetMyVehicles()
    {
        try
        {
            var vehicles = await _vehicleService.GetOwnerVehiclesAsync(GetUserId());
            return Ok(vehicles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { title = ex.Message });
        }
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        try
        {
            var bookings = await _bookingService.GetOwnerBookingsAsync(GetUserId());
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { title = ex.Message });
        }
    }

    [HttpPatch("bookings/{id}/accept")]
    public async Task<IActionResult> AcceptBooking(int id)
    {
        try
        {
            await _bookingService.AcceptAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { title = "Booking not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { title = ex.Message });
        }
    }

    [HttpPatch("bookings/{id}/reject")]
    public async Task<IActionResult> RejectBooking(int id)
    {
        try
        {
            await _bookingService.RejectAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { title = "Booking not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { title = ex.Message });
        }
    }
}
