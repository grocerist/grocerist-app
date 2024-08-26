// Config settings for map
const mapConfig = {
  // initial map state
  initialZoom: 12,
  initialCoordinates: [41.015137, 28.97953],
  divId: "map",
  // L.map options
  mapOptions: { maxZoom: 18, minZoom: 9 },
  // L.tileLayer options
  baseMapUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  // other options
  onRowClickZoom: 16,
};

const overlayColors = {
  "18th century": "#ba5a4d",
  "19th century": "#a6764d",
  "N/A": "#7d6d61",
};

// Helper function to create and add layer groups to the map
const createAndAddLayerGroups = (map, colors) => {
  const layerGroups = {};
  Object.entries(colors).forEach(([name, color]) => {
    const layerGroup = new L.layerGroup();
    const htmlName = `<span style="color:${color}">${name}</span>`;
    layerGroup.addTo(map);
    layerGroups[htmlName] = layerGroup;
  });
  return layerGroups;
};

// Function to create a custom css marker with an icon
function createMarker(lat, long, color, icon) {
  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="custom-marker-pin" style="background-color:${color};"><i class="${icon}" style="color:${color}" ></i></div><div class="custom-marker-shadow"></div>
    `,
    // !! if iconSize is changed, markerSize variable in style.css has to be adjusted accordingly
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -21],
  });
  return L.marker([lat, long], { icon: customIcon, riseOnHover: true });
}

// Function to create a marker and add it to the right layer group based on the year
function createAndAddMarker(markerData, layerGroups) {
  const { lat, long, year, popupContent, icon } = markerData;
  let century;
  if (year !== null && year <= 1800) {
    century = "18th century";
  } else if (year !== null && year <= 1900) {
    century = "19th century";
  } else {
    century = "N/A";
  }

  const color = overlayColors[century];
  const layer = `<span style="color:${color}">${century}</span>`;
  const marker = createMarker(lat, long, color, icon);
  marker.bindPopup(popupContent);
  marker.addTo(layerGroups[layer]);
  return marker;
}

function getYearFromISODate(date) {
  let year = null;
  if (date) {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDatePattern.test(date)) {
      year = date.substring(0, 4);
    }
  }
  return year;
}

// Function for initializing the map
// Function for initializing the map
function createMap(options = {}) {
  console.log("loading map");
  const map = L.map(mapConfig.divId, mapConfig.mapOptions).setView(
    mapConfig.initialCoordinates,
    mapConfig.initialZoom
  );
  const baseMapLayer = L.tileLayer(mapConfig.baseMapUrl, {
    attribution: mapConfig.attribution,
  });
  // Add base map layer
  baseMapLayer.addTo(map);

  // Create and add marker layer groups from the overlayColors object
  const layerGroups = createAndAddLayerGroups(map, overlayColors);

  const layerControl = L.control.layers(null, layerGroups, {
    collapsed: false,
  });
  layerControl.addTo(map);

  let oms = null;
  if (options.useSpiderfier) {
    // keepSpiderfied just keeps the markers from unspiderfying when clicked
    oms = new OverlappingMarkerSpiderfier(map, {
      keepSpiderfied: true,
      nearbyDistance: 1,
    });
  }

  return { map, layerGroups, oms };
}
