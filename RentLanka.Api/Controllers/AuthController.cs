using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Dtos;
using RentLanka.Api.Models;
using RentLanka.Api.Services;

namespace RentLanka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;

    public AuthController(
        AppDbContext db,
        JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name is required." });

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required." });

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Password is required." });

        if (dto.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        var email = dto.Email.Trim().ToLower();

        var existingUser = await _db.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (existingUser != null)
            return Conflict(new { message = "An account with this email already exists." });

        var role = dto.Role?.ToUpper() == "OWNER"
            ? "OWNER"
            : "CUSTOMER";

        var user = new User
        {
            Name = dto.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone?.Trim() ?? "",
            Role = role,
            Active = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        await _db.SaveChangesAsync();

        return Ok(new AuthResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = token,
            RefreshToken = refreshToken
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.Active)
            return Unauthorized(new { message = "Your account is inactive." });

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash);

        if (!passwordValid)
            return Unauthorized(new { message = "Invalid email or password." });

        var token = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        await _db.SaveChangesAsync();

        return Ok(new AuthResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = token,
            RefreshToken = refreshToken
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenDto dto)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

        if (user == null)
            return Unauthorized(new { message = "Invalid refresh token." });

        if (!user.Active)
            return Unauthorized(new { message = "Your account is inactive." });

        var token = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;

        await _db.SaveChangesAsync();

        return Ok(new AuthResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = token,
            RefreshToken = refreshToken
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutDto dto)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

        if (user != null)
        {
            user.RefreshToken = null;
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Logged out successfully." });
    }
}