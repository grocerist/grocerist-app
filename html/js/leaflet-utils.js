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
  "18th century": colors[0],
  "19th century": colors[3],
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
function createMarkerIcon(color, icon) {
  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="custom-marker-pin" style="background-color:${color};"><i class="${icon}" style="color:${color}" ></i></div><div class="custom-marker-shadow"></div>
    `,
    // !! if iconSize is changed, markerSize variable in style.css has to be adjusted accordingly
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -21],
  });
  return customIcon;
}

// Function to create a marker and add it to the right layer group based on the year
function createMarker(markerData, centuryLayers = false) {
  const { lat, long, century, popupContent, icon } = markerData;
  let color = colors[0];
  let layerName = null;
  if (centuryLayers && century) {
    const centuryText = `${century}th century`;
    color = overlayColors[centuryText];
    layerName = `<span style="color:${color}">${centuryText}</span>`;
  }
  const customIcon = createMarkerIcon(color, icon);
  const marker = L.marker([lat, long], { icon: customIcon, riseOnHover: true });

  marker.bindPopup(popupContent);
  return { marker, layerName };
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
function createMap(options = {}) {
  console.log("loading map");
  const map = L.map(mapConfig.divId, mapConfig.mapOptions).setView(
    options.initialCoordinates
      ? options.initialCoordinates
      : mapConfig.initialCoordinates,
    mapConfig.initialZoom
  );
  const baseMapLayer = L.tileLayer(mapConfig.baseMapUrl, {
    attribution: mapConfig.attribution,
  });
  // Add base map layer
  baseMapLayer.addTo(map);

  let layerGroups = null;
  // let mcgLayerSupportGroup = null;
  if (options.layerControl) {
    // Create and add marker layer groups from the overlayColors object
    layerGroups = createAndAddLayerGroups(map, overlayColors);
    const layerControl = L.control.layers(null, layerGroups, {
      collapsed: false,
    });
    layerControl.addTo(map);
    if (options.useCluster) {
    // Create a marker cluster group
    const mcgLayerSupportGroup = L.markerClusterGroup.layerSupport();
    mcgLayerSupportGroup.addTo(map);
    Object.values(layerGroups).forEach((layerGroup) => {
    mcgLayerSupportGroup.addLayer(layerGroup)
  });
  }
  }

  return { map, layerGroups};
}
