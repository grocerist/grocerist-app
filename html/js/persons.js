const dataUrl = 'json_dumps/persons.json'
const titleStyle = {
  color: '#79B4A9',
  fontWeight: 'bold',
  fontSize: '20px'
}
const locTypeSelect = document.getElementById('select-location')
const TABLE_CFG = {
  pagination: true,
  paginationSize: 15,
  height: 800,
  layout: 'fitColumns',
  tooltips: true,
  responsiveLayout: 'collapse',
  columns: [
    {
      title: 'Name',
      field: 'name',
      headerFilter: 'input',
      formatter: linkToDetailView
    },
    {
      title: 'Religion',
      field: 'religion',
      mutator: mutateSelectField,
      formatter: 'html',
      headerFilter: 'list',
      headerFilterFunc: 'in',
      headerFilterParams: {
        valuesLookup: 'religion',
        sort: 'asc',
        multiselect: true
      }
    },
    {
      title: 'Documents',
      field: 'documents',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'document__',
        idField: 'id',
        nameField: 'value'
      }
    },
    {
      title: 'District',
      field: 'district',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'district__',
        idField: 'id',
        nameField: 'value'
      }
    },
    {
      title: '<i>Mahalle</i>',
      field: 'neighbourhood',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'neighbourhood__',
        idField: 'id',
        nameField: 'value'
      }
    },
    {
      title: '<i>Karye</i>',
      field: 'karye',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'karye__',
        idField: 'id',
        nameField: 'value'
      }
    },
    {
      title: '<i>Nahiye</i>',
      field: 'nahiye',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'nahiye__',
        idField: 'id',
        nameField: 'value'
      }
    },
    {
      title: 'Quarter',
      field: 'quarter',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'quarter__',
        idField: 'id',
        nameField: 'value'
      }
    },
    {
      title: 'Address',
      field: 'address',
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: 'address__',
        idField: 'id',
        nameField: 'value'
      }
    }
  ],
  footerElement:
    '<span class="tabulator-counter float-left">' +
    'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
    '</span>'
}

const getColor = {
  'Muslim' : '#9cc288',
  'Non muslim/Orthodox': '#536e61',
  'Non muslim/Armenian': '#cf7332',
  'Non muslim':'#EDB183',
  'Unknown' : '#993333'
}

// generate both charts
function generateChartsFromTable (rows, table) {
  let religionsResults = calculateReligionData(rows)
  createPieChart('religion-chart', 'Religion', religionsResults, table)
  generateChartSelect(rows, table)
}
// generate chart for selected location type
function generateChartSelect(rows, table) {
  const locationType = locTypeSelect.value
  let locationResults = calculateLocationData(rows, locationType)
  createColumnChart('location-chart', locationType, locationResults, table)
}

function createPieChart (containerId, title, data, table) {
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
        point: {
          events: {
            click: function () {
              if (this.name === 'Unknown') {
                //nothing happens
              } else {
                table.setHeaderFilterValue('religion', [this.name])
              }
            }
          }
        },
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [
      {
        name: 'Percentage',
        colorByPoint: true,
        data: data.map(item => ({
          ...item,
          color: getColor[item.name]
        }))
      }
    ]
  })
}

function createColumnChart (containerId, locationType, data, table) {
  Highcharts.chart(containerId, {
    chart: {
      type: 'column'
    },

    legend: {
      enabled: false
    },
    title: false,
    xAxis: {
      type: 'category',
      reversed: true
    },
    yAxis: {
      title: {
        text: 'Persons'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br/>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span> <b>{point.y}</b> persons<br/>'
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              if (this.name === 'Unknown') {
                // nothing happens
              } else {
                // set the filter value for the column with the current location type
                table.setHeaderFilterValue(locationType, this.name)
              }
            }
          }
        },
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [
      {
        name: 'Districts',
        dataSorting: {
          enabled: true,
          sortKey: 'name'
        },
        colorByPoint: true,
        data: data
      }
    ]
  })
}
// Function to calculate percentage  and round it to 2 decimal places
function calculatePercentage (count, total) {
  let percentage = (count / total) * 100
  return parseFloat(percentage.toFixed(2))
}
function calculateReligionData (rows) {
  let religionCount = {}
  let totalPersons = rows.length
  rows.forEach(row => {
    let rowData = row.getData()
    // Combine multiple values into one key
    let religionKey = rowData.religion.replace(/(<([^>]+)>)/gi, '')
    // Check if the resulting string is empty
    if (religionKey.trim() === '') {
      religionKey = 'Unknown'
    }
    // Update the count for a specific religion
    religionCount[religionKey] = (religionCount[religionKey] || 0) + 1
  })

  // Calculate the percentages for each religion and store them in an array
  let results = Object.entries(religionCount).map(([religion, count]) => ({
    name: religion,
    y: calculatePercentage(count, totalPersons)
  }))
  return results
}

function calculateLocationData (rows, locationType = 'district') {
  let locationCount = {}
  // get the locations (html list elements) from each row
  rows.forEach(row => {
    let rowData = row.getData()
    console.log(rowData)
    let locationData = rowData[locationType]
    let locationNames = locationData.map(item => item.value)
    if (locationNames.length === 0) {
      locationCount['Unknown'] = (locationCount['Unknown'] || 0) + 1
    } else {
      locationNames.forEach(value => {
        locationCount[value] = (locationCount[value] || 0) + 1
      })
    }
  })
  // Calculate the numbers for each location type and store them in an array
  let results = Object.entries(locationCount).map(([district, count]) => ({
    name: district,
    y: count
  }))
  return results
}
function createTable (TABLE_CFG) {
  console.log('loading table')
  const table = new Tabulator('#persons-table', TABLE_CFG)
  return table
}

d3.json(dataUrl, function (data) {
  tableData = Object.values(data)
  TABLE_CFG.data = tableData
  const table = createTable(TABLE_CFG)
  table.on('dataLoaded', function (data) {
    $('#total_count').text(data.length)
  })
  table.on('tableBuilt', function () {
    let rows = table.getRows()
    generateChartsFromTable(rows, table)
  })
  table.on('dataFiltered', function (_filters, rows) {
    $('#search_count').text(rows.length)
    generateChartsFromTable(rows, table)
  })

  locTypeSelect.addEventListener('change', () => {
    let rows = table.getRows()
    generateChartSelect(rows, table)
  })
})

// Custom colors (default HighCharts list has too few)
Highcharts.setOptions({
  colors: [
    '#9CC69B',
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