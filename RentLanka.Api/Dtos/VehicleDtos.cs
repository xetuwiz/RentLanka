using System.ComponentModel.DataAnnotations;

namespace RentLanka.Api.Dtos;

public record VehicleRequestDto(
    int? SpatialUnitId,
    [Required] string VehicleType,
    string? Brand,
    string? Model,
    int? Year,
    string? Description,
    [Range(0, 100000)] decimal PricePerDay,
    int? Seats,
    string? Transmission,
    string? FuelType,
    decimal? Latitude,
    decimal? Longitude
);

public record VehicleResponseDto(
    int Id,
    string? Brand,
    string? Model,
    int? Year,
    decimal PricePerDay,
    string VehicleType,
    string Status,
    decimal? Latitude,
    decimal? Longitude,
    string OwnerName,
    int? SpatialUnitId,
    int? Seats,
    string? Transmission,
    string? FuelType,
    string? Description,
    string? SpatialUnitName
);

public record VehicleSearchRequest(
    int? SpatialUnitId,
    string? VehicleType,
    decimal? MinPrice,
    decimal? MaxPrice
);
