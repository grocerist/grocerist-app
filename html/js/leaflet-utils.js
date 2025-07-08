// Config settings for map
const mapConfig = {
  // initial map state
  initialZoom: 12,
  initialCoordinates: [41.015137, 28.97953],
  divId: "map",
  // L.map options
  mapOptions: { maxZoom: 18, minZoom: 8 },
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

const iconColors = {
  "single-shop": colors[4],
  "multi-shop": colors[7],
};

// Helper function to create and add layer groups to the map
const createAndAddLayerGroups = (map, layerList) => {
  const layerGroups = {};
  layerList.forEach((name) => {
    const color = overlayColors[name] || null;
    const layerGroup = new L.layerGroup();
    layerGroup.addTo(map);
    if (color) {
      const htmlName = `<span style="color:${color}">${name}</span>`;
      layerGroups[htmlName] = layerGroup;
    } else {
      layerGroups[name] = layerGroup;
    }
  });
  return layerGroups;
};

// Function to create a custom css marker with an icon
function createMarkerIcon(pinColor, icon, iconColor, altText) {
  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="custom-marker-pin" style="background-color:${pinColor};" aria-label="${altText}"><i class="${icon}" style="color:${iconColor}" ></i></div><div class="custom-marker-shadow"></div>
    `,
    // !! if iconSize is changed, markerSize variable in style.css has to be adjusted accordingly
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -21],
  });
  return customIcon;
}

// Function to create a marker and add it to the right layer group based on the year
function createMarker(markerData, centuryLayers = false, treeLayers = false) {
  const { lat, long, century, popupContent, icon, altText } = markerData;
  // --primary color as default
  let color = "#5d7799";
  let iconColor = "#5d7799";
  let layerName = null;

  if (century) {
    const centuryText = `${century}th century`;
    color = overlayColors[centuryText];
    if (centuryLayers) {
      iconColor = color;
      layerName = `<span style="color:${color}">${centuryText}</span>`;
    } else if (treeLayers) {
      iconColor = iconColors[markerData.multi ? "multi-shop" : "single-shop"];
      layerName = `${century}-${markerData.multi ? "more" : "1"}`;
    }
  }
  const customIcon = createMarkerIcon(color, icon, iconColor, altText);
  const marker = L.marker([lat, long], {  icon: customIcon, riseOnHover: true });

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

function markerPerDoc(doc_list, icon, layerGroups = null) {
  // create markers for each document
  for (let i = 0; i < doc_list.length; i++) {
    const doc = doc_list[i];
    // WATCHME filtering out values with same lat and long, could become unnecessary
    const coords = doc_list
      .filter((doc) => doc.lat && doc.long && doc.lat !== doc.long)
      .map((doc) => [doc.lat, doc.long]);
    const century = layerGroups ? doc.century?.value || null : null;
    const year = layerGroups ? getYearFromISODate(doc.iso_date) : null;
    if (doc.lat && doc.long) {
      const yearText = year ? `in ${year}` : "";
      const markerData = {
        lat: doc.lat,
        long: doc.long,
        century,
        popupContent: `<p>Mentioned in document <br>
            <strong><a href="document__${doc.id}.html">${
           doc.value || doc.shelfmark 
        }</a></strong><br>
            ${yearText}</p>`,
        icon: icon,
        altText : `Document ${doc.value || doc.shelfmark}` ,
      };
      if (layerGroups) {
        const { marker, layerName } = createMarker(markerData, true);
        marker.addTo(layerGroups[layerName]);
      } else {
        const { marker } = createMarker(markerData);
        marker.addTo(map);
      }
      // set map bounds based on all coordinates
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds,  { padding: [10, 10] });
    }
    }
  }
}

function createTreeLayerControl(layerGroups, layerList) {
  const parentCategories = Object.keys(overlayColors);
  const singleShopLabel = `<span style=color:${iconColors["single-shop"]}> Single-shop owner <i class="bi bi-file-earmark-text-fill"></i></span>`;
  const multiShopLabel = `<span style=color:${iconColors["multi-shop"]}> Multi-shop owner <i class="bi bi-file-earmark-text-fill"></i></span>`;
  const overlaysTree = {
    label: "Grocery shops",
    children: [
      {
        label: `<span style="color:${overlayColors[parentCategories[0]]}">${
          parentCategories[0]
        }  <i class="bi bi-geo-alt-fill"></i></span>`,
        selectAllCheckbox: true,
        collapsed: true,
        children: [
          {
            label: singleShopLabel,
            layer: layerGroups[layerList[0]],
          },
          {
            label: multiShopLabel,
            layer: layerGroups[layerList[1]],
          },
        ],
      },
      {
        label: `<span style="color:${overlayColors[parentCategories[1]]}">${
          parentCategories[1]
        } <i class="bi bi-geo-alt-fill"></i></span>`,
        selectAllCheckbox: true,
        collapsed: true,
        children: [
          {
            label: singleShopLabel,
            layer: layerGroups[layerList[2]],
          },
          {
            label: multiShopLabel,
            layer: layerGroups[layerList[3]],
          },
        ],
      },
    ],
  };
  const layerControlTree = L.control.layers.tree(null, overlaysTree, {
    collapsed: false,
    closedSymbol: `<i class="bi bi-caret-right-fill"></i>`,
    openedSymbol: `<i class="bi bi-caret-down-fill"></i>`,
  });
  return layerControlTree;
}

// Function for initializing the map
function createMap(options = {}) {
  console.log("loading map");
  const map = L.map(mapConfig.divId, mapConfig.mapOptions).setView(
    options.initialCoordinates
      ? options.initialCoordinates
      : mapConfig.initialCoordinates,
    options.initialZoom ? options.initialZoom : mapConfig.initialZoom
  );
  const baseMapLayer = L.tileLayer(mapConfig.baseMapUrl, {
    attribution: mapConfig.attribution,
  });
  baseMapLayer.addTo(map);

  let layerGroups = null;
  let mcgLayerSupportGroup = null;
  if (options.layerControl) {
    const layerList = options.layerControlTree
      ? ["18-1", "18-more", "19-1", "19-more"]
      : Object.keys(overlayColors);
    layerGroups = createAndAddLayerGroups(map, layerList);
    if (options.layerControlTree) {
      const layerControlTree = createTreeLayerControl(layerGroups, layerList);
      layerControlTree.addTo(map);
    } else {
      console.log("adding layer control");
      const layerControl = L.control.layers(null, layerGroups, {
        collapsed: false,
      });
      layerControl.addTo(map);
    }
    // Ensure all checkboxes are checked after adding the control
    setTimeout(() => {
      document
        .querySelectorAll('.leaflet-control-layers-selector[type="checkbox"]')
        .forEach((cb) => {
          if (!cb.checked) {
            cb.checked = true;
            cb.dispatchEvent(new Event("change")); // trigger any listeners
          }
        });
    }, 10);
    if (options.useCluster) {
      // Create a marker cluster group
      mcgLayerSupportGroup = L.markerClusterGroup.layerSupport({
        iconCreateFunction: function (cluster) {
          return L.divIcon({
            className: "custom-cluster",
            html: `<div><span>${cluster.getChildCount()}</span></div>`,
            iconSize: [50, 50],
          });
        },
      });
      mcgLayerSupportGroup.addTo(map);
      Object.values(layerGroups).forEach((layerGroup) => {
        mcgLayerSupportGroup.addLayer(layerGroup);
      });
    }
  }

  return { map, layerGroups, mcgLayerSupportGroup };
}
