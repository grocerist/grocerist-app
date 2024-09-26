const dataUrl = "json_dumps/locations.json";
const titleStyle = {
  color: "#BA833B",
  fontWeight: "bold",
  fontSize: "20px",
};
const baseColumnDefinitions = [
  {
    title: "Name",
    field: "properties.name",
    headerFilter: "input",
    formatter: function (cell) {
      return linkToDetailView(cell);
    },
  },
  {
    title: "Documents",
    field: "properties.documents",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "document__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "Nr. of Documents",
    field: "properties.doc_count",
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: ">=",
  },
  {
    title: "Persons",
    field: "properties.persons",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "person__",
      idField: "id",
      nameField: "name",
    },
    headerFilterFuncParams: { nameField: "name" },
  },
  {
    title: "Nr. of Persons",
    field: "properties.person_count",
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: ">=",
  },
  {
    title: "Location Type",
    field: "properties.location_type",
    formatter: makeItalic,
    headerFilter: "list",
    headerFilterFunc: "in",
    headerFilterParams: {
      valuesLookup: true,
      multiselect: true,
      itemFormatter: makeItalic,
    },
  },
];
// Add minWidth to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 150,
}));

// Config settings for table
const tableConfig = {
  ...commonTableConfig,
  headerFilterLiveFilterDelay: 600,
  columns: columnDefinitions,
  initialSort: [{ column: "properties.name", dir: "asc" }],
  footerElement: `<span class="tabulator-counter float-left">
  Showing <span id="search_count"></span> results out of <span id="total_count"></span>
  </span>`,
};
const locTypeSelect = document.getElementById("select-location");
function generateChartFromTable(rows, table) {
  const locationType = locTypeSelect.value;
  let locationResults = calculateLocationData(rows, locationType);
  return createColumnChart(
    "location-chart",
    locationType,
    locationResults,
    table
  );
}

function createColumnChart(containerId, locationType, data, table) {
  return Highcharts.chart(containerId, {
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
        text: "Grocers",
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br/>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span><br> <b>{point.y}</b> grocers<br/>',
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
        dataSorting: {
          enabled: true,
          sortKey: "name",
        },
        colorByPoint: true,
        data: data,
      },
    ],
    exporting: {
      chartOptions: {
        title: {
          // CHECKME: doesn't work because the chart is not regenerated when the location type changes
          text: `${locTypeSelect.value}s`,
          style: titleStyle,
        },
      },
    },
  });
}

function calculateLocationData(rows, locationType = "District") {
  let results = rows.reduce((resultList, row) => {
    let rowData = row.getData();
    console.log(rowData.properties.persons);
    if (rowData.properties.location_type === locationType) {
      resultList.push({
        name: rowData.properties.name,
        y: rowData.properties.person_count,
      });
    }
    return resultList;
  }, []);
  return results;
}
d3.json(dataUrl, function (dataFromJson) {
  // remove items with an empty name (mostly found in the neighbourhoods table)
  const tableData = Object.values(dataFromJson)[1].filter(
    (item) => item.properties.name.trim() !== ""
  );
  tableConfig.data = tableData;
  const table = new Tabulator("#places_table", tableConfig);
  let chart;
  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });
  table.on("dataFiltered", function (filters, rows) {
    $("#search_count").text(rows.length);
    chart = generateChartFromTable(rows, table);
  });
  locTypeSelect.addEventListener("change", () => {
    let rows = table.getRows();
    chart.series[0].setData(calculateLocationData(rows, locTypeSelect.value));
  });
});
// Custom colors
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
