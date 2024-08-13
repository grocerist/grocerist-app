const dataUrl = "json_dumps/documents.json";
// ####### MAP CONFIG AND FUNCTIONS #######
// Config settings for map
const mapConfig = {
  initialZoom: 10,
  initialCoordinates: [41.01224, 28.976018],
  baseMapUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  maxZoom: 20,
  minZoom: 1,
  onRowClickZoom: 16,
  divId: "map",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
};

const overlays = {
  "18th century": {
    color: "#d4a07a",
    name: `<span style="color:#d4a07a">18th century</span>`,
  },
  "19th century": {
    color: "#8b6c42",
    name: `<span style="color:#8b6c42">19th century</span>`,
  },
  "No data": {
    color: "#ba5a4d",
    name: `<span style="color:#ba5a4d">No data</span>`,
  },
};

// Helper function to create and add layer groups to the map
const createAndAddLayerGroup = (map, name) => {
  const layerGroup = new L.layerGroup();
  layerGroup.addTo(map);
  return { [name]: layerGroup };
};

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

  // Create and add marker layer groups from the overlays object
  const layerGroups = {};
  Object.values(overlays).forEach((data) => {
    Object.assign(layerGroups, createAndAddLayerGroup(map, data.name));
  });

  const layerControl = L.control.layers(null, layerGroups, {
    collapsed: false,
  });
  layerControl.addTo(map);
  return { map, layerGroups };
}
// Function to create a marker
function createMarker(lat, long, color) {
  const customIcon = L.ExtraMarkers.icon({
    icon: "bi-file-earmark-text",
    markerColor: color,
    shape: "circle",
    prefix: "bi",
    svg: true,
    iconColor: "black",
  });
  return L.marker([lat, long], { icon: customIcon });
}

function addPopup(rowData) {
  let popupContent = `
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
    field: "year_of_creation_miladi",
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
  // initialSort: [{ column: "properties.name", dir: "asc" }],
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
    let rowData = row.getData();
    let { lat, long } = getCoordinates(rowData);
    if (lat && long) {
      let year;
      if (rowData.year_of_creation_miladi) {
        year = /\d{4}/.exec(rowData.year_of_creation_miladi)[0];
      } else {
        year = 2000;
      }
      let color, layer;
      if (year <= 1800) {
        color = overlays["18th century"].color;
        layer = overlays["18th century"].name;
      } else if (year <= 1900) {
        color = overlays["19th century"].color;
        radius = 10;
        layer = overlays["19th century"].name;
      } else {
        color = overlays["No data"].color;
        layer = overlays["No data"].name;
      }
      let marker = createMarker(lat, long, color);

      // store each marker by the grocerist_id from the document
      let markerID = rowData.grocerist_id;
      markers[markerID] = marker;

      marker.bindPopup(addPopup(rowData));
      marker.addTo(layerGroups[layer]);
    }
  });
  return markers;
}
function zoomToPointFromRowData(rowData, map, markers) {
  let { lat, long } = getCoordinates(rowData);
  if (lat && long) {
    let markerId = rowData.grocerist_id;
    let marker = markers[markerId];
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
