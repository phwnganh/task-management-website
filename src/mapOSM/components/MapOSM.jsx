import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Tạo custom icon rõ ràng
const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Vị trí công ty
const location = {
  name: "FPT University",
  position: [21.013483, 105.525307],
};

function MapOSM() {
  return (
    <MapContainer
      center={location.position}
      zoom={17}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "350px", marginTop: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={location.position} icon={customIcon}>
        <Popup>{location.name}</Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapOSM;
