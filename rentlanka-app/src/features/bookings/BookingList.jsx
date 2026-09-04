import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../../api/endpoints";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const statusStyles = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ACCEPTED: "bg-green-500/20 text-green-400 border-green-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const BookingList = () => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["myBookings"],
        queryFn: () => bookingsApi.getMy().then((r) => r.data),
        staleTime: 1000 * 60 * 2,
    });

    const bookings = Array.isArray(data) ? data : [];

    const cancelBooking = async (id) => {
        if (!confirm("Cancel this booking?")) return;
        try {
            await bookingsApi.cancel(id);
            toast.success("Booking cancelled");
            refetch();
        } catch {
            toast.error("Failed to cancel booking");
        }
    };

    if (isLoading) return <div className="text-center py-10 text-white">Loading bookings...</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white mb-6">My Bookings</h1>
            {bookings.length === 0 ? (
                <p className="text-slate-400">
                    No bookings yet.{" "}
                    <Link to="/dashboard" className="text-blue-400 hover:underline">
                        Browse vehicles
                    </Link>
                </p>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div>
                                <p className="text-white font-bold text-lg mb-1">{booking.vehicleName}</p>
                                <p className="text-sm text-slate-400 mb-2">
                                    {new Date(booking.startDate).toLocaleDateString()} –{" "}
                                    {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-emerald-400 font-bold">
                                    LKR {Number(booking.totalPrice).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                <span
                                    className={`px-3 py-1 rounded-md text-xs font-bold border ${
                                        statusStyles[booking.status] || statusStyles.CANCELLED
                                    }`}
                                >
                                    {booking.status}
                                </span>
                                {booking.status === "PENDING" && (
                                    <button
                                        onClick={() => cancelBooking(booking.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
