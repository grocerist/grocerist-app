const dataUrl = "json_dumps/persons.json";
const titleStyle = {
  color: primaryColor,
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
    title: "Century",
    field: "century",
    headerFilter: "list",
    headerFilterFunc: "in",
    headerFilterParams: {
      valuesLookup: "century",
      sort: "asc",
      multiselect: true,
    },
  },
  {
    title: "Religion",
    field: "religion",
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
    headerSort: false,
  },
  {
    title: "District",
    field: "district",
    ...linkListColumnSettings,
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: objectLookup,
      multiselect: false,
    },
    formatterParams: {
      urlPrefix: "district__",
      idField: "id",
      nameField: "value",
    },
    sorter: "array",
    sorterParams: {
      type: "string",
      valueMap: "value",
    },
  },
  {
    title: "<i>Mahalle</i>",
    field: "neighbourhood",
    titleDownload: "Mahalle",
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
    titleDownload: "Karye",
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
    titleDownload: "Nahiye",
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
];

// Add minWidth and visibility toggle to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  headerMenu: headerMenu,
  minWidth: 150,
}));

const getColor = {};

// generate chart
function generateChartsFromTable(rows, table) {
  let religionsResults = calculateReligionData(rows);
  createPieChart("religion-chart", "Religion", religionsResults, table);
  let districtResults = calculateDistrictData(rows);
  createColumnChart("districts-chart", "Districts", districtResults, table);
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
     responsive: {
      rules: [
        {
          condition: {
            maxWidth: 400,
          },
          chartOptions: {
            plotOptions: {
              series: {
                dataLabels: {
                  enabled: false,
                },
              },
            },
          },
        },
      ],
    },
  });
}

function createColumnChart(containerId, title, data, table) {
  Highcharts.chart(containerId, {
    chart: {
      type: "column",
    },

    legend: {
      enabled: false,
    },
    title: {
      text: title,
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
        allowPointSelect: true,
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              if (this.name === "Unknown") {
                // nothing happens
              } else {
                // set the filter value for the districts column
                table.setHeaderFilterValue("district", this.name);
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

function calculateDistrictData(rows) {
  let districtCount = {};
  // get the districts (html list elements) from each row
  rows.forEach((row) => {
    let rowData = row.getData();
    let districtData = rowData.district;
    let districtNames = districtData.map((item) => item.value);
    if (districtNames.length === 0) {
      districtCount["Unknown"] = (districtCount["Unknown"] || 0) + 1;
    } else {
      districtNames.forEach((value) => {
        districtCount[value] = (districtCount[value] || 0) + 1;
      });
    }
  });
  // Calculate the numbers for each district and store them in an array
  let results = Object.entries(districtCount).map(([district, count]) => ({
    name: district,
    y: count,
  }));
  return results;
}

(async function () {
  try {
    const dataFromJson = await d3.json(dataUrl);
    const tableData = Object.values(dataFromJson)
      .filter((item) => item.name !== "")
      // replace empty century values (NaN in Baserow) with null
      .map((item) => {
        if (isNaN(item.century)) {
          item.century = null;
        }
        let values = item.religion.map((entry) => entry.value);
        if (values.includes("Non muslim")) {
          values = ["Non muslim"].concat(
            values.filter((v) => v !== "Non muslim").sort()
          );
        } else {
          values = values.sort();
        }
        item.religion = values.join("|");

        return item;
      });

    const uniqueReligions = Array.from(
      new Set(tableData.map((item) => item.religion || "Unknown"))
    );
    // Assign colors to each unique religion key
    uniqueReligions.forEach((religion, idx) => {
      getColor[religion] = colors[idx];
    });
    const table = createTable("#persons-table", {
      ...commonTableConfig,
      columns: columnDefinitions,
      data: tableData,
      initialSort: [{ column: "name", dir: "asc" }],
    });
    handleDownloads(table, "Grocers");
    table.on("dataLoaded", function (data) {
      $(".total_count").text(data.length);
    });
    table.on("dataFiltered", function (_filters, rows) {
      $(".search_count").text(rows.length);
      generateChartsFromTable(rows, table);
    });
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
})();

// Custom colors (default HighCharts list has too few)
Highcharts.setOptions({
  colors: colors,
});
