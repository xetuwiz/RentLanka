import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, vehiclesApi } from '../../api/endpoints';
import { VehicleFormModal } from '../../components/vehicles/VehicleFormModal';
import toast from 'react-hot-toast';

export const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const queryClient = useQueryClient();

    const { data: usersData, isLoading: usersLoading } = useQuery({ queryKey: ['adminUsers'], queryFn: adminApi.getUsers });
    const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({ queryKey: ['adminVehicles'], queryFn: adminApi.getVehicles });
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({ queryKey: ['adminBookings'], queryFn: adminApi.getBookings });
    const { data: dashboardData } = useQuery({ queryKey: ['adminDashboard'], queryFn: adminApi.getDashboard });

    const toggleUserMutation = useMutation({
        mutationFn: adminApi.toggleUserStatus,
        onSuccess: () => { toast.success('User status updated'); queryClient.invalidateQueries(['adminUsers']); queryClient.invalidateQueries(['adminDashboard']); },
        onError: () => toast.error('Failed to update status')
    });

    const deleteUserMutation = useMutation({
        mutationFn: adminApi.deleteUser,
        onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries(['adminUsers']); queryClient.invalidateQueries(['adminDashboard']); },
        onError: () => toast.error('Failed to delete user')
    });

    const deleteVehicleMutation = useMutation({
        mutationFn: vehiclesApi.delete,
        onSuccess: () => { toast.success('Vehicle deleted'); queryClient.invalidateQueries(['adminVehicles']); queryClient.invalidateQueries(['adminDashboard']); },
        onError: () => toast.error('Failed to delete vehicle')
    });

    const deleteBookingMutation = useMutation({
        mutationFn: adminApi.deleteBooking,
        onSuccess: () => { toast.success('Booking deleted'); queryClient.invalidateQueries(['adminBookings']); queryClient.invalidateQueries(['adminDashboard']); },
        onError: () => toast.error('Failed to delete booking')
    });

    const handleDelete = (type, id) => {
        if (!window.confirm(`Are you sure you want to permanently delete this ${type}? This action cannot be undone.`)) return;
        if (type === 'user') deleteUserMutation.mutate(id);
        if (type === 'vehicle') deleteVehicleMutation.mutate(id);
        if (type === 'booking') deleteBookingMutation.mutate(id);
    };

    const users = usersData?.data || [];
    const vehicles = vehiclesData?.data || [];
    const bookings = bookingsData?.data || [];
    const dashboard = dashboardData?.data || {};

    if (usersLoading || vehiclesLoading || bookingsLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">System Administration</h1>
                    <p className="text-slate-400 mt-1">Manage users, vehicles, and monitor platform activity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Users</p>
                    <p className="text-4xl font-black text-white mt-2">{dashboard.userCount || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Vehicles</p>
                    <p className="text-4xl font-black text-white mt-2">{dashboard.vehicleCount || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Bookings</p>
                    <p className="text-4xl font-black text-white mt-2">{dashboard.bookingCount || 0}</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 inline-flex">
                {['users', 'vehicles', 'bookings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                            activeTab === tab ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4"><div className="font-bold text-white">{user.name}</div><div className="text-slate-400">{user.email}</div></td>
                                        <td className="px-6 py-4"><span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">{user.role}</span></td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{user.active ? 'Active' : 'Banned'}</span></td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {user.role !== 'ADMIN' && (
                                                <>
                                                    <button onClick={() => toggleUserMutation.mutate(user.id)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${user.active ? 'bg-slate-800 text-orange-400 hover:bg-slate-700' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'}`}>
                                                        {user.active ? 'Ban' : 'Unban'}
                                                    </button>
                                                    <button onClick={() => handleDelete('user', user.id)} className="px-3 py-1.5 text-xs font-bold rounded-md transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {activeTab === 'vehicles' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                                    <th className="px-6 py-4 font-semibold">Owner</th>
                                    <th className="px-6 py-4 font-semibold">Price/Day</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4"><div className="font-bold text-white">{vehicle.brand} {vehicle.model}</div><div className="text-slate-400">{vehicle.year} • {vehicle.vehicleType}</div></td>
                                        <td className="px-6 py-4 text-slate-300">{vehicle.owner?.name || `ID: ${vehicle.ownerId}`}</td>
                                        <td className="px-6 py-4 text-emerald-400 font-medium">LKR {vehicle.pricePerDay}</td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${vehicle.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{vehicle.status}</span></td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => { setEditingVehicle(vehicle); setIsModalOpen(true); }} className="px-3 py-1.5 text-xs font-bold rounded-md bg-slate-800 text-blue-400 hover:bg-slate-700">Edit</button>
                                            <button onClick={() => handleDelete('vehicle', vehicle.id)} className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Booking ID</th>
                                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Dates</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-400">#{booking.id}</td>
                                        <td className="px-6 py-4"><div className="font-bold text-white">{booking.vehicle?.brand} {booking.vehicle?.model}</div></td>
                                        <td className="px-6 py-4 text-slate-300">{booking.customer?.name || `ID: ${booking.customerId}`}</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(booking.startDate).toLocaleDateString()} - <br/>{new Date(booking.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete('booking', booking.id)} className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <VehicleFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                vehicle={editingVehicle}
                onSuccess={() => queryClient.invalidateQueries(['adminVehicles'])} 
            />
        </div>
    );
};
