import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";

// Fix Leaflet default marker icon broken by Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Sri Lanka geographic centre
const SRI_LANKA_CENTER = [7.8731, 80.7718];

export const VehicleMap = ({ vehicles = [], center, zoom = 8 }) => {
    const mapCenter = center || SRI_LANKA_CENTER;
    const withCoords = vehicles.filter((v) => v.latitude && v.longitude);

    return (
        <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: "400px", width: "100%" }}
            className="z-0 rounded-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withCoords.map((vehicle) => (
                <Marker key={vehicle.id} position={[vehicle.latitude, vehicle.longitude]}>
                    <Popup>
                        <div className="text-sm min-w-[140px]">
                            <p className="font-bold text-gray-800">
                                {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="text-gray-600">
                                LKR {Number(vehicle.pricePerDay).toLocaleString()} / day
                            </p>
                            <p className="text-xs text-gray-500 mb-2">{vehicle.vehicleType}</p>
                            <Link
                                to={`/vehicles/${vehicle.id}`}
                                className="text-blue-600 hover:underline text-xs font-medium"
                            >
                                View details →
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};
