const dataUrl = "json_dumps/charts.json";
const titleStyle = {
  color: "#BA833B",
  fontWeight: "bold",
  fontSize: "1.5rem",
};
function setVisibilityForFirstElement(chartData) {
  chartData[1].forEach((element, index) => {
    element.visible = index === 0; // Set visible: true for the first element, false for all others
  });
}

function createPieChart(containerId, title, data) {
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
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [
      {
        name: "Percentage",
        colorByPoint: true,
        data: data,
      },
    ],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            title: {
              style: { fontSize: "1rem" },
            },
            plotOptions: {
              series: {
                dataLabels: {
                  distance: 10,
                  style: {
                    fontSize: "0.5rem",
                  },
                },
              },
            },
          },
        },
      ],
    },
  });
}

function createColumnChart(containerId, title, data, century = 18) {
  const chart = Highcharts.chart(containerId, {
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
    subtitle: {
      text: "Click the columns to see data about subcategories and/or groceries",
    },
    xAxis: {
      type: "category",
      reversed: true,
    },
    yAxis: {
      title: {
        text: "Number of Documents",
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br/>',
      pointFormat: `<span style="color:{point.color}">{point.name}</span>: mentioned <b>{point.y}</b> times <br>
      in documents from the <i>${century}th century</i>`,
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          overflow: "none",
          crop: false,
        },
      },
    },
    series: [
      {
        name: "Grocery Categories",
        dataSorting: {
          enabled: true,
          sortKey: "name",
        },
        colorByPoint: true,
        data: data["categories_" + century],
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
      series: data["drilldown_" + century],
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            title: {
              style: { fontSize: "1rem" },
            },
            yAxis: {
              labels: { align: "left", x: 0, y: -2 },
              title: { text: "" },
            },
          },
        },
      ],
    },
    exporting: {
      //downloaded image will have this width * scale (2 by default)
      sourceWidth: 900,
      chartOptions: {
        subtitle: null,
      },
    },
  });
  return chart;
}

function createSplineChart(containerId, title, yAxisTitle, data, tooltipText) {
  return Highcharts.chart(containerId, {
    chart: {
      type: "spline",
      zoomType: "x",
    },
    title: {
      text: title,
      style: titleStyle,
    },
    subtitle: {
      text: "Select more categories to display their numbers, <br/> click and drag in the plot area to zoom in",
    },
    legend: {
      layout: 'vertical',
      align: 'left',
      verticalAlign: 'top',
      itemWidth: 100, 
      labelFormatter: function() {
        // Apply bold style to main category legend items
        if (this.userOptions.is_main_category) {
          return '<span style="font-weight:bold;">' + this.name + '</span>';
        } else {
          return this.name;
        }
      },
      itemHiddenStyle: {
        color: "#d3d3d3",
        textDecoration: "none",
      },
    },
    xAxis: {
      title: {
        text: "Decades",
      },
      labels: {
        format: "{value}s",
      },
      categories: data[0],
    },
    yAxis: {
      title: {
        text: yAxisTitle,
      },
    },
    tooltip: {
      headerFormat: "<span>{point.key}s</span><br>",
      pointFormat: `<span style="color:{point.color}">{series.name}</span>: <b>{point.y}</b>${tooltipText}<br/>`,
      shared: true,
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
        enableMouseTracking: false,
      },
    },
    series: data[1],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            title: {
              style: { fontSize: "1rem" },
            },
            subtitle: {
              text: "Select more categories to display their numbers",
            },
            yAxis: {
              labels: { align: "left", x: 0, y: -2 },
              title: { text: "" },
            },
          },
        },
      ],
    },
    exporting: {
      //downloaded image will have this width/height * scale (2 by default)
      sourceWidth: 900,
      sourceHeight: 500,
      chartOptions: {
        subtitle: null,
      },
    },
  });
}
d3.json(dataUrl, function (data) {
  const relChartData = Object.values(data.religions);
  const catChartData = {
    categories_18: Object.values(data.categories_18),
    drilldown_18: Object.values(data.categories_18_drilldown),
    categories_19: Object.values(data.categories_19),
    drilldown_19: Object.values(data.categories_19_drilldown),
  };
  const timeChartData = Object.values(data.categories_over_decades);
  const normalizedTimeChartData = Object.values(
    data.normalized_categories_over_decades
  );

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

  createPieChart("container_religion_chart", "Religion", relChartData);
  let catChart = createColumnChart(
    "container_categories_chart",
    "Groceries by Category",
    catChartData
  );
  // Redraw the Groceries by Category chart when the century is changed
  const select = document.getElementById("select-century");
  select.addEventListener("change", () => {
    const century = select.value;
    catChart.destroy();
    catChart = createColumnChart(
      "container_categories_chart",
      "Groceries by Category",
      catChartData,
      century
    );
  });

  // Add visibility attribute for the spline charts
  setVisibilityForFirstElement(timeChartData);
  setVisibilityForFirstElement(normalizedTimeChartData);

  createSplineChart(
    "container_time_chart",
    "Category Mentions Over Time",
    "Number of Documents",
    timeChartData,
    " document(s)"
  );
  createSplineChart(
    "container_normalized_time_chart",
    "Category Mentions Over Time: Document Percentage by Decade",
    "Percentage of Documents from a Decade",
    normalizedTimeChartData,
    "% of documents from this decade"
  );
});
