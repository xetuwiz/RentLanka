using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Models;

namespace RentLanka.Api.Services;

public class SpatialService : ISpatialService
{
    private readonly AppDbContext _db;

    public SpatialService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<SpatialUnit>> GetByTypeAsync(string type)
    {
        return await _db.SpatialUnits
            .Where(s => s.Type == type && s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<SpatialUnit> GetByIdAsync(int id)
    {
        var unit = await _db.SpatialUnits.FindAsync(id);
        if (unit == null) throw new KeyNotFoundException("Spatial unit not found");
        return unit;
    }

    public async Task<IEnumerable<SpatialUnit>> GetChildrenAsync(int parentId)
    {
        return await _db.SpatialUnits
            .Where(s => s.ParentId == parentId && s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<SpatialUnit>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return Enumerable.Empty<SpatialUnit>();

        var lower = query.ToLower();
        var allowedTypes = new[] { "COUNTRY", "PROVINCE", "DISTRICT", "DS_DIVISION" };

        return await _db.SpatialUnits
            .Where(s => s.IsActive && allowedTypes.Contains(s.Type) &&
                        (s.Name.ToLower().Contains(lower) || s.Pcode.ToLower().Contains(lower)))
            .OrderBy(s => s.Name)
            .Take(20)
            .ToListAsync();
    }
}
