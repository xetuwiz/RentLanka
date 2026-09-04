import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

export const OwnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('vehicles');
    const queryClient = useQueryClient();

    // Fetch owner's vehicles
    const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
        queryKey: ['ownerVehicles'],
        queryFn: ownerApi.getVehicles,
        staleTime: 1000 * 60 * 2
    });

    // Fetch owner's bookings
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['ownerBookings'],
        queryFn: ownerApi.getBookings,
        staleTime: 1000 * 60 * 2
    });

    const vehicles = vehiclesData?.data || [];
    const bookings = bookingsData?.data || [];

    // Accept booking mutation
    const acceptMutation = useMutation({
        mutationFn: ownerApi.acceptBooking,
        onSuccess: () => {
            toast.success('Booking accepted');
            queryClient.invalidateQueries(['ownerBookings']);
        },
        onError: () => toast.error('Failed to accept booking')
    });

    // Reject booking mutation
    const rejectMutation = useMutation({
        mutationFn: ownerApi.rejectBooking,
        onSuccess: () => {
            toast.success('Booking rejected');
            queryClient.invalidateQueries(['ownerBookings']);
        },
        onError: () => toast.error('Failed to reject booking')
    });

    if (vehiclesLoading || bookingsLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><div className="spinner-border text-primary" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white mb-6">👔 Owner Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${
                        activeTab === 'vehicles' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    My Vehicles ({vehicles.length})
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${
                        activeTab === 'bookings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Bookings ({bookings.length})
                </button>
            </div>

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
                <div>
                    {vehicles.length === 0 ? (
                        <p className="text-slate-400">You haven't listed any vehicles yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <h3 className="text-white font-bold">{vehicle.brand} {vehicle.model}</h3>
                                    <p className="text-sm text-slate-400">{vehicle.vehicleType}</p>
                                    <p className="text-emerald-400 font-bold mt-2">LKR {Number(vehicle.pricePerDay).toLocaleString()}/day</p>
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                                        vehicle.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                                        vehicle.status === 'BOOKED' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div>
                    {bookings.length === 0 ? (
                        <p className="text-slate-400">No bookings for your vehicles yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-bold">{booking.vehicleName}</p>
                                            <p className="text-sm text-slate-400">
                                                Customer: {booking.customerName}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-emerald-400 font-bold">LKR {Number(booking.totalPrice).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                booking.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                booking.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            {booking.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => acceptMutation.mutate(booking.id)}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => rejectMutation.mutate(booking.id)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
