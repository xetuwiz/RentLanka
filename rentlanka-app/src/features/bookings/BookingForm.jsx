import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi, vehiclesApi } from "../../api/endpoints";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export const BookingForm = () => {
    const { id: vehicleId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { data, isLoading: vehicleLoading } = useQuery({
        queryKey: ["vehicle", vehicleId],
        queryFn: () => vehiclesApi.getVehicle(vehicleId).then((r) => r.data),
        enabled: !!vehicleId,
    });

    const vehicle = data;

    const calculateTotal = () => {
        if (!startDate || !endDate || !vehicle) return 0;
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return Math.max(1, days) * vehicle.pricePerDay;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates");
            return;
        }
        if (startDate >= endDate) {
            toast.error("End date must be after start date");
            return;
        }
        if (!isAuthenticated()) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }
        setSubmitting(true);
        try {
            await bookingsApi.create({
                vehicleId: parseInt(vehicleId),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });
            toast.success("Booking created successfully!");
            navigate("/bookings");
        } catch (error) {
            toast.error(error.response?.data?.title || "Failed to create booking");
        } finally {
            setSubmitting(false);
        }
    };

    if (vehicleLoading) return <div className="text-center py-10 text-white">Loading vehicle details...</div>;
    if (!vehicle) return <div className="text-center py-10 text-red-400">Vehicle not found</div>;

    return (
        <div className="container mx-auto px-4 py-6 max-w-lg">
            <h1 className="text-3xl font-bold text-white mb-6">
                Book {vehicle.brand} {vehicle.model}
            </h1>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="mb-4">
                    <p className="text-slate-400">Price per day</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        LKR {Number(vehicle.pricePerDay).toLocaleString()}
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-sm text-slate-400 block mb-1">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={new Date()}
                            className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-white outline-none"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select start date"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-sm text-slate-400 block mb-1">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate || new Date()}
                            className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-white outline-none"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select end date"
                        />
                    </div>
                    <div className="mb-6">
                        <p className="text-slate-400">Total Price</p>
                        <p className="text-2xl font-bold text-white">
                            LKR {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || !startDate || !endDate}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {submitting ? "Booking..." : "Confirm Booking"}
                    </button>
                </form>
            </div>
        </div>
    );
};
