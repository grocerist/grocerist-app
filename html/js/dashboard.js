const dataUrl = "json_dumps/charts.json";
const titleStyle = {
  color: primaryColor,
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
    accessibility: {
      description:
        "This chart shows the distribution of the religions of the grocers in the inheritance inventories.",
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
    accessibility: {
      description:
        "This chart shows the number of times products in a grocery category were mentioned in inheritance inventories during the selected century.",
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
    },
    yAxis: {
      title: {
        text: "Mentions",
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
          enabled: false,
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

function createSplineChart(data, isNormalized) {
  return Highcharts.chart(
    isNormalized ? "container_normalized_time_chart" : "container_time_chart",
    {
      chart: {
        type: "spline",
        zoomType: "x",
      },
      accessibility: {
        description: `This chart shows the ${
          isNormalized ? "percentage" : "frequency"
        } of mentions of a grocery in a grocery category in inheritance inventories ${
          isNormalized ? "relative to the total number of product mentions" : ""
        } during each decade.`,
      },
      title: {
        text: isNormalized
          ? "Category Mentions Over Time: Percentage of Total Mentions"
          : "Category Mentions Over Time",
        style: titleStyle,
      },
      subtitle: {
        text: "Select more categories to display their numbers, <br/> click and drag in the plot area to zoom in",
      },
      legend: {
        layout: "vertical",
        align: "left",
        verticalAlign: "top",
        itemWidth: 100,
        labelFormatter: function () {
          // Apply bold style to main category legend items, italic to subsub categories
          if (this.userOptions.category === "main") {
            return `<span style="font-weight:bold;">${this.name}</span>`;
          } else if (this.userOptions.category === "subsub") {
            return `<span style="font-style:italic;">&nbsp;&nbsp; ${this.name}</span>`;
          } else {
            return `<span>&nbsp; ${this.name}</span>`;
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
          text: `${isNormalized ? "Percentage" : "Mentions"}`,
        },
      },
      tooltip: {
        headerFormat: "<span>{point.key}s</span><br>",
        pointFormat: `<span style="color:{point.color}">{series.name}</span>: ${
          isNormalized
            ? "<b>{point.y}</b> % of product mentions from this decade"
            : " mentioned <b>{point.y}</b> times"
        }<br/>`,
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
    }
  );
}
function createHistogram(data) {
  console.log(data);
  return Highcharts.chart("container_histogram", {
    title: {
      text: "Mentions of Goods in 18th Century",
    },
    plotOptions: {
      series: {
        // general options for all series
      },
      histogram: {
        // shared options for all histogram series
      },
    },
    series: [
      {
        // specific options for this series instance
        type: "histogram",
        xAxis: 0,
        yAxis: 0,
        baseSeries: 1,
        binsNumber: "square-root",
    }, {
      
      data: data[1],
    }]
  });
}
(async function () {
  try {
    const dataFromJson = await d3.json(dataUrl);

    const relChartData = Object.values(dataFromJson.religions);
    const catChartData = {
      categories_18: Object.values(dataFromJson.categories_18),
      drilldown_18: Object.values(dataFromJson.categories_18_drilldown),
      categories_19: Object.values(dataFromJson.categories_19),
      drilldown_19: Object.values(dataFromJson.categories_19_drilldown),
    };
    const timeChartData = Object.values(dataFromJson.categories_over_decades);
    const normalizedTimeChartData = Object.values(
      dataFromJson.normalized_categories_over_decades
    );
    const histogramData = Object.values(dataFromJson.histogram);

    // Custom colors (default HighCharts list has too few)
    Highcharts.setOptions({
      colors: colors,
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

    createSplineChart(timeChartData, false);
    console.log(timeChartData);
    createSplineChart(normalizedTimeChartData, true);
    createHistogram(histogramData);
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
})();
