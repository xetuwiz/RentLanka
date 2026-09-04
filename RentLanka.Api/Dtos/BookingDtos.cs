using System.ComponentModel.DataAnnotations;

namespace RentLanka.Api.Dtos;

public record BookingRequestDto(
    [Required] int VehicleId,
    [Required] DateTime StartDate,
    [Required] DateTime EndDate
);

public record BookingResponseDto(
    int Id,
    int VehicleId,
    string VehicleName,
    int CustomerId,
    string CustomerName,
    DateTime StartDate,
    DateTime EndDate,
    decimal TotalPrice,
    string Status
);
