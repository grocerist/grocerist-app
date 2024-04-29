const dataUrl = 'json_dumps/charts.json'
const titleStyle = {
  color: '#993333',
  fontWeight: 'bold',
  fontSize: '30px'
}
function setVisibilityForFirstElement (chartData) {
  chartData[1].forEach((element, index) => {
    element.visible = index === 0 // Set visible: true for the first element, false for all others
  })
}

function createPieChart (containerId, title, data) {
  return Highcharts.chart(containerId, {
    chart: {
      type: 'pie'
    },
    title: {
      text: title,
      style: titleStyle
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
        data: data
      }
    ]
  })
}

function createColumnChart (containerId, title, data, century = 18) {
  const chart = Highcharts.chart(containerId, {
    chart: {
      type: 'column'
    },

    legend: {
      enabled: false
    },
    title: {
      text: title,
      style: titleStyle
    },
    subtitle: {
      text: 'Click the columns to view the groceries in that category'
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
      headerFormat: '<span style="font-size:11px">{series.name}</span><br/>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: mentioned in <b>{point.y}</b> documents<br/>'
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          overflow: 'none',
          crop: false
        }
      }
    },
    series: [
      {
        name: 'Grocery Categories',
        dataSorting: {
          enabled: true,
          sortKey: 'name'
        },
        colorByPoint: true,
        data: data['categories_'+ century]
      }
    ],
    drilldown: {
      activeAxisLabelStyle: {
        color: '#000000',
        textDecoration: 'unset'
      },
      activeDataLabelStyle: {
        color: '#000000',
        textDecoration: 'unset'
      },
      series: data['drilldown_' + century]
    }
  })
  return chart
}

function createSplineChart (containerId, title, yAxisTitle, data, tooltipText) {
  return Highcharts.chart(containerId, {
    chart: {
      type: 'spline',
      zoomType: 'x'
    },
    title: {
      text: title,
      style: titleStyle
    },
    subtitle: {
      text: '(Select more categories to display their numbers, <br/> click and drag in the plot area to zoom in)'
    },
    legend: {
      itemHiddenStyle: {
        color: '#d3d3d3',
        textDecoration: 'none'
      }
    },
    xAxis: {
      title: {
        text: 'Decades'
      },
      labels: {
        format: '{value} AH'
      },
      categories: data[0]
    },
    yAxis: {
      title: {
        text: yAxisTitle
      }
    },
    tooltip: {
      headerFormat: '<span>{point.key}</span> AH<br>',
      pointFormat: `<span style="color:{point.color}">{series.name}</span>: <b>{point.y}</b>${tooltipText}<br/>`,
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
    series: data[1]
  })
}
d3.json(dataUrl, function (data) {
  const relChartData = Object.values(data.religions)
  const catChartData = {
    categories_18: Object.values(data.categories_18),
    drilldown_18: Object.values(data.categories_18_drilldown),
    categories_19: Object.values(data.categories_19),
    drilldown_19: Object.values(data.categories_19_drilldown)
  }
  const timeChartData = Object.values(data.categories_over_decades)
  const normalizedTimeChartData = Object.values(
    data.normalized_categories_over_decades
  )

  // Custom colors (default HighCharts list has too few)
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

  createPieChart('container_religion_chart', 'Religion', relChartData)
 let catChart = createColumnChart(
    'container_categories_chart',
    'Groceries by Category',
    catChartData
  )
  const select = document.getElementById('select-century')
  select.addEventListener('change', () => {
    const century = select.value
    catChart.destroy()
    catChart = createColumnChart(
      'container_categories_chart',
      'Groceries by Category',
      catChartData, 
      century
    )
  })

  // Add visibility attribute for the spline charts
  setVisibilityForFirstElement(timeChartData)
  setVisibilityForFirstElement(normalizedTimeChartData)

  createSplineChart(
    'container_time_chart',
    'Category Mentions Over Time',
    'Number of Documents',
    timeChartData,
    ' documents'
  )
  createSplineChart(
    'container_normalized_time_chart',
    'Category Mentions Over Time: Document Percentage by Decade',
    'Percentage of Documents from a Decade',
    normalizedTimeChartData,
    '% of documents from this decade'
  )
})
