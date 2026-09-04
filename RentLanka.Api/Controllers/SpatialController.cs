using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentLanka.Api.Services;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SpatialController : ControllerBase
{
    private readonly ISpatialService _spatialService;

    public SpatialController(ISpatialService spatialService)
    {
        _spatialService = spatialService;
    }

    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
        => Ok(await _spatialService.GetByTypeAsync("PROVINCE"));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => Ok(await _spatialService.GetByIdAsync(id));

    [HttpGet("{id:int}/children")]
    public async Task<IActionResult> GetChildren(int id)
        => Ok(await _spatialService.GetChildrenAsync(id));

    // Allow anonymous so autocomplete works on the browse/map page before login
    [AllowAnonymous]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
        => Ok(await _spatialService.SearchAsync(q));
}
