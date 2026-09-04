using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentLanka.Api.Dtos;
using RentLanka.Api.Services;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingRequestDto dto)
    {
        try
        {
            var booking = await _bookingService.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { title = ex.Message });
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings() => Ok(await _bookingService.GetCustomerBookingsAsync(GetUserId()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var booking = await _bookingService.GetByIdAsync(id);
            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            await _bookingService.CancelAsync(id, GetUserId());
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { title = ex.Message });
        }
    }
}
