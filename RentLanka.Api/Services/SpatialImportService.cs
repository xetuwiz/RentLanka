using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RentLanka.Api.Data;
using RentLanka.Api.Models;

namespace RentLanka.Api.Services;

/// <summary>
/// Reads lka_adminpoints.geojson (a centroid point file with admin_level 0-3)
/// and populates the SpatialUnits table up to DS Division only (no GN / admin4).
/// </summary>
public class SpatialImportService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<SpatialImportService> _logger;

    public SpatialImportService(AppDbContext db, IWebHostEnvironment env, ILogger<SpatialImportService> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    public async Task ImportAllAsync()
    {
        if (await _db.SpatialUnits.AnyAsync())
        {
            _logger.LogInformation("Spatial units already exist – skipping import");
            return;
        }

        var path = Path.Combine(_env.ContentRootPath, "GeoData", "lka_adminpoints.geojson");
        if (!File.Exists(path))
        {
            _logger.LogWarning("lka_adminpoints.geojson not found at {Path} – spatial import skipped", path);
            return;
        }

        _logger.LogInformation("Importing spatial units from {Path}...", path);

        var typeMap = new Dictionary<int, string>
        {
            { 0, "COUNTRY"     },
            { 1, "PROVINCE"    },
            { 2, "DISTRICT"    },
            { 3, "DS_DIVISION" }
            // level 4 (GN Division) is intentionally excluded
        };

        var pcodeFields = new[] { "adm0_pcode", "adm1_pcode", "adm2_pcode", "adm3_pcode" };
        var nameFields  = new[] { "adm0_name",  "adm1_name",  "adm2_name",  "adm3_name"  };

        var json = await File.ReadAllTextAsync(path);
        using var doc = JsonDocument.Parse(json);
        var features = doc.RootElement.GetProperty("features");

        // Group features by level, process 0→3 in order so parent IDs are available
        var byLevel = new Dictionary<int, List<JsonElement>>();
        foreach (var feature in features.EnumerateArray())
        {
            var props = feature.GetProperty("properties");
            if (!props.TryGetProperty("admin_level", out var lvlEl)) continue;
            var level = lvlEl.GetInt32();
            if (!typeMap.ContainsKey(level)) continue; // skip GN (level 4) and others
            if (!byLevel.ContainsKey(level)) byLevel[level] = new();
            byLevel[level].Add(feature);
        }

        var pcodeToId = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var level in new[] { 0, 1, 2, 3 })
        {
            if (!byLevel.TryGetValue(level, out var levelFeatures)) continue;

            var seen  = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var batch = new List<SpatialUnit>();

            foreach (var feature in levelFeatures)
            {
                var props = feature.GetProperty("properties");

                // Use this level's pcode field
                var pcode = TryGet(props, pcodeFields[level]);
                if (string.IsNullOrWhiteSpace(pcode) || !seen.Add(pcode)) continue;

                var name   = TryGet(props, nameFields[level])
                          ?? TryGet(props, "name")
                          ?? pcode;
                var nameSi = TryGet(props, "name1");
                var nameTa = TryGet(props, "name2");

                // Coordinates from Point geometry
                decimal? lat = null, lng = null;
                if (feature.TryGetProperty("geometry", out var geom) &&
                    geom.ValueKind != JsonValueKind.Null &&
                    geom.TryGetProperty("coordinates", out var coords))
                {
                    var arr = coords.EnumerateArray().ToArray();
                    if (arr.Length >= 2)
                    {
                        lng = arr[0].GetDecimal();
                        lat = arr[1].GetDecimal();
                    }
                }

                // Parent pcode is one level up
                int? parentId = null;
                if (level > 0)
                {
                    var parentPcode = TryGet(props, pcodeFields[level - 1]);
                    if (!string.IsNullOrEmpty(parentPcode) && pcodeToId.TryGetValue(parentPcode, out var pid))
                        parentId = pid;
                }

                batch.Add(new SpatialUnit
                {
                    Pcode       = pcode,
                    Name        = name,
                    NameSinhala = nameSi,
                    NameTamil   = nameTa,
                    Type        = typeMap[level],
                    Latitude    = lat,
                    Longitude   = lng,
                    ParentId    = parentId,
                    IsActive    = true,
                    IsTracked   = true
                });
            }

            if (batch.Any())
            {
                await _db.SpatialUnits.AddRangeAsync(batch);
                await _db.SaveChangesAsync();
                foreach (var u in batch)
                    pcodeToId[u.Pcode] = u.Id;
                _logger.LogInformation("Imported {Count} {Type} units", batch.Count, typeMap[level]);
            }
        }

        _logger.LogInformation("Spatial import complete.");
    }

    private static string? TryGet(JsonElement props, string key)
    {
        if (props.TryGetProperty(key, out var val) &&
            val.ValueKind == JsonValueKind.String)
        {
            var s = val.GetString();
            return string.IsNullOrWhiteSpace(s) ? null : s;
        }
        return null;
    }
}
