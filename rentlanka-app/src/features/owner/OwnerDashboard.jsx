import React, { useEffect, useState } from 'react';
// import { ownerApi } from '../../api/ownerApi'; // Assuming this API service will be created

export default function OwnerDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Uncomment and use when ownerApi is implemented
      // const [vehiclesData, bookingsData] = await Promise.all([
      //   ownerApi.getVehicles(),
      //   ownerApi.getBookings()
      // ]);
      // setVehicles(vehiclesData);
      // setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching owner dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (id) => {
    try {
      // await ownerApi.acceptBooking(id);
      fetchDashboardData();
    } catch (error) {
      console.error("Error accepting booking", error);
    }
  };

  const handleRejectBooking = async (id) => {
    try {
      // await ownerApi.rejectBooking(id);
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting booking", error);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Vehicles</h2>
        {vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles found.</p>
        ) : (
          <ul className="space-y-2">
            {vehicles.map(vehicle => (
              <li key={vehicle.id} className="p-4 border rounded shadow-sm">
                {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map(booking => (
              <li key={booking.id} className="p-4 border rounded shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-medium">Booking #{booking.id}</p>
                  <p className="text-sm text-gray-600">Vehicle: {booking.vehicleId} | Status: {booking.status}</p>
                </div>
                {booking.status === 'Pending' && (
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleAcceptBooking(booking.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRejectBooking(booking.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
