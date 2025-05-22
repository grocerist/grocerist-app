const dataUrl = "json_dumps/charts.json";
const titleStyle = {
  color: primaryColor,
  fontWeight: "bold",
  fontSize: "1.5rem",
};
let currentCentury1 = "18"; // default
let currentCentury = "18"; // default
const baseColumnChartOptions = {
  chart: { type: "column" },
  legend: { enabled: false },
  plotOptions: {
    series: {
      allowPointSelect: true,
      cursor: "pointer",
      dataLabels: { enabled: true, overflow: "none", crop: false },
    },
  },
  yAxisTitle: "Documents",
  exporting: { sourceWidth: 1200 },
};
const baseTooltip = {
  headerFormat: '<span style="font-size:11px">{series.name}</span><br/>',
  pointFormat: `<span style="color:{point.color}">{point.name}</span>: mentioned <b>{point.y}</b> times <br>
    in documents from the <i>${currentCentury}th century</i>`,
};

const baseDrilldown = {
  activeAxisLabelStyle: { color: "#000000", textDecoration: "unset" },
  activeDataLabelStyle: { color: "#000000", textDecoration: "unset" },
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

function createColumnChart({
  containerId,
  title,
  subtitle = "",
  series,
  drilldown = null,
  yAxisTitle = "Mentions",
  tooltip = undefined,
  xAxisType = "category",
  responsive = undefined,
  exporting = undefined,
  accessibility = undefined,
}) {
  const options = {
    chart: { type: "column" },
    title: { text: title, style: titleStyle },
    xAxis: { type: xAxisType },
    yAxis: { title: { text: yAxisTitle } },
    legend: { enabled: false },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: { enabled: true, overflow: "none", crop: false },
      },
    },
    series,
  };

  if (subtitle) options.subtitle = { text: subtitle };
  if (tooltip) options.tooltip = tooltip;
  if (drilldown) options.drilldown = drilldown;
  if (responsive) options.responsive = responsive;
  if (exporting) options.exporting = exporting;
  if (accessibility) options.accessibility = accessibility;

  return Highcharts.chart(containerId, options);
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
function createInteractiveBarChart(data, chartTitle = "Frequency of Mentions") {
  const totalLength = Object.values(data)
    .map((obj) => (Array.isArray(obj) ? obj.length : Object.keys(obj).length))
    .reduce((sum, len) => sum + len, 0);
  if (totalLength < 60) {
    const categories = Object.keys(data).sort();
    const allSeries = [];
    categories.forEach((category) => {
      const series = { "pointWidth": 10 };
      series["name"] = category;
      const products = data[category];
      series["data"] = Object.entries(products);
      allSeries.push(series);
    });
    console.log(allSeries);
    const simpleBarChartOptions = {
      ...baseColumnChartOptions,
      accessibility: {
        description:
          "This chart shows the number of times products in the selected range were mentioned in inheritance inventories during the selected century.",
      },
      containerId: "container_mentions_chart",
      title: chartTitle,
      series: allSeries,
      tooltip: baseTooltip,
    };
    return createColumnChart(simpleBarChartOptions);
  } else {
    const topLevel = [];
    const drilldown = [];
    const categories = Object.keys(data).sort();
    categories.forEach((category) => {
      const sum = Object.values(data[category]).reduce((a, b) => a + b, 0);
      topLevel.push({ name: category, y: sum, drilldown: category });
      drilldown.push({
        name: category,
        id: category,
        data: Object.entries(data[category]).map(([key, value]) => ({
          name: key,
          y: value,
        })),
      });
    });
    const groupedBarChartOptions = {
      ...baseColumnChartOptions,
      accessibility: {
        description:
          "This chart shows the number of times products in the selected range were mentioned in inheritance inventories during the selected century, grouped by product category.",
      },
      containerId: "container_mentions_chart",
      title: chartTitle,
      series: [
        {
          name: "All categories",
          colorByPoint: true,
          data: topLevel,
        },
      ],
      drilldown: {
        ...baseDrilldown,
        series: drilldown,
      },
      tooltip: baseTooltip,
    };
    return createColumnChart(groupedBarChartOptions);
  }
}

