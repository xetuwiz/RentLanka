namespace RentLanka.Api.Dtos;

public class RegisterDto
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Role { get; set; } = "CUSTOMER";
}

public class LoginDto
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RefreshTokenDto
{
    public string RefreshToken { get; set; } = "";
}

public class LogoutDto
{
    public string RefreshToken { get; set; } = "";
}

public class AuthResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string Token { get; set; } = "";
    public string RefreshToken { get; set; } = "";
}