const dataUrl = 'json_dumps/persons.json'
const titleStyle = {
  color: '#79B4A9',
  fontWeight: 'bold',
  fontSize: '20px'
}

const TABLE_CFG = {
  pagination: true,
  paginationSize: 15,
  height: 800,
  layout: 'fitColumns',
  tooltips: true,
  responsiveLayout: 'collapse',
  persistence: {
    headerFilter: true
  },
  columns: [
    {
      title: 'Name',
      field: 'name',
      headerFilter: 'input',
      formatter: function (cell) {
        return linkToDetailView(cell)
      }
    },
    {
      title: 'Religion',
      field: 'religion',
      mutator: mutateSelectField,
      headerFilter: 'input',
      formatter: 'html'
    },
    {
      title: 'Documents',
      field: 'documents',
      mutator: mutateDocumentField,
      headerFilter: 'input',
      formatter: 'html'
    },
    {
      title: 'District',
      field: 'district',
      mutator: mutateDistrictField,
      headerFilter: 'input',
      formatter: 'html'
    }
  ],
  footerElement:
    '<span class="tabulator-counter float-left">' +
    'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
    '</span>'
}


function generateChartsFromTable (rows, table) {
  let religionsResults = calculateReligionData(rows)
  createPieChart('religion-chart', 'Religion', religionsResults, table)
  let districtResults = calculateDistrictData(rows)
  createColumnChart('districts-chart', 'Districts', districtResults, table)
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
            click: function(){
              if (this.name === 'Unknown') {
              //nothing happens
            } 
            else if (this.name.split(' ').length > 2) {
              // specific logic to deal with the combined religion names
              table.setHeaderFilterValue(
                'religion',
                this.name.split(' ').pop()
              )
            } else {
              table.setHeaderFilterValue('religion', this.name)
            }}
        }},
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

function createColumnChart (containerId, title, data, table) {
  Highcharts.chart(containerId, {
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
                table.setHeaderFilterValue('district', this.name)
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

function calculateDistrictData (rows) {
  let districtCount = {}
  // get the districts (html list elements) from each row
  rows.forEach(row => {
    let rowData = row.getData()
    let htmlString = rowData.district
    let textValues = Array.from(
      new DOMParser()
        .parseFromString(htmlString, 'text/html')
        .querySelectorAll('li a'),
      value => value.textContent.trim()
    )
    if (textValues.length === 0) {
      districtCount['Unknown'] = (districtCount['Unknown'] || 0) + 1
    } else {
      textValues.forEach(value => {
        districtCount[value] = (districtCount[value] || 0) + 1
      })
    }
  })
  // Calculate the numbers for each district and store them in an array
  let results = Object.entries(districtCount).map(([district, count]) => ({
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
})
