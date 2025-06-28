import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Custom marker icon
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useTranslation } from "react-i18next";

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const location = {
  name: "FPT University",
  position: [21.013483, 105.525307],
};

// Component để thêm Layer Control vào bản đồ
function BaseLayerControl() {
  const map = useMap();
  const { t } = useTranslation("map"); // bạn có thể thay "map" bằng namespace bạn dùng

  useEffect(() => {
    const baseMaps = {
      [t("layer.osm")]: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
        }
      ),
      [t("layer.satellite")]: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; Source: Esri",
        }
      ),
      [t("layer.dark")]: L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        }
      ),
    };

    const control = L.control.layers(baseMaps).addTo(map);

    // Chọn lớp mặc định
    baseMaps[t("layer.osm")].addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, t]);

  return null;
}

function MapOSMOutside() {
  return (
    <MapContainer
      center={location.position}
      zoom={17}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "400px", marginTop: "1rem" }}
    >
      {/* Mặc định: tile layer sẽ được điều khiển trong BaseLayerControl */}
      <Marker position={location.position} icon={customIcon}>
        <Popup>{location.name}</Popup>
      </Marker>

      <BaseLayerControl />
    </MapContainer>
  );
}

export default MapOSMOutside;
