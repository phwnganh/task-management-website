import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useState, useRef } from "react";

// Custom icon
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Vị trí mặc định
const DEFAULT_DEST = [21.013483, 105.525307];

function Routing({ start, end, onRouteInfo }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end || !L.Routing) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: "blue", weight: 4 }] },
      createMarker: () => null,
    }).addTo(map);

    control.on("routesfound", (e) => {
      const route = e.routes[0];
      const summary = route.summary;
      onRouteInfo({
        distance: (summary.totalDistance / 1000).toFixed(2),
        time: Math.ceil(summary.totalTime / 60),
      });
    });

    return () => map.removeControl(control);
  }, [map, start, end, onRouteInfo]);

  return null;
}

function SearchBox({ onSelect }) {
  const map = useMap();
  const searchControlRef = useRef(null);

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    import("leaflet-control-geocoder").then(() => {
      if (searchControlRef.current) {
        map.removeControl(searchControlRef.current);
      }

      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        autoComplete: true,
        showMarker: false,
      });

      map.addControl(searchControl);
      searchControlRef.current = searchControl;

      map.on("geosearch/showlocation", (result) => {
        const { x, y, label } = result.location;
        onSelect([y, x], label);
        map.setView([y, x], 14);
      });
    });

    return () => {
      if (searchControlRef.current) {
        map.removeControl(searchControlRef.current);
        searchControlRef.current = null;
      }
      map.off("geosearch/showlocation");
    };
  }, [map, onSelect]);

  return null;
}

function ClickToAddMarker({ onClick }) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function BaseMapLayer({ mapType }) {
  const map = useMap();

  useEffect(() => {
    // Remove all existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add the selected tile layer
    let tileLayer;
    switch (mapType) {
      case "satellite":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          }
        );
        break;
      case "terrain":
        tileLayer = L.tileLayer(
          "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
          {
            attribution:
              'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ODbL.',
            subdomains: "abcd",
            minZoom: 0,
            maxZoom: 18,
          }
        );
        break;
      case "default":
      default:
        tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          }
        );
        break;
    }

    tileLayer.addTo(map);
  }, [map, mapType]);

  return null;
}

function MapOSMOutside() {
  const [userPosition, setUserPosition] = useState(null);
  const [destination, setDestination] = useState(DEFAULT_DEST);
  const [routeInfo, setRouteInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [mapType, setMapType] = useState("default"); // Default map type

  const handleSearch = (coords, label) => {
    setUserPosition(coords);
    if (label) {
      setHistory((prev) => [...prev.slice(-4), { label, coords }]); // lưu max 5 item
    }
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
  };

  return (
    <>
      <MapContainer
        center={destination}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100%" }}
      >
        <BaseMapLayer mapType={mapType} />
        {/* Marker điểm đích */}
        <Marker position={destination} icon={customIcon}>
          <Popup>
            <b>Điểm đến</b>
            <br />
            <button onClick={() => setUserPosition(destination)}>
              Chỉ đường đến đây
            </button>
          </Popup>
        </Marker>

        {/* Marker người dùng */}
        {userPosition && (
          <Marker position={userPosition} icon={customIcon}>
            <Popup>Vị trí bạn chọn</Popup>
          </Marker>
        )}

        <SearchBox onSelect={handleSearch} />
        <ClickToAddMarker onClick={(pos) => setUserPosition(pos)} />
        {userPosition && destination && (
          <Routing
            start={userPosition}
            end={destination}
            onRouteInfo={setRouteInfo}
          />
        )}
      </MapContainer>

      {/* Chọn loại bản đồ */}
      <div style={{ padding: "1rem", background: "#f0f0f0" }}>
        <div>
          <button
            onClick={() => handleMapTypeChange("default")}
            style={{ marginRight: "10px" }}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => handleMapTypeChange("satellite")}
            style={{ marginRight: "10px" }}
          >
            Satellite
          </button>
          <button onClick={() => handleMapTypeChange("terrain")}>
            Terrain
          </button>
        </div>
        {routeInfo ? (
          <p>
            🚗 Quãng đường: <b>{routeInfo.distance} km</b> – Thời gian:{" "}
            <b>{routeInfo.time} phút</b>
          </p>
        ) : (
          <p>🔍 Hãy chọn vị trí bắt đầu để xem lộ trình...</p>
        )}
      </div>

      {/* Hiển thị lịch sử tìm kiếm */}
      <div style={{ padding: "0 1rem 1rem" }}>
        <h4>Lịch sử tìm kiếm:</h4>
        <ul>
          {history.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => setUserPosition(item.coords)}
                style={{ marginBottom: "5px" }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default MapOSMOutside;
