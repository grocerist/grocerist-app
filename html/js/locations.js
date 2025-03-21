const dataUrl = "json_dumps/locations.json";

const titleStyle = {
  color: primaryColor,
  fontWeight: "bold",
  fontSize: "20px",
};
const baseColumnDefinitions = [
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
    cssClass: "location-type-filter",
  },
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
    title: "District",
    field: "properties.upper_admin",
    mutator: function (value) {
      if (value === "N/A") {
        return null;
      } else if (value[0]) {
        return value[0].value;
      } else {
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

function createColumnChart(
  containerId,
  locationType,
  data,
  drilldownData,
  table
) {
  return Highcharts.chart(containerId, {
    chart: {
      type: "column",
      events: {
        drilldown: function (e) {
          if (!e.seriesOptions) {
            const chart = this;
            let series;
            if (locationType === "District") {
              series = drilldownData.filter(
                (item) => item.drilldownKey === e.point.name
              );
            } else {
              series = drilldownData.filter(
                (item) =>
                  item.drilldownKey === e.point.name.split(" of ").pop()
              );
            }
            series.forEach((series) => {
              chart.addSingleSeriesAsDrilldown(e.point, series);
            });
            chart.applyDrilldown();
          }
        },
      },
    },
    legend: {
      enabled: false,
    },
    title: {
      text:
        locationType === "District"
          ? `Grocers per location by district`
          : `Grocers per ${locationType} by district`,
      style: titleStyle,
    },
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
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [
      {
        name: `${locationType}s`,
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

function calculateLocationData(rows, locationType, areDistrictsGone) {
  let topLevel = [];
  let drilldown = [];
  let nonDistrictTypes = ["Mahalle", "Karye", "Nahiye", "Quarter", "Address"];
  let processedAdmins = new Set();
  let uniquePersons = new Set();

  function addDrilldownEntry(
    drilldownKey,
    name,
    pointWidth,
    colorIndex = null
  ) {
    let entry = {
      name,
      drilldownKey,
      pointWidth,
      data: [],
    };
    if (colorIndex !== null) entry.color = colors[colorIndex];
    drilldown.push(entry);
  }

  // First pass: Create top-level and drilldown structure
  rows.forEach((row) => {
    let rowData = row.getData();
    let { name, person_count, location_type, upper_admin} =
      rowData.properties;

    if (
      locationType === "District" &&
      location_type === locationType &&
      !areDistrictsGone
    ) {
      topLevel.push({ name, y: person_count, drilldown: true });
      nonDistrictTypes.forEach((type, i) =>
        addDrilldownEntry(name, type, 10, colors.length - 1 - i)
      );
    } else if (
      (locationType !== "District" && location_type === locationType) ||
      areDistrictsGone
    ) {
      if (!processedAdmins.has(upper_admin) && upper_admin !== "Unknown") {
        let pointName =
          locationType !== "District"
            ? `${locationType}s of ${upper_admin}`
            : upper_admin;
        topLevel.push({
          name: pointName,
          y: 0,
          drilldownKey: upper_admin,
          drilldown: true,
        });
        addDrilldownEntry(upper_admin, upper_admin, 20);
        processedAdmins.add(upper_admin);
      }
    }
  });

  // Second pass: Populate drilldown data
  drilldown.forEach((entry) => {
    rows.forEach((row) => {
      let rowData = row.getData();
      let { name, person_count, upper_admin, location_type, persons } =
        rowData.properties;
      if (locationType === "District" && !areDistrictsGone) {
        if (
          upper_admin === entry.drilldownKey &&
          location_type === entry.name
        ) {
          entry.data.push({ name, y: person_count });
        }
      } else {
        if (upper_admin === entry.drilldownKey) {
          entry.data.push({ name, y: person_count });
          persons.forEach((person)=> uniquePersons.add(person.grocerist_id));
        }
      }
    });

    if (locationType !== "District" || areDistrictsGone) {
      let topEntry = topLevel.find(
        (item) => item.drilldownKey === entry.drilldownKey
      );
      if (topEntry) topEntry.y = uniquePersons.size;
    }
  });
  return [topLevel, drilldown];
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
    const locationTypeFilter = filters.find(
      (filter) => filter.field === "properties.location_type"
    );
    const upperAdminFilter = filters.find(
      (filter) => filter.field === "properties.upper_admin"
    );
    const areDistrictsGone = upperAdminFilter ? true : false;
    const locType = locationTypeFilter ? locationTypeFilter.value : "District";
    let [results, drilldown] = calculateLocationData(
      rows,
      locType,
      areDistrictsGone
    );
    createColumnChart("location-chart", locType, results, drilldown, table);
    // chart.series[0].update({
    //   name: locType, // Set the name of the series
    //   data: results, // Set the data of the series
    // });
    // chart.update({
    //   // drilldown: {
    //   //   series: drilldown,
    //   // },
    //   exporting: {
    //     chartOptions: {
    //       title: {
    //         text: `${locType}s`,
    //       },
    //     },
    //     filename: `grocers_by_${locType.toLowerCase()}`,
    //   },
    // });
  });
});
// Custom colors
Highcharts.setOptions({
  colors: colors,
});
