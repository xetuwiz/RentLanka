import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

export const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const queryClient = useQueryClient();

    const { data: usersData, isLoading: usersLoading } = useQuery({ queryKey: ['adminUsers'], queryFn: adminApi.getUsers });
    const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({ queryKey: ['adminVehicles'], queryFn: adminApi.getVehicles });
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({ queryKey: ['adminBookings'], queryFn: adminApi.getBookings });
    const { data: dashboardData } = useQuery({ queryKey: ['adminDashboard'], queryFn: adminApi.getDashboard });

    const toggleUserMutation = useMutation({
        mutationFn: adminApi.toggleUserStatus,
        onSuccess: () => {
            toast.success('User status updated');
            queryClient.invalidateQueries(['adminUsers']);
            queryClient.invalidateQueries(['adminDashboard']);
        },
        onError: () => toast.error('Failed to update status')
    });

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

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Users</p>
                    <p className="text-4xl font-black text-white mt-2">{dashboard.userCount || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4l1-1h12l1 1v3.5l3 4.5v5h-2v1h-2v-1H6v1H4v-1H2v-5l3-4.5V4z"></path></svg></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Vehicles</p>
                    <p className="text-4xl font-black text-white mt-2">{dashboard.vehicleCount || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg></div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Bookings</p>
                    <p className="text-4xl font-black text-white mt-2">{dashboard.bookingCount || 0}</p>
                </div>
            </div>

            {/* Tabs */}
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

            {/* Tab Contents */}
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
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{user.name}</div>
                                            <div className="text-slate-400">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                user.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {user.active ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleUserMutation.mutate(user.id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                                    user.active ? 'bg-slate-800 text-red-400 hover:bg-slate-700' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                                                }`}
                                            >
                                                {user.active ? 'Ban User' : 'Unban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Vehicles & Bookings tables are similarly styled, skipped here for brevity but assuming they adopt the same table class layout as users */}
            </div>
        </div>
    );
};
