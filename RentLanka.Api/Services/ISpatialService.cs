using RentLanka.Api.Models;

namespace RentLanka.Api.Services;

public interface ISpatialService
{
    Task<IEnumerable<SpatialUnit>> GetByTypeAsync(string type);
    Task<SpatialUnit> GetByIdAsync(int id);
    Task<IEnumerable<SpatialUnit>> GetChildrenAsync(int parentId);
    Task<IEnumerable<SpatialUnit>> SearchAsync(string query);
}
