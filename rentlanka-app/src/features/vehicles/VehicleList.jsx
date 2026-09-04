import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../../api/endpoints';
import { VehicleCard } from '../../components/vehicles/VehicleCard';
import { SpatialUnitSearch } from '../../components/common/SpatialUnitSearch';
import { VehicleMap } from '../../components/map/VehicleMap';
import { useDebounce } from '../../hooks/useDebounce';

export const VehicleList = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [typeFilter, setTypeFilter] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['vehicles', debouncedSearch, selectedLocation?.id, typeFilter],
        queryFn: () => vehiclesApi.search({
            q: debouncedSearch,
            spatialUnitId: selectedLocation?.id,
            vehicleType: typeFilter
        })
    });

    const vehicles = data?.data || [];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800">
                <div className="absolute inset-0">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-7xl">
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                    </div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Find the perfect ride in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Sri Lanka</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-400 mx-auto mb-10">
                        Explore thousands of cars across the island. Book instantly with verified owners.
                    </p>

                    {/* Search Controls inside Hero */}
                    <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col md:flex-row gap-4">
                        <div className="flex-1 text-left">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                            <SpatialUnitSearch
                                onSelect={setSelectedLocation}
                                selectedUnit={selectedLocation}
                                placeholder="Search locations..."
                            />
                        </div>
                        <div className="flex-1 text-left">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Type</label>
                            <select
                                className="input-field cursor-pointer"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="CAR">Car</option>
                                <option value="VAN">Van</option>
                                <option value="SUV">SUV</option>
                                <option value="BIKE">Bike</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Available
                    </h2>
                    <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                viewMode === 'map' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Map
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium">Loading vehicles...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400">
                        Error loading vehicles. Please try again.
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No vehicles found</h3>
                        <p className="text-slate-400">Try adjusting your filters or location to find more results.</p>
                        <button 
                            onClick={() => { setTypeFilter(''); setSelectedLocation(null); }}
                            className="mt-6 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {vehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                        ))}
                    </div>
                ) : (
                    <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                        <VehicleMap vehicles={vehicles} />
                    </div>
                )}
            </div>
        </div>
    );
};

