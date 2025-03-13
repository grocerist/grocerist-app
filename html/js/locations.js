const dataUrl = "json_dumps/locations.json";

const titleStyle = {
  color: primaryColor,
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
    headerSort: false,
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
    headerSort: false,
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
    // headerFilterFunc: "in",
    headerFilterParams: {
      valuesLookup: true,
      multiselect: false,
      itemFormatter: makeItalic,
    },
  },
  {
    title: "District",
    field: "properties.upper_admin",
    mutator: function (value
    ) {
      if (value === "N/A") {
        return null;
      } else if (value[0]) {
        return value[0].value;
      }
      else {
        return "Unknown";
      }
    },
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: true,
      multiselect: false,
    },
    headerFilterFunc: "=",
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
                console.log(this)
                // set the filter value for the column with the current location type
                // table.setHeaderFilterValue("properties.upper_admin", this.name);
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
    drilldown: {
      activeAxisLabelStyle: {
        color: "#000000",
        textDecoration: "unset",
      },
      activeDataLabelStyle: {
        color: "#000000",
        textDecoration: "unset",
      },
      series: [],
    },
    exporting: {
      sourceWidth: 900,
      chartOptions: {
        title: {
          text: "Districts",
          style: titleStyle,
        },
      },
      filename: "grocers_by_district",
    },
  });
}

function calculateLocationData(rows, locationType = "District") {
  let results = [];
  let drilldown =[]
  // first pass to get the 1st level of the chart
  rows.forEach(row => {
    let rowData = row.getData();
    if (rowData.properties.location_type === locationType) {
      results.push({
        name: rowData.properties.name,
        y: rowData.properties.person_count,
        drilldown: rowData.properties.name,
      });

      // Add district to drilldown list
      drilldown.push({
        name: rowData.properties.name,
        id: rowData.properties.name,
        data: []
      });
    }})
  //second pass for the drilldown data
  rows.forEach(row => {
    let rowData = row.getData();
    if (rowData.properties.upper_admin){
      drilldown.forEach(drill => {
        if (drill.id === rowData.properties.upper_admin){
          drill.data.push({
            name: rowData.properties.name,
            y: rowData.properties.person_count,
          });
        }
      });
    }
  })
  return [results, drilldown];
}
d3.json(dataUrl, function (dataFromJson) {
  // remove items with an empty name (mostly found in the neighbourhoods table)
  const tableData = Object.values(dataFromJson)[1].filter(
    (item) => item.properties.name.trim() !== ""
  );
  tableConfig.data = tableData;
  const table = new Tabulator("#places_table", tableConfig);
  // Create the chart with data for Districts
  let [results, drilldown] = calculateLocationData(table.getRows(), "District");
  const chart = createColumnChart(
    "location-chart",
    "District",
    results,
    table
  );
  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });

  table.on("dataFiltered", function (filters, rows) {
    $("#search_count").text(rows.length);
    const locationTypeFilter = filters.find(
      (filter) => filter.field === "properties.location_type"
    );
    if (locationTypeFilter) {
      locTypeSelect.value = locationTypeFilter.value;
      // Manually dispatch a change event
      const event = new Event("change");
      locTypeSelect.dispatchEvent(event);
    }
    const locType = locTypeSelect.value;
    let [results, drilldown] = calculateLocationData(rows, locType)
    chart.series[0].update({
      name: locType, // Set the name of the series
      data: results // Set the data of the series
    });
    console.log(drilldown)
    chart.update({
      drilldown:{
        series: drilldown
      },
      exporting: {
        chartOptions: {
          title: {
            text: `${locType}s`,
          },
        },
        filename: `grocers_by_${locType.toLowerCase()}`,
      },
    });
  });
  locTypeSelect.addEventListener("change", () => {
    // if the table isn't already filtered by location type
    // or if the filter value is different from the selected value, filter it
    if (
      !table
        .getHeaderFilters()
        .find(
          (filter) =>
            filter.field === "properties.location_type" &&
            filter.value === locTypeSelect.value
        )
    ) {
      table.setHeaderFilterValue(
        "properties.location_type",
        locTypeSelect.value
      );
    }
    // this will trigger the dataFiltered event and update the chart
  });
});
// Custom colors
Highcharts.setOptions({
  colors: colors,
});
