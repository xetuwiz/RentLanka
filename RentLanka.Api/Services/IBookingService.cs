using RentLanka.Api.Dtos;

namespace RentLanka.Api.Services;

public interface IBookingService
{
    Task<BookingResponseDto> CreateAsync(BookingRequestDto dto, int customerId);
    Task<IEnumerable<BookingResponseDto>> GetCustomerBookingsAsync(int customerId);
    Task<IEnumerable<BookingResponseDto>> GetOwnerBookingsAsync(int ownerId);
    Task<BookingResponseDto> GetByIdAsync(int id);
    Task CancelAsync(int id, int customerId);
    Task AcceptAsync(int id, int ownerId);
    Task RejectAsync(int id, int ownerId);
}
