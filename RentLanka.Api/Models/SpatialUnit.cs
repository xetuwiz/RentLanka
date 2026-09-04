using System.ComponentModel.DataAnnotations;

namespace RentLanka.Api.Models;

public class SpatialUnit
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Pcode { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? NameSinhala { get; set; }

    [MaxLength(150)]
    public string? NameTamil { get; set; }

    [Required, MaxLength(30)]
    public string Type { get; set; } = string.Empty; // COUNTRY, PROVINCE, DISTRICT, DS_DIVISION

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public int? ParentId { get; set; }
    public SpatialUnit? Parent { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsTracked { get; set; } = true;

    public ICollection<SpatialUnit> Children { get; set; } = new List<SpatialUnit>();
}