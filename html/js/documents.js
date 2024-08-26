const dataUrl = "json_dumps/documents.json";

// ####### MAP CONFIG AND FUNCTIONS #######

function resizeIconsOnZoom(map, markers) {
  let previousZoom;
  const maxSize = 50;
  map.on("zoomstart", function () {
    previousZoom = map.getZoom();
  });
  map.on("zoomend", function () {
    console.log("zoomend event");
    let newZoom = map.getZoom();
    let zoomRatio = Math.pow(2, newZoom - previousZoom);
    let dampingFactor = 0.2;
    let adjustedZoomRatio = 1 + (zoomRatio - 1) * dampingFactor;
    Object.values(markers).forEach((marker) => {
      const icon = marker.options.icon;
      // Adjust the icon size based on the zoom ratio
      const currentSize = icon.options.iconSize;
      let newSize = [
        currentSize[0] * adjustedZoomRatio,
        currentSize[1] * adjustedZoomRatio,
      ];

      // Check if the new size exceeds the maximum size
      if (newSize[0] > maxSize || newSize[1] > maxSize) {
        newSize = [maxSize, maxSize];
      }

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

function rowsToMarkers(map, rows, layerGroups, oms) {
  // Clear all markers from the overlapping marker spiderfier
  oms.clearMarkers();
  // Clear all markers from the map and layer groups
  Object.values(layerGroups).forEach((layerGroup) => {
    layerGroup.clearLayers();
  });
  // Since we have a limited set of markers, we (re)create all markers every time the table is filteres
  const allMarkers = {};
  rows.forEach((row) => {
    const rowData = row.getData();
    const date = rowData.creation_date_ISO;
    if (rowData.lat && rowData.long) {
      const markerData = {
        lat: rowData.lat,
        long: rowData.long,
        year: getYearFromISODate(date),
        popupContent: `
        <h5><a href="${rowData.grocerist_id}.html">${rowData.shelfmark}<a/></h5>
        <p><b><i>Bakkal</i> / Grocer:</b> ${
          rowData.main_person[0] ? rowData.main_person[0].name : "-"
        }</p>
        `,
        icon: "bi bi-file-earmark-text-fill",
      };
      const marker = createAndAddMarker(markerData, layerGroups);

      // store each marker by the grocerist_id from the document
      const markerID = rowData.grocerist_id;
      allMarkers[markerID] = marker;

      oms.addMarker(marker);
      // WATCHME: hacky solution for the only two overlapping markers for now
      // must be adjusted in the future
      if (markerID === "document__44" || markerID === "document__39") {
        marker.fire("click");
        marker.closePopup();
        map.setView(mapConfig.initialCoordinates, mapConfig.initialZoom);
      }
    }
  });
  resizeIconsOnZoom(map, allMarkers);
  return allMarkers;
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
  const { map, layerGroups, oms } = createMap({ useSpiderfier: true });
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
      markers = rowsToMarkers(map, rows, layerGroups, oms);
    });
    //eventlistener for click on row
    table.on("rowClick", (e, row) => {
      zoomToPointFromRowData(row.getData(), map, markers);
    });
  });
}

setupMapAndTable(dataUrl);
