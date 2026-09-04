import { Link } from 'react-router-dom';

export const VehicleCard = ({ vehicle }) => {
    return (
        <div className="card group flex flex-col h-full hover:-translate-y-1">
            <div className="relative h-48 w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="text-slate-600 font-medium tracking-widest uppercase text-sm group-hover:scale-110 transition-transform duration-500 z-10">
                    {vehicle.brand}
                </div>
                <div className="absolute top-3 right-3 z-10">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-lg backdrop-blur-sm ${
                        vehicle.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        vehicle.status === 'BOOKED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                        {vehicle.status}
                    </span>
                </div>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-slate-400 text-sm mt-0.5">{vehicle.year} • {vehicle.vehicleType}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-4 mb-5 text-sm text-slate-300">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <span>{vehicle.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span>{vehicle.transmission}</span>
                    </div>
                    {vehicle.spatialUnitName && (
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="truncate max-w-[80px]" title={vehicle.spatialUnitName}>{vehicle.spatialUnitName}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">Daily Rate</p>
                        <p className="text-lg font-bold text-indigo-400">LKR {Number(vehicle.pricePerDay).toLocaleString()}</p>
                    </div>
                    <Link
                        to={`/book/${vehicle.id}`}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md ${
                            vehicle.status === 'AVAILABLE' 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40' 
                            : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                        }`}
                        onClick={(e) => vehicle.status !== 'AVAILABLE' && e.preventDefault()}
                    >
                        {vehicle.status === 'AVAILABLE' ? 'Book Now' : 'Unavailable'}
                    </Link>
                </div>
            </div>
        </div>
    );
};


