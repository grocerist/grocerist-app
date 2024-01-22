const dataUrl = 'json_dumps/charts.json'
d3.json(dataUrl, function (data) {
  const relChartData = Object.values(data.religions)
  // Create the religions chart
  const religionsChart = Highcharts.chart('container religion_chart', {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Religion'
    },
    tooltip: {
      valueSuffix: '%'
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [
      {
        name: 'Percentage',
        colorByPoint: true,
        data: relChartData
      }
    ]
  })
  // Create categories chart
  const catChartData = Object.values(data.categories)
  const drilldownData = Object.values(data.categories_drilldown)
  Highcharts.chart('container categories_chart', {
    chart: {
      type: 'column'
    },

    legend: {
      enabled: false
    },
    title: {
      text: 'Good Categories'
    },
    xAxis: {
        type: 'category',
        reversed: true
    },
    yAxis: {
        title: {
            text: 'Number of Documents'
        }

    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: mentioned in <b>{point.y}</b> documents<br/>'
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [
      {
        name: 'Good Categories',
        dataSorting: {
            enabled: true,
            sortKey: 'name'
        },
        colorByPoint: true,
        data: catChartData
      }
    ],
    drilldown: {
      series: drilldownData
    }
  })

// Create category time series
const timeChartData = Object.values(data.categories_over_decades)
Highcharts.chart('container', {
  chart: {
      type: 'spline'
  },
  title: {
      text: 'Mentions of Good Categories over Decades'
  },
    xAxis: {
      categories:timeChartData[0]
  },
  yAxis: {
      title: {
          text: 'Number of Documents'
      }
  },
  plotOptions: {
      line: {
          dataLabels: {
              enabled: true
          },
          enableMouseTracking: false
      },
      
  },
  series: timeChartData[1]
});
})


