const dataUrl = "json_dumps/persons.json";
const titleStyle = {
  color: "#BA833B",
  fontWeight: "bold",
  fontSize: "20px",
};
const baseColumnDefinitions = [
  {
    title: "Name",
    field: "name",
    headerFilter: "input",
    formatter: linkToDetailView,
  },
  {
    title: "Religion",
    field: "religion",
    mutator: mutateSelectField,
    formatter: "html",
    headerFilter: "list",
    headerFilterFunc: "in",
    headerFilterParams: {
      valuesLookup: "religion",
      sort: "asc",
      multiselect: true,
    },
  },
  {
    title: "Documents",
    field: "documents",
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "document__",
      idField: "id",
      nameField: "value",
    },
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
];

// Add minWidth and visibility toggle to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  headerMenu: headerMenu,
  minWidth: 150,
}));

const locTypeSelect = document.getElementById("select-location");
const tableConfig = {
  ...commonTableConfig,
  columns: columnDefinitions,
  footerElement:
    '<span class="tabulator-counter float-left">' +
    'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
    "</span>",
};

const getColor = {
  "Muslim": "#6f9ea8",
  "Non muslim/Orthodox": "#a6764d",
  "Non muslim/Armenian": "#e8c28c",
  "Non muslim": "#d89090",
  "Unknown": "#b3c0c4",
};

// generate both charts
function generateChartsFromTable(rows, table) {
  let religionsResults = calculateReligionData(rows);
  createPieChart("religion-chart", "Religion", religionsResults, table);
  generateChartSelect(rows, table);
}
// generate chart for selected location type
function generateChartSelect(rows, table) {
  const locationType = locTypeSelect.value;
  let locationResults = calculateLocationData(rows, locationType);
  createColumnChart("location-chart", locationType, locationResults, table);
}

function createPieChart(containerId, title, data, table) {
  return Highcharts.chart(containerId, {
    chart: {
      type: "pie",
    },
    title: {
      text: title,
      style: titleStyle,
    },
    tooltip: {
      valueSuffix: "%",
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              if (this.name === "Unknown") {
                //nothing happens
              } else {
                table.setHeaderFilterValue("religion", [this.name]);
              }
            },
          },
        },
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [
      {
        name: "Percentage",
        colorByPoint: true,
        data: data.map((item) => ({
          ...item,
          color: getColor[item.name],
        })),
      },
    ],
  });
}

function createColumnChart(containerId, locationType, data, table) {
  Highcharts.chart(containerId, {
    chart: {
      type: "column",
    },

    legend: {
      enabled: false,
    },
    title: false,
    xAxis: {
      type: "category",
      reversed: true,
    },
    yAxis: {
      title: {
        text: "Persons",
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br/>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span> <b>{point.y}</b> persons<br/>',
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              if (this.name === "Unknown") {
                // nothing happens
              } else {
                // set the filter value for the column with the current location type
                table.setHeaderFilterValue(locationType, this.name);
              }
            },
          },
        },
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [
      {
        name: "Districts",
        dataSorting: {
          enabled: true,
          sortKey: "name",
        },
        colorByPoint: true,
        data: data,
      },
    ],
  });
}
// Function to calculate percentage  and round it to 2 decimal places
function calculatePercentage(count, total) {
  let percentage = (count / total) * 100;
  return parseFloat(percentage.toFixed(2));
}
function calculateReligionData(rows) {
  let religionCount = {};
  let totalPersons = rows.length;
  rows.forEach((row) => {
    let rowData = row.getData();
    // Combine multiple values into one key
    let religionKey = rowData.religion.replace(/(<([^>]+)>)/gi, "");
    // Check if the resulting string is empty
    if (religionKey.trim() === "") {
      religionKey = "Unknown";
    }
    // Update the count for a specific religion
    religionCount[religionKey] = (religionCount[religionKey] || 0) + 1;
  });

  // Calculate the percentages for each religion and store them in an array
  let results = Object.entries(religionCount).map(([religion, count]) => ({
    name: religion,
    y: calculatePercentage(count, totalPersons),
  }));
  return results;
}

function calculateLocationData(rows, locationType = "district") {
  let locationCount = {};
  // get the locations (html list elements) from each row
  rows.forEach((row) => {
    let rowData = row.getData();
    let locationData = rowData[locationType];
    let locationNames = locationData.map((item) => item.value);
    if (locationNames.length === 0) {
      locationCount["Unknown"] = (locationCount["Unknown"] || 0) + 1;
    } else {
      locationNames.forEach((value) => {
        locationCount[value] = (locationCount[value] || 0) + 1;
      });
    }
  });
  // Calculate the numbers for each location type and store them in an array
  let results = Object.entries(locationCount).map(([district, count]) => ({
    name: district,
    y: count,
  }));
  return results;
}

function createTable(tableConfig) {
  console.log("loading table");
  const table = new Tabulator("#persons-table", tableConfig);
  return table;
}

d3.json(dataUrl, function (data) {
  tableData = Object.values(data).filter((item) => item.name !== "");
  tableConfig.data = tableData;
  const table = createTable(tableConfig);
  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });
  table.on("dataFiltered", function (_filters, rows) {
    $("#search_count").text(rows.length);
    generateChartsFromTable(rows, table);
  });

  locTypeSelect.addEventListener("change", () => {
    let rows = table.getRows();
    generateChartSelect(rows, table);
  });
});

// Custom colors (default HighCharts list has too few)
Highcharts.setOptions({
  colors: [
    "#a6764d",
    "#e8c28c",
    "#d89090",
    "#6f9ea8",
    "#b3c0c4",
    "#c9944a",
    "#8b6c42",
    "#f2d1a5",
    "#ef8686",
    "#c5d7e3",
    "#5a8d92",
    "#9cbab9",
    "#e0a37b",
    "#ba5a4d",
    "#c3ab9f",
    "#79a89f",
    "#7d6d61",
    "#d2beb3",
    "#a0b0a9",
    "#d4a07a",
  ],
});
