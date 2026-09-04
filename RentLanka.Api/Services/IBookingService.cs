using RentLanka.Api.Dtos;

namespace RentLanka.Api.Services;

public interface IBookingService
{
    Task<BookingResponseDto> CreateAsync(
        BookingRequestDto dto,
        int customerId);

    Task<IEnumerable<BookingResponseDto>> GetCustomerBookingsAsync(
        int customerId);

    Task<BookingResponseDto> GetBookingByIdAsync(
        int id,
        int userId);

    Task CancelAsync(
        int id,
        int customerId);

    Task AcceptAsync(
        int id,
        int ownerId);

    Task RejectAsync(
        int id,
        int ownerId);
}