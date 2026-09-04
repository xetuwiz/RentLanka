import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerApi, vehiclesApi } from '../../api/endpoints';
import { VehicleFormModal } from '../../components/vehicles/VehicleFormModal';
import toast from 'react-hot-toast';

export const OwnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('vehicles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const queryClient = useQueryClient();

    const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
        queryKey: ['ownerVehicles'],
        queryFn: ownerApi.getVehicles,
        staleTime: 1000 * 60 * 2
    });

    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['ownerBookings'],
        queryFn: ownerApi.getBookings,
        staleTime: 1000 * 60 * 2
    });

    const vehicles = vehiclesData?.data || [];
    const bookings = bookingsData?.data || [];

    const acceptMutation = useMutation({
        mutationFn: ownerApi.acceptBooking,
        onSuccess: () => { toast.success('Booking accepted'); queryClient.invalidateQueries(['ownerBookings']); },
        onError: () => toast.error('Failed to accept booking')
    });

    const rejectMutation = useMutation({
        mutationFn: ownerApi.rejectBooking,
        onSuccess: () => { toast.success('Booking rejected'); queryClient.invalidateQueries(['ownerBookings']); },
        onError: () => toast.error('Failed to reject booking')
    });

    const deleteVehicleMutation = useMutation({
        mutationFn: vehiclesApi.delete,
        onSuccess: () => { toast.success('Vehicle deleted'); queryClient.invalidateQueries(['ownerVehicles']); },
        onError: () => toast.error('Failed to delete vehicle')
    });

    const handleDeleteVehicle = (id) => {
        if (window.confirm("Are you sure you want to permanently delete this vehicle?")) {
            deleteVehicleMutation.mutate(id);
        }
    };

    if (vehiclesLoading || bookingsLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Owner Dashboard</h1>
                    <p className="text-slate-400 mt-1">Manage your fleet and bookings.</p>
                </div>
                {activeTab === 'vehicles' && (
                    <button 
                        onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        List New Vehicle
                    </button>
                )}
            </div>

            <div className="flex gap-2 mb-6 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 inline-flex">
                <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`px-5 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                        activeTab === 'vehicles' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    My Vehicles ({vehicles.length})
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`px-5 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                        activeTab === 'bookings' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    Bookings ({bookings.length})
                </button>
            </div>

            {activeTab === 'vehicles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vehicles.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-slate-900 rounded-2xl border border-slate-800">
                            <p className="text-slate-400">You haven't listed any vehicles yet.</p>
                        </div>
                    ) : vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        vehicle.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
                                        vehicle.status === 'BOOKED' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {vehicle.status}
                                    </span>
                                    <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded text-xs">{vehicle.vehicleType}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{vehicle.brand} {vehicle.model}</h3>
                                <p className="text-sm text-slate-400 mb-4">{vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}</p>
                                <p className="text-2xl font-black text-white">LKR {Number(vehicle.pricePerDay).toLocaleString()}<span className="text-sm text-slate-400 font-normal">/day</span></p>
                            </div>
                            <div className="bg-slate-800/50 p-4 border-t border-slate-800 flex gap-2">
                                <button 
                                    onClick={() => { setEditingVehicle(vehicle); setIsModalOpen(true); }}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-2 rounded-lg transition-colors border border-red-500/20 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Dates</th>
                                    <th className="px-6 py-4 font-semibold">Total Price</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {bookings.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No bookings found.</td></tr>
                                ) : bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white">{booking.vehicleName}</td>
                                        <td className="px-6 py-4 text-slate-300">{booking.customerName}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-400">LKR {Number(booking.totalPrice).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            {booking.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => acceptMutation.mutate(booking.id)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-bold rounded hover:bg-emerald-500/30 transition-colors">Accept</button>
                                                    <button onClick={() => rejectMutation.mutate(booking.id)} className="px-3 py-1.5 bg-red-500/20 text-red-400 font-bold rounded hover:bg-red-500/30 transition-colors">Reject</button>
                                                </div>
                                            ) : (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    booking.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>{booking.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <VehicleFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                vehicle={editingVehicle}
                onSuccess={() => queryClient.invalidateQueries(['ownerVehicles'])} 
            />
        </div>
    );
};
