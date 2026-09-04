namespace RentLanka.Api.Dtos;

public class BookingRequestDto
{
    public int VehicleId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}

public class BookingResponseDto
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public string VehicleName { get; set; } = "";

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public decimal TotalPrice { get; set; }

    public string Status { get; set; } = "";

    public DateTime CreatedAt { get; set; }
}