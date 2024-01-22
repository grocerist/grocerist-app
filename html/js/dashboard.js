const dataUrl = 'json_dumps/charts.json'
d3.json(dataUrl, function (data) {
  const relChartData = Object.values(data.religions)
  Highcharts.setOptions({
    colors: [
      '#536e61',
      '#9CC69B',
      '#cf7332',
      '#993333',
      '#9cc288',
      '#EDB183',
      '#79B4A9',
      '#5E8B7E',
      '#A2CAB3',
      '#E0A180',
      '#CC9999',
      '#BFD1B3',
      '#D6BABA',
      '#CCFF66',
      '#FAD02E',
      '#FF9966',
      '#CC9966',
      '#CCFFCC',
      '#FFD633',
      '#FF9966',
      '#FFB366',
      '#87CEEB',
      '#AFEEEE',
      '#FFDAB9',
      '#F0E68C',
      '#98FB98',
      '#F08080',
      '#20B2AA',
      '#87CEFA',
      '#9400D3',
      '#66CDAA',
      '#8A2BE2',
      '#32CD32',
      '#6495ED',
      '#B8860B',
      '#008080',
      '#DC143C',
      '#556B2F',
      '#2F4F4F',
      '#FF1493',
      '#4B0082',
      '#7FFF00'
    ]
  })
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
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: mentioned in <b>{point.y}</b> documents<br/>'
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

  // Add visibility attribute
  timeChartData[1].forEach((element, index) => {
    element.visible = index === 0 // Set visible: true for the first element, false for all others
  })

  Highcharts.chart('container', {
    chart: {
      type: 'spline'
    },
    subtitle: {
      text: 'Select more categories to see the number of documents mentioned'
    },
    title: {
      text: 'Mentions of Good Categories over Decades'
    },
    xAxis: {
      title: {
        text: 'Decades'
      },
      labels: {
        format: '{value} AH'
      },
      categories: timeChartData[0]
    },
    yAxis: {
      title: {
        text: 'Number of Documents'
      }
    },
    tooltip: {
      headerFormat: '<span>{point.key}</span> AH<br>',
      pointFormat:
        '<span style="color:{point.color}">{series.name}</span>: <b>{point.y}</b> documents<br/>',
      shared: true
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: timeChartData[1]
  })
})
