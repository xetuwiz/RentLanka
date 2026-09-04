using System.ComponentModel.DataAnnotations;

namespace RentLanka.Api.Dtos;

public record RegisterDto(
    [Required] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    string? Phone,
    string? Role
);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RefreshTokenDto([Required] string RefreshToken);
public record LogoutDto([Required] string RefreshToken);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    int UserId,
    string Name,
    string Email,
    string Role
);