function flattenMentions(mentions) {
  const result = {};
  for (const [category, value] of Object.entries(mentions)) {
    result[category] = {};
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === "object" && val !== null) {
        // Recursively collect goods from nested objects
        collectGoods(val, result[category]);
      } else if (typeof val === "number") {
        // Direct good:number pair
        result[category][key] = val;
      }
    }
  }
  return result;

  function collectGoods(obj, target) {
    // If this object is a flat {good: number} object, collect all as goods
    const entries = Object.entries(obj);
    if (
      entries.length > 0 &&
      entries.every(([_, v]) => typeof v === "number")
    ) {
      entries.forEach(([good, count]) => {
        target[good] = count;
      });
      return;
    }
    // Collect goods from "goods" object if present
    if (obj.goods && typeof obj.goods === "object") {
      Object.entries(obj.goods).forEach(([good, count]) => {
        target[good] = count;
      });
    }
    // Collect direct good:number pairs at this level
    entries.forEach(([k, v]) => {
      if (typeof v === "number") {
        target[k] = v;
      } else if (typeof v === "object" && v !== null) {
        collectGoods(v, target);
      }
    });
    // Recursively check subcategories
    if (obj.subcategories && typeof obj.subcategories === "object") {
      Object.values(obj.subcategories).forEach((sub) =>
        collectGoods(sub, target)
      );
    }
  }
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
    const mentions = {
      "18": flattenMentions(dataFromJson.mentions_18),
      "19": flattenMentions(dataFromJson.mentions_19),
    };

    // Custom colors (default HighCharts list has too few)
    Highcharts.setOptions({
      colors: colors,
    });

    createPieChart("container_religion_chart", "Religion", relChartData);

    // Options for the bar charts

    const catChartOptions = {
      ...baseColumnChartOptions,
      accessibility: {
        description:
          "This chart shows the number of times products in a grocery category were mentioned in inheritance inventories during the selected century.",
      },
      containerId: "container_categories_chart",
      title: "Groceries by Category",
      subtitle:
        "Click the columns to see data about subcategories and/or groceries",
      series: [
        {
          name: "Grocery Categories",
          colorByPoint: true,
          data: catChartData["categories_" + currentCentury1],
        },
      ],
      drilldown: {
        ...baseDrilldown,
        series: catChartData["drilldown_" + currentCentury1],
      },
      tooltip: baseTooltip,
      exporting: {
        sourceWidth: 900,
        chartOptions: { subtitle: null },
      },
    };

    let catChart = createColumnChart(catChartOptions);

    // Redraw the Groceries by Category chart when the century is changed
    const select = document.getElementById("select-century");
    select.addEventListener("change", () => {
      currentCentury1 = select.value;
      catChart.destroy();
      catChart = createColumnChart(catChartOptions);
    });

    let interactiveBarChart = createInteractiveBarChart(
      mentions[currentCentury]
    );
    const centuries = ["18", "19"];
    centuries.forEach((century) => {
      const btn = document.getElementById(`btn-${century}`);
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".buttons button.active")
          .forEach((active) => {
            active.className = "btn grocerist-button";
          });
        btn.className = "btn grocerist-button active";
        currentCentury = century;
        // Clear the range inputs
        document.getElementById("min").value = "";
        document.getElementById("max").value = "";
        document.getElementById("chart-title").value = "";
        interactiveBarChart.destroy();
        interactiveBarChart = createInteractiveBarChart(mentions[century]);
      });
    });
    // Add event listener for title set button
    document
      .getElementById("set-title-btn")
      .addEventListener("click", function () {
        const title = document.getElementById("chart-title").value;
        interactiveBarChart.setTitle({ text: title });
      });
    // when the apply button is clicked, get the values from the inputs
    document
      .getElementById("range-apply-btn")
      .addEventListener("click", function () {
        const min = parseInt(document.getElementById("min").value, 10);
        const max = parseInt(document.getElementById("max").value, 10);
        const filteredData = {};
        for (const [category, products] of Object.entries(
          mentions[currentCentury]
        )) {
          filteredData[category] = {};
          for (const [product, count] of Object.entries(products)) {
            if (
              typeof count === "number" &&
              (!isNaN(min) ? count >= min : true) &&
              (!isNaN(max) ? count <= max : true)
            ) {
              filteredData[category][product] = count;
            }
          }
        }
        // create a new chart with the filtered data
        interactiveBarChart.destroy();
        let title =
          document.getElementById("chart-title").value ||
          "Frequency of Mentions";

        interactiveBarChart = createInteractiveBarChart(filteredData, title);
      });

    // Add visibility attribute for the spline charts
    setVisibilityForFirstElement(timeChartData);
    setVisibilityForFirstElement(normalizedTimeChartData);

    createSplineChart(timeChartData, false);

    createSplineChart(normalizedTimeChartData, true);
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
})();
