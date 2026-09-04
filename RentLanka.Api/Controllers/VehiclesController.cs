using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentLanka.Api.Dtos;
using RentLanka.Api.Services;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _vehicleService.GetAllAsync());

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) => Ok(await _vehicleService.GetByIdAsync(id));

    [AllowAnonymous]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] VehicleSearchRequest request)
        => Ok(await _vehicleService.SearchAsync(request));

    [AllowAnonymous]
    [HttpGet("nearby")]
    public async Task<IActionResult> Nearby([FromQuery] decimal lat, [FromQuery] decimal lng, [FromQuery] decimal radius = 10)
        => Ok(await _vehicleService.FindNearbyAsync(lat, lng, radius));

    [HttpPost]
    [Authorize(Roles = "OWNER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] VehicleRequestDto dto)
    {
        var vehicle = await _vehicleService.CreateAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "OWNER,ADMIN")]
    public async Task<IActionResult> Update(int id, [FromBody] VehicleRequestDto dto)
        => Ok(await _vehicleService.UpdateAsync(id, dto, GetUserId()));

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "OWNER,ADMIN")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        await _vehicleService.UpdateStatusAsync(id, status, GetUserId());
        return NoContent();
    }
}


