import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { vehiclesApi, spatialApi } from "../../api/endpoints";
import { SpatialUnitSearch } from "../common/SpatialUnitSearch";
import toast from "react-hot-toast";

export const VehicleFormModal = ({ isOpen, onClose, vehicle = null, onSuccess }) => {
    const { register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (vehicle) {
                reset({
                    brand: vehicle.brand || '',
                    model: vehicle.model || '',
                    year: vehicle.year || new Date().getFullYear(),
                    vehicleType: vehicle.vehicleType || 'CAR',
                    pricePerDay: vehicle.pricePerDay || 0,
                    seats: vehicle.seats || 4,
                    transmission: vehicle.transmission || 'Automatic',
                    fuelType: vehicle.fuelType || 'Petrol',
                    description: vehicle.description || '',
                    spatialUnitId: vehicle.spatialUnitId || null,
                    latitude: vehicle.latitude || null,
                    longitude: vehicle.longitude || null
                });

                if (vehicle.spatialUnitId) {
                    spatialApi.getById(vehicle.spatialUnitId).then(res => {
                        setSelectedLocation(res.data);
                    }).catch(console.error);
                } else {
                    setSelectedLocation(null);
                }
            } else {
                reset({
                    brand: '', model: '', year: new Date().getFullYear(),
                    vehicleType: 'CAR', pricePerDay: '', seats: 4,
                    transmission: 'Automatic', fuelType: 'Petrol', description: '',
                    spatialUnitId: null, latitude: null, longitude: null
                });
                setSelectedLocation(null);
            }
        }
    }, [isOpen, vehicle, reset]);

    const handleLocationSelect = (unit) => {
        setSelectedLocation(unit);
        setValue('spatialUnitId', unit ? unit.id : null);
        setValue('latitude', unit ? unit.latitude : null);
        setValue('longitude', unit ? unit.longitude : null);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const payload = { 
                ...data, 
                year: parseInt(data.year), 
                pricePerDay: parseFloat(data.pricePerDay), 
                seats: parseInt(data.seats) 
            };
            if (vehicle) {
                await vehiclesApi.update(vehicle.id, payload);
                toast.success("Vehicle updated successfully");
            } else {
                await vehiclesApi.create(payload);
                toast.success("Vehicle listed successfully");
            }
            onSuccess();
            onClose();
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                Object.keys(serverErrors).forEach(key => {
                    const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                    setError(fieldName, { type: 'server', message: serverErrors[key][0] });
                });
                toast.error("Please fix the validation errors.");
            } else {
                toast.error(error.response?.data?.title || "Operation failed");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white">
                        {vehicle ? 'Edit Vehicle' : 'List a New Vehicle'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Brand</label>
                                <input {...register("brand", { required: "Brand is required" })} className="input-field" placeholder="Toyota" />
                                {errors.brand && <p className="mt-1 text-xs text-red-400">{errors.brand.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Model</label>
                                <input {...register("model", { required: "Model is required" })} className="input-field" placeholder="Prius" />
                                {errors.model && <p className="mt-1 text-xs text-red-400">{errors.model.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                                <input type="number" {...register("year")} className="input-field" placeholder="2020" />
                                {errors.year && <p className="mt-1 text-xs text-red-400">{errors.year.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                <select {...register("vehicleType")} className="input-field">
                                    <option value="CAR">Car</option>
                                    <option value="VAN">Van</option>
                                    <option value="SUV">SUV</option>
                                    <option value="BIKE">Bike</option>
                                </select>
                                {errors.vehicleType && <p className="mt-1 text-xs text-red-400">{errors.vehicleType.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Price per day (LKR)</label>
                                <input type="number" step="0.01" {...register("pricePerDay", { required: "Price is required", min: { value: 1, message: "Price must be greater than 0" } })} className="input-field" placeholder="15000" />
                                {errors.pricePerDay && <p className="mt-1 text-xs text-red-400">{errors.pricePerDay.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Seats</label>
                                <input type="number" {...register("seats")} className="input-field" />
                                {errors.seats && <p className="mt-1 text-xs text-red-400">{errors.seats.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Transmission</label>
                                <select {...register("transmission")} className="input-field">
                                    <option value="Automatic">Automatic</option>
                                    <option value="Manual">Manual</option>
                                </select>
                                {errors.transmission && <p className="mt-1 text-xs text-red-400">{errors.transmission.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Fuel Type</label>
                                <select {...register("fuelType")} className="input-field">
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Electric">Electric</option>
                                </select>
                                {errors.fuelType && <p className="mt-1 text-xs text-red-400">{errors.fuelType.message}</p>}
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                            <SpatialUnitSearch 
                                selectedUnit={selectedLocation}
                                onSelect={handleLocationSelect}
                                placeholder="Search District or Division..."
                            />
                            {errors.spatialUnitId && <p className="mt-1 text-xs text-red-400">{errors.spatialUnitId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea {...register("description")} className="input-field h-24 resize-none" placeholder="Vehicle details..."></textarea>
                            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
                        </div>
                    </form>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="vehicle-form" 
                        disabled={submitting}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'List Vehicle')}
                    </button>
                </div>
            </div>
        </div>
    );
};
