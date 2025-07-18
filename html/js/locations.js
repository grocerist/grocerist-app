const dataUrl = "json_dumps/locations.json";
const titleStyle = {
  color: primaryColor,
  fontWeight: "bold",
  fontSize: "20px",
};
const baseColumnDefinitions = [
  {
    title: "Type of location",
    field: "properties.location_type",
    formatter: makeItalic,
    headerFilter: "list",
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
    title: "Century",
    field: "centuries",
    formatter: "array",
    formatterParams: {
      delimiter: ", ",
    },
    sorter: "array",
    accessorDownload: function (value) {
      return value.join("; ");
    },
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: true,
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
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
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
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
  },
  {
    title: "District",
    field: "properties.upper_admin",
    mutator: reduceArrayMutator,
    formatter: function (cell, formatterParams, onRendered) {
      let value = cell.getValue();
      if (value === null) {
        return value;
      } else {
        return `<a href="district__${value.ids.database_table_1492}.html">${value.value}</a>`;
      }
    },
    sorter: objectSorter,
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: objectLookup,
      multiselect: false,
    },
    headerFilterFunc: objectHeaderFilter,
    accessorDownload: function (value) {
      return value && value.value ? value.value : "";
    },
    visible: false,
  },
  {
    field: "first_level",
    visible: false,
  },
];
// Add minWidth to each column
const columnDefinitions = baseColumnDefinitions.map((column) => {
  return {
    ...(column.field !== "first_level" ? { headerMenu: headerMenu } : {}),
    ...column,
    minWidth: 150,
  };
});

// drilldown data and selected lcoation type need to be global variables
let globalDrilldownData = [];
let selectedLocationType = "allLocations";
let districtColors = {};

