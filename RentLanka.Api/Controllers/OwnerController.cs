using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OwnerController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly IBookingService _bookingService;

    public OwnerController(IVehicleService vehicleService, IBookingService bookingService)
    {
        _vehicleService = vehicleService;
        _bookingService = bookingService;
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetOwnerVehicles()
    {
        var vehicles = await _vehicleService.GetOwnerVehiclesAsync();
        return Ok(vehicles);
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetOwnerBookings()
    {
        var bookings = await _bookingService.GetOwnerBookingsAsync();
        return Ok(bookings);
    }

    [HttpPatch("bookings/{id}/accept")]
    public async Task<IActionResult> AcceptBooking(int id)
    {
        await _bookingService.AcceptAsync(id);
        return NoContent();
    }

    [HttpPatch("bookings/{id}/reject")]
    public async Task<IActionResult> RejectBooking(int id)
    {
        await _bookingService.RejectAsync(id);
        return NoContent();
    }
}
