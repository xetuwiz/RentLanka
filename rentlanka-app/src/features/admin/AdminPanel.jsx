import React, { useEffect, useState } from 'react';
// import { adminApi } from '../../api/adminApi'; // Assuming this API service will be created

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'vehicles') fetchVehicles();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // const data = await adminApi.getUsers();
      // setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // const data = await adminApi.getVehicles();
      // setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // const data = await adminApi.getBookings();
      // setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      // await adminApi.toggleUserStatus(id);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status", error);
    }
  };

  const handleVehicleStatusChange = async (id, newStatus) => {
    try {
      // await adminApi.updateVehicleStatus(id, newStatus);
      fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle status", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button 
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'vehicles' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          Vehicles
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'bookings' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
      </div>

      {loading && <div className="mb-4 text-gray-500">Loading...</div>}

      {!loading && activeTab === 'users' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="text-center">
                  <td className="py-2 px-4 border-b">{user.id}</td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-2 px-4 border-b">
                    <button 
                      onClick={() => handleToggleUserStatus(user.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="mt-4 text-gray-500">No users found.</p>}
        </div>
      )}

      {!loading && activeTab === 'vehicles' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Vehicles</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Make / Model</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className="text-center">
                  <td className="py-2 px-4 border-b">{vehicle.id}</td>
                  <td className="py-2 px-4 border-b">{vehicle.make} {vehicle.model}</td>
                  <td className="py-2 px-4 border-b">{vehicle.status}</td>
                  <td className="py-2 px-4 border-b">
                    <select 
                      value={vehicle.status}
                      onChange={(e) => handleVehicleStatusChange(vehicle.id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && <p className="mt-4 text-gray-500">No vehicles found.</p>}
        </div>
      )}

      {!loading && activeTab === 'bookings' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Bookings</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">User ID</th>
                <th className="py-2 px-4 border-b">Vehicle ID</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="text-center">
                  <td className="py-2 px-4 border-b">{booking.id}</td>
                  <td className="py-2 px-4 border-b">{booking.userId}</td>
                  <td className="py-2 px-4 border-b">{booking.vehicleId}</td>
                  <td className="py-2 px-4 border-b">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="mt-4 text-gray-500">No bookings found.</p>}
        </div>
      )}
    </div>
  );
}