function createColumnChart(containerId, data) {
  return Highcharts.chart(containerId, {
    chart: {
      type: "column",
      scrollablePlotArea: {
        minWidth: 500,
      },
      events: {
        drilldown: function (e) {
          if (!e.seriesOptions && globalDrilldownData.length > 0) {
            const drilldownData = globalDrilldownData;
            const chart = this;
            let drillDownSeries;
            if (selectedLocationType === "allLocations") {
              drillDownSeries = drilldownData.filter(
                (item) => item.drilldownKey === e.point.name
              );
            } else {
              drillDownSeries = drilldownData.filter(
                // just need the last part of the name
                (item) => item.drilldownKey === e.point.name.split(" of ").pop()
              );
            }
            // Calculate total data points across all series
            const totalLength = drillDownSeries.reduce((total, series) => {
              return total + series.data.length;
            }, 0);

            drillDownSeries.forEach((series) => {
              // dynamically set the bar widtht based on the length of the data and the chart width
              series.pointWidth = Math.min(
                chart.plotWidth / totalLength - 1,
                50
              );
              if (series.data.length > 0) {
                console.log(series);
                chart.addSingleSeriesAsDrilldown(e.point, series);
              }
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
      text: "Grocers per location by district",
      style: titleStyle,
    },
    subtitle: {
      text: `Filter the "location type" column to see the chart for a specific location type`,
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
        name: "Grocers per location",
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
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            yAxis: {
              title: {
                text: null,
              },
              labels: {
                enabled: false,
              },
            },
          },
        },
      ],
    },
    exporting: {
      sourceWidth: 1600,
      sourceHeight: 600,
      filename: "grocers_per_location",
      chartOptions: { xAxis: { labels: { step: 1 } } },
    },
  });
}

function calculateLocationData(rows, selectedLocationType, districtColors) {
  let topLevel = [];
  let drilldownData = [];
  let nonDistrictTypes = ["Mahalle", "Karye", "Nahiye", "Quarter", "Address"];
  let processedAdmins = new Set();

  function addDrilldownEntry(drilldownKey, name, colorIndex = null) {
    let entry = {
      name,
      drilldownKey,
      data: [],
    };
    if (colorIndex !== null) entry.color = colors[colorIndex];
    drilldownData.push(entry);
  }

  // First pass: Create top-level and drilldown structure
  rows.forEach((row) => {
    let rowData = row.getData();
    let { name, person_count, location_type } = rowData.properties;
    let firstLevel = rowData.first_level;
    if (selectedLocationType === "District" && location_type === "District") {
      topLevel.push({
        name,
        y: person_count,
        drilldownKey: name,
        drilldown: false,
        color: districtColors[name],
      });
    } else {
      // create the first level with each district available in the table
      if (firstLevel && !processedAdmins.has(firstLevel)) {
        let pointName =
          selectedLocationType !== "allLocations"
            ? `${selectedLocationType}${
                selectedLocationType === "Address" ? "e" : ""
              }s of ${firstLevel}`
            : firstLevel;
        topLevel.push({
          name: pointName,
          y: 0,
          drilldownKey: firstLevel,
          drilldown: true,
          color: districtColors[firstLevel],
        });
        if (selectedLocationType === "allLocations") {
          nonDistrictTypes.forEach((type, i) =>
            // for each location type, we set a different color (counting from the end, so they're different from the district colors)
            addDrilldownEntry(firstLevel, type, colors.length - 1 - i)
          );
        } else {
          addDrilldownEntry(firstLevel, firstLevel);
        }
        processedAdmins.add(firstLevel);
      }
    }
  });
  if (selectedLocationType !== "District") {
    // Second pass: Populate drilldown data, not necessary for districts
    topLevel.forEach((topEntry) => {
      let uniquePersons = new Set();
      drilldownData.forEach((entry) => {
        if (topEntry.drilldownKey === entry.drilldownKey) {
          rows.forEach((row) => {
            let rowData = row.getData();
            let { name, person_count, upper_admin, location_type, persons } =
              rowData.properties;
            upper_admin =
              upper_admin === null ? upper_admin : upper_admin.value;
            // for the chart type allLocations, we need to find the right drilldown series within a district
            // for specific location types, there is only one series per district anyway
            if (
              upper_admin === entry.drilldownKey &&
              (selectedLocationType !== "allLocations" ||
                location_type === entry.name)
            ) {
              entry.data.push({ name, y: person_count });
              persons.forEach((person) =>
                uniquePersons.add(person.grocerist_id)
              );
            }
          });
        }
      });
      topEntry.y = uniquePersons.size;
    });
  }
  return [topLevel, drilldownData];
}

(async function () {
  try {
    const dataFromJson = await d3.json(dataUrl);
    // remove items with an empty name (mostly found in the neighbourhoods table)
    const tableData = Object.values(dataFromJson)[1]
      .filter((item) => item.properties.name.trim() !== "")
      .map((item) => {
        const enriched = item;
        const centuries = new Set();
        item.properties.documents.forEach((doc) => {
          const century = doc.century?.value;
          if (century) {
            centuries.add(century);
          }
        });
        enriched["centuries"] = Array.from(centuries).sort();
        if (item.properties.location_type === "District") {
          enriched["first_level"] = item.properties.name;
        } else if (item.properties.upper_admin.length > 0) {
          enriched["first_level"] = item.properties.upper_admin[0].value;
        }
        return enriched;
      });

    const table = createTable("#places_table", {
      ...commonTableConfig,
      headerFilterLiveFilterDelay: 600,
      columns: columnDefinitions,
      data: tableData,
      initialSort: [{ column: "properties.name", dir: "asc" }],
    });
    handleDownloads(table, "Locations");
    let first = true;
    let chart;
    table.on("dataLoaded", function (data) {
      $(".total_count").text(data.length);
    });

    table.on("dataFiltered", function (filters, rows) {
      $(".search_count").text(rows.length);

      if (first) {
        // set specific colors for each district
        districtColors = rows.reduce((result, row, index) => {
          const data = row.getData().properties;
          if (data.location_type === "District") {
            result[data.name] = colors[index];
          }
          return result;
        }, {});
        // Create the chart
        let locationResults;
        [locationResults, globalDrilldownData] = calculateLocationData(
          rows,
          "allLocations",
          districtColors
        );
        chart = createColumnChart("location-chart", locationResults);
        first = false;
      }
      // Drill up to the top level if the chart is in a drilldown state
      if (chart.drilldownLevels && chart.drilldownLevels.length > 0) {
        chart.drillUp();
      }

      const locationTypeFilter = filters.find(
        (filter) => filter.field === "properties.location_type"
      );

      selectedLocationType = locationTypeFilter
        ? locationTypeFilter.value
        : "allLocations";
      [locationResults, globalDrilldownData] = calculateLocationData(
        rows,
        selectedLocationType,
        districtColors
      );
      // Update the chart with the new data
      chart.series[0].update({
        name:
          selectedLocationType === "allLocations"
            ? `Grocers per location`
            : `Grocers per ${selectedLocationType}`, // Set the name of the series
        data: locationResults, // Set the data of the series
      });

      chart.update({
        title: {
          text:
            selectedLocationType === "allLocations"
              ? `Grocers per location by district`
              : `Grocers per ${selectedLocationType} by district`,
        },
        exporting: {
          chartOptions: {
            subtitle: null,
          },
          filename:
            selectedLocationType === "allLocations"
              ? "grocers_per_location"
              : `grocers_per_${selectedLocationType.toLowerCase()}`,
        },
      });
      chart.redraw();
    });
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
})();
// Custom colors
Highcharts.setOptions({
  colors: colors,
});
