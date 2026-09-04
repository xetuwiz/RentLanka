using RentLanka.Api.Dtos;

namespace RentLanka.Api.Services;

public interface IVehicleService
{
    Task<IEnumerable<VehicleResponseDto>> GetAllAsync();
    Task<VehicleResponseDto> GetByIdAsync(int id);
    Task<IEnumerable<VehicleResponseDto>> SearchAsync(VehicleSearchRequest request);
    Task<IEnumerable<VehicleResponseDto>> FindNearbyAsync(decimal lat, decimal lng, decimal radiusKm);
    Task<VehicleResponseDto> CreateAsync(VehicleRequestDto dto, int ownerId);
    Task<VehicleResponseDto> UpdateAsync(int id, VehicleRequestDto dto, int userId);
    Task UpdateStatusAsync(int id, string status, int userId);
    Task DeleteAsync(int id, int userId);
    Task<IEnumerable<VehicleResponseDto>> GetOwnerVehiclesAsync(int ownerId);
}
