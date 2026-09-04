using System.ComponentModel.DataAnnotations;

namespace RentLanka.Api.Models;

public class Vehicle
{
    public int Id { get; set; }

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public int? SpatialUnitId { get; set; }
    public SpatialUnit? SpatialUnit { get; set; }

    [Required, MaxLength(30)]
    public string VehicleType { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Brand { get; set; }

    [MaxLength(50)]
    public string? Model { get; set; }

    public int? Year { get; set; }

    public string? Description { get; set; }

    [Range(0, 100000)]
    public decimal PricePerDay { get; set; }

    public int? Seats { get; set; }

    [MaxLength(20)]
    public string? Transmission { get; set; }

    [MaxLength(20)]
    public string? FuelType { get; set; }

    [Range(-90, 90)]
    public decimal? Latitude { get; set; }

    [Range(-180, 180)]
    public decimal? Longitude { get; set; }

    public string Status { get; set; } = "AVAILABLE";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}