const dataUrl = "json_dumps/documents.json";
// ####### MAP CONFIG AND FUNCTIONS #######
// Config settings for map
const mapConfig = {
  initialZoom: 11,
  initialCoordinates: [41.06, 29.00626],
  baseMapUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  maxZoom: 20,
  minZoom: 1,
  onRowClickZoom: 16,
  divId: "map",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
};

const overlayColors = {
  "18th century": "#ba5a4d",
  "19th century": "#8b6c42",
  "N/A": "#E9967A",
};

// Helper function to create and add layer groups to the map
const createAndAddLayerGroup = (map, name, color) => {
  const layerGroup = new L.layerGroup();
  const htmlName = `<span style="color:${color}">${name}</span>`;
  layerGroup.addTo(map);
  return { [htmlName]: layerGroup };
};

function resizeIconsOnZoom(map) {
  let previousZoom;
  map.on("zoomstart", function () {
    previousZoom = map.getZoom();
  });
  map.on("zoomend", function () {
    let newZoom = map.getZoom();
    let zoomRatio = Math.pow(2, newZoom - previousZoom);
    Object.values(markers).forEach((marker) => {
      const icon = marker.options.icon;
      // Adjust the icon size based on the zoom ratio
      const currentSize = icon.options.iconSize;
      const newSize = [currentSize[0] * zoomRatio, currentSize[1] * zoomRatio];
      icon.options.iconSize = newSize;
      icon.options.iconAnchor = [newSize[0] / 2, newSize[1]];
      icon.options.popupAnchor = [0, -newSize[1] * 0.8];
      document.documentElement.style.setProperty(
        "--marker-size",
        `${newSize[0]}px`
      );
      marker.setIcon(icon);
    });
  });
}
// Function for initializing the map
function createMap() {
  console.log("loading map");
  const map = L.map(mapConfig.divId).setView(
    mapConfig.initialCoordinates,
    mapConfig.initialZoom
  );
  const baseMapLayer = L.tileLayer(mapConfig.baseMapUrl, {
    maxZoom: mapConfig.maxZoom,
    attribution: mapConfig.attribution,
  });
  // Add base map layer
  baseMapLayer.addTo(map);

  // Create and add marker layer groups from the overlayColors object
  const layerGroups = {};
  Object.entries(overlayColors).forEach(([name, color]) => {
    Object.assign(layerGroups, createAndAddLayerGroup(map, name, color));
  });

  const layerControl = L.control.layers(null, layerGroups, {
    collapsed: false,
  });
  layerControl.addTo(map);
  // resizeIconsOnZoom(map);
  return { map, layerGroups };
}
// Function to create a custom css marker with an icon
function createMarker(lat, long, color, icon) {
  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div class="custom-marker-pin" style="border-color:${color};"><i class="${icon}" style="color:${color}" ></i></div><div class="custom-marker-shadow"></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -21],
  });
  return L.marker([lat, long], { icon: customIcon });
}

function addPopup(rowData) {
  const popupContent = `
    <h5><a href="${rowData.grocerist_id}.html">${rowData.shelfmark}<a/></h5>
    <p><b><i>Bakkal</i> / Grocer:</b> ${
      rowData.main_person[0] ? rowData.main_person[0].name : "-"
    }</p>
    `;
  return popupContent;
}

// ####### TABLE CONFIG AND FUNCTIONS #######
const baseColumnDefinitions = [
  {
    title: "Shelfmark",
    field: "shelfmark",
    headerFilter: "input",
    formatter: linkToDetailView,
  },
  {
    title: "<i>Bakkal</i>/Grocer",
    field: "main_person",
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "",
      idField: "grocerist_id",
      nameField: "name",
    },
    headerFilterFuncParams: { nameField: "name" },
  },
  {
    title: "Transcript",
    field: "transcript",
    hozAlign: "center",
    formatter: "tickCross",
    headerFilter: "tickCross",
    headerFilterParams: { tristate: true },
    headerFilterEmptyCheck: function (value) {
      return value === null;
    },
  },
  {
    title: "Facsimiles",
    field: "images",
    hozAlign: "center",
    formatter: "tickCross",
    headerFilter: "tickCross",
    headerFilterParams: { tristate: true },
    headerFilterEmptyCheck: function (value) {
      return value === null;
    },
  },
  {
    title: "Groceries",
    field: "goods",
    formatterParams: {
      scrollable: true,
      urlPrefix: "",
      idField: "grocerist_id",
      nameField: "name",
    },
    ...linkListColumnSettings,
    headerFilterFuncParams: { nameField: "name" },
  },
  {
    title: "District",
    field: "district",
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "district__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "<i>Mahalle</i>",
    field: "neighbourhood",
    visible: false,
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "neighbourhood__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "<i>Karye</i>",
    field: "karye",
    visible: false,
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "karye__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "<i>Nahiye</i>",
    field: "nahiye",
    visible: false,
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "nahiye__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "Quarter",
    field: "quarter",
    visible: false,
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "quarter__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "Address",
    field: "address",
    visible: false,
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "address__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "Year <i>Hicri</i>",
    field: "year_of_creation_hicri",
    headerFilter: "input",
  },
  {
    title: "Date <i>Miladi</i>",
    field: "creation_date_ISO",
    headerFilter: "input",
  },
];
// Add minWidth and visibility toggle to each column
const columnDefinitions = baseColumnDefinitions.map((column) => {
  // List of columns that should not have minWidth
  const narrowColumns = ["transcript", "images"];
  const narrowMinWidth = 100;
  const defaultMinWidth = 150;

  // Determine the minWidth for the current column
  const minWidth = narrowColumns.includes(column.field)
    ? narrowMinWidth
    : defaultMinWidth;

  return {
    ...column,
    headerMenu: headerMenu,
    minWidth: minWidth,
  };
});

// Config settings for table
const tableConfig = {
  ...commonTableConfig,
  headerFilterLiveFilterDelay: 600,
  columns: columnDefinitions,
  initialSort: [{ column: "shelfmark", dir: "asc" }],
  footerElement: `<span class="tabulator-counter float-left">
                    Showing <span id="search_count"></span> results out of <span id="total_count"></span>
                    </span>`,
};

// Function for creating table
function createTable(tableConfig) {
  console.log("loading table");
  const table = new Tabulator("#documents-table", tableConfig);
  return table;
}
// ###### MAP AND TABLE INTERACTION #######
// Function to get coordinate key from row data
function getCoordinates(rowData) {
  return { lat: rowData.lat, long: rowData.long };
}

function rowsToMarkers(rows, layerGroups) {
  markers = {};
  // Clear all markers from the map and layer groups
  Object.values(layerGroups).forEach((layerGroup) => {
    layerGroup.clearLayers();
  });
  rows.forEach((row) => {
    const rowData = row.getData();
    const { lat, long } = getCoordinates(rowData);
    if (lat && long) {
      let year;
      const date = rowData.creation_date_ISO;
      if (date) {
        const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (isoDatePattern.test(date)) {
          year = date.substring(0, 4);
        } else {
          year = null;
        }
      } else {
        year = null;
      }
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
      const icon = "bi bi-file-earmark-text-fill";
      const marker = createMarker(lat, long, color, icon);

      // store each marker by the grocerist_id from the document
      const markerID = rowData.grocerist_id;
      markers[markerID] = marker;

      marker.bindPopup(addPopup(rowData));
      marker.addTo(layerGroups[layer]);
    }
  });
  return markers;
}
function zoomToPointFromRowData(rowData, map, markers) {
  const { lat, long } = getCoordinates(rowData);
  if (lat && long) {
    const markerId = rowData.grocerist_id;
    const marker = markers[markerId];
    marker.openPopup();
    map.setView([lat, long], mapConfig.onRowClickZoom);
  } else {
    // close all open popups when resetting the map
    map.closePopup();
    map.setView(mapConfig.initialCoordinates, mapConfig.initialZoom);
  }
}
// Main function for initializing the map and table
function setupMapAndTable(dataUrl) {
  const { map, layerGroups } = createMap();
  let markers = {};
  d3.json(dataUrl, function (dataFromJson) {
    const tableData = Object.values(dataFromJson).filter(
      (item) => item.shelfmark !== ""
    );
    tableConfig.data = tableData;
    const table = createTable(tableConfig);
    table.on("dataLoaded", function (data) {
      $("#total_count").text(data.length);
    });
    table.on("dataFiltered", function (_filters, rows) {
      $("#search_count").text(rows.length);
      markers = rowsToMarkers(rows, layerGroups);
    });
    //eventlistener for click on row
    table.on("rowClick", (e, row) => {
      zoomToPointFromRowData(row.getData(), map, markers);
    });
  });
}

setupMapAndTable(dataUrl);
