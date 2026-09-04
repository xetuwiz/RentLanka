import { useState, useRef, useEffect } from 'react';
import { useSpatialSearch } from '../../hooks/useSpatialSearch';

export const SpatialUnitSearch = ({ onSelect, selectedUnit, placeholder = "Search locations..." }) => {
    const [searchTerm, setSearchTerm] = useState(selectedUnit?.name || '');
    const [isOpen, setIsOpen] = useState(false);
    const { data: results = [], isLoading } = useSpatialSearch(searchTerm);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (selectedUnit) setSearchTerm(selectedUnit.name);
    }, [selectedUnit]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <input
                    type="text"
                    className="input-field pl-10"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') onSelect(null);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <ul className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {results.map((unit) => (
                        <li
                            key={unit.id}
                            className="px-4 py-3 hover:bg-indigo-500/10 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors"
                            onMouseDown={() => {
                                setSearchTerm(unit.name);
                                onSelect(unit);
                                setIsOpen(false);
                            }}
                        >
                            <div className="text-white font-medium">{unit.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{unit.type} • {unit.pcode}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
