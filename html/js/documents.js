const dataUrl = "json_dumps/documents.json";

// ####### MAP CONFIG AND FUNCTIONS #######

function resizeIconsOnZoom(map, markers) {
  let previousZoom;
  const maxSize = 50;
  map.on("zoomstart", function () {
    previousZoom = map.getZoom();
  });
  map.on("zoomend", function () {
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

//custom header filter
const dateFilterEditor = function (
  cell,
  onRendered,
  success,
  cancel,
  editorParams
) {
  // Create the container
  const container = $("<span></span>");

  // Create the input for the date range picker
  const dateRangeInput = $(
    "<input type='text' class='form-control' placeholder='Select date range'/>"
  );

  container.append(dateRangeInput);

  // Initialize the date range picker
  dateRangeInput.daterangepicker({
    locale: {
      cancelLabel: "Clear",
      format: "YYYY-MM-DD",
    },
    // our current earliest date
    startDate: "1697-11-10",
    minDate: "1697-11-10",
    maxDate: "1899-12-31",
    showDropdowns: true,
    linkedCalendars: false,
  });

  // Update the input value when a range is selected
  dateRangeInput.on("apply.daterangepicker", function (ev, picker) {
    $(this).val(
      picker.startDate.format("YYYY-MM-DD") +
        " - " +
        picker.endDate.format("YYYY-MM-DD")
    );
    success({
      start: picker.startDate.format("YYYY-MM-DD"),
      end: picker.endDate.format("YYYY-MM-DD"),
    });
  });

  // Clear the input value when the cancel button is clicked
  dateRangeInput.on("cancel.daterangepicker", function () {
    $(this).val("");
    success(null);
  });

  return container[0];
};
// custom header filter function for dates
const dateFilterFunction = function (
  headerValue,
  rowValue,
  rowData,
  filterParams
) {
  if (rowValue) {
    return rowValue >= headerValue.start && rowValue <= headerValue.end;
  }
  return false;
};

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
    sorterParams: {
      type: "string",
      valueMap: "name",
    },
  },
  {
    title: "Century",
    field: "century.value",
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: "century",
      sort: "asc",
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
    headerSort: false,
  },
  {
    title: "District",
    field: "district",

    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: objectLookup,
      multiselect: false,
    },
    headerFilterFunc: objectArrayHeaderFilter,
    formatter: linkListFormatter,
    formatterParams: {
      urlPrefix: "district__",
      idField: "id",
      nameField: "value",
    },
    headerFilterFunc: objectArrayHeaderFilter,
    sorter: "array",
    sorterParams: {
      type: "string",
      valueMap: "value",
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
    sorterParams: {
      type: "string",
      valueMap: "value",
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
    sorterParams: {
      type: "string",
      valueMap: "value",
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
    sorterParams: {
      type: "string",
      valueMap: "value",
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
    sorterParams: {
      type: "string",
      valueMap: "value",
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
    sorterParams: {
      type: "string",
      valueMap: "value",
    },
  },
  {
    title: "Year <i>Hicri</i>",
    field: "year_of_creation_hicri",
    headerFilter: rangeEditor,
    headerFilterParams: {
      labels: ["Start", "End"],
      min: 1100,
      max: 1250,
    },
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
    visible: false,
  },
  {
    title: "Date <i>Miladi</i>",
    field: "creation_date_ISO",
    headerFilter: dateFilterEditor,
    headerFilterFunc: dateFilterFunction,
    visible: false,
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
    visible: false,
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

function rowsToMarkers(map, rows, layerGroups) {
  // Clear all markers from the map and layer groups
  Object.values(layerGroups).forEach((layerGroup) => {
    layerGroup.clearLayers();
  });
  // Since we have a limited set of markers, we (re)create all markers every time the table is filteres
  const allMarkers = {};
  rows.forEach((row) => {
    const rowData = row.getData();
    const century = rowData.century;
    if (rowData.lat && rowData.long) {
      const markerData = {
        lat: rowData.lat,
        long: rowData.long,
        century: century?.value || null,
        popupContent: `
        <h5><a href="${rowData.grocerist_id}.html">${rowData.shelfmark}</a></h5>
        <p><b><i>Bakkal</i> / Grocer:</b>
          ${
            rowData.main_person[0]
              ? `<a href="${rowData.main_person[0].grocerist_id}.html">${rowData.main_person[0].name}</a>`
              : "-"
          }
        </p>
      `,
        icon: "bi bi-file-earmark-text-fill",
      };
      const { marker, layerName } = createMarker(markerData, true);
      marker.addTo(layerGroups[layerName]);
      // store each marker by the grocerist_id from the document
      const markerID = rowData.grocerist_id;
      allMarkers[markerID] = marker;
    }
  });

  // resizeIconsOnZoom(map, allMarkers);
  return allMarkers;
}
function zoomToPointFromRowData(rowData, map, markers, mcgLayerSupportGroup) {
  const { lat, long } = getCoordinates(rowData);
  if (lat && long) {
    const markerId = rowData.grocerist_id;
    const marker = markers[markerId];
    mcgLayerSupportGroup.zoomToShowLayer(marker, function () {
      marker.openPopup();
    });
  } else {
    // close all open popups when resetting the map
    map.closePopup();
    map.setView(mapConfig.initialCoordinates, 9);
  }
}
// Main function for initializing the map and table
function setupMapAndTable(dataUrl) {
  const { map, layerGroups, mcgLayerSupportGroup } = createMap({
    initialZoom: 9,
    layerControl: true,
    useCluster: true,
  });
  let spiderfyTimeout = null;
  let isSpiderfied = false;

  mcgLayerSupportGroup.on("spiderfied", function () {
    isSpiderfied = true;
  });
  mcgLayerSupportGroup.on("unspiderfied", function () {
    isSpiderfied = false;
  });
  // spiderfy clusters beyond a certain zoom level
  // (!only if there is only one cluster visible!)
  mcgLayerSupportGroup.on("animationend", function () {
    const currentZoom = map.getZoom();
    const autoSpiderfyZoomLevel = 12;
    // Zooming automically unspiderfies, so the timeout ensures
    // there's less spiderfying when zooming in and out quickly.
    // Clear any pending spiderfy timeout
    if (spiderfyTimeout) {
      clearTimeout(spiderfyTimeout);
    }

    spiderfyTimeout = setTimeout(() => {
      if (currentZoom >= autoSpiderfyZoomLevel && !isSpiderfied) {
        const visibleClusters = new Set();
        mcgLayerSupportGroup.eachLayer(function (layer) {
          let parent = mcgLayerSupportGroup.getVisibleParent(layer);
          if (parent) {
            // check if the parent is a cluster and if it is visible
            if (
              typeof parent.getChildCount === "function" &&
              map.getBounds().contains(parent.getLatLng())
            ) {
              visibleClusters.add(parent);
            }
          }
        });

        if (visibleClusters.size === 1) {
          const clusterToSpiderfy = Array.from(visibleClusters)[0];
          clusterToSpiderfy.spiderfy();
        }
      }
    }, 400);
  });
  // spiderfy smaller clusters on mouseover
  mcgLayerSupportGroup.on("clustermouseover", function (e) {
    if (e.layer.getChildCount() <= 5) {
      e.layer.spiderfy();
    }
  });
  let markers = {};
  (async function () {
    try {
      const dataFromJson = await d3.json(dataUrl);

      const tableData = Object.values(dataFromJson)
        .filter((item) => item.shelfmark !== "")
        .map((item) => {
          if (item.goods.length === 0 && item.no_goods_data === true) {
            item.goods = "No data";
          }
          return item;
        });
      tableConfig.data = tableData;
      const table = createTable(tableConfig);

      table.on("dataLoaded", function (data) {
        $("#total_count").text(data.length);
      });

      table.on("dataFiltered", function (_filters, rows) {
        $("#search_count").text(rows.length);
        markers = rowsToMarkers(map, rows, layerGroups);
      });

      // Event listener for click on row
      table.on("rowClick", (e, row) => {
        zoomToPointFromRowData(
          row.getData(),
          map,
          markers,
          mcgLayerSupportGroup
        );
      });
    } catch (error) {
      console.error("Error loading or processing data:", error);
    }
  })();
}

setupMapAndTable(dataUrl);
