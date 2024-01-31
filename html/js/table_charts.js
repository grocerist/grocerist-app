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
  footerElement: '<span class="tabulator-counter float-left">'+
  'Showing <span id="search_count"></span> results out of <span id="total_count"></span> '+
  '</span>'
}

function generateChartsFromTable(rows) {
  let religionsResults = calculateReligionData(rows)
  createPieChart('religion-chart', 'Religion', religionsResults)
  let districtResults = calculateDistrictData(rows)
  createPieChart('districts-chart', 'Districts', districtResults)
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

// Function to calculate percentage  and round it to 2 decimal places
function calculatePercentage (count, total) {
  let percentage = (count / total) * 100
  return parseFloat(percentage.toFixed(2))
}
function calculateReligionData (rows) {
  let religionCount = {}
  rows.forEach(row => {
    let rowData = row.getData()
    let religionKey = rowData.religion.replace(/(<([^>]+)>)/gi, '')
    // Update the count for a specific religion
    religionCount[religionKey] = (religionCount[religionKey] || 0) + 1
  })
  // Calculate the total number of persons
  let totalPersons = Object.values(religionCount).reduce(
    (acc, count) => acc + count,
    0
  )

  // Calculate the percentages for each religion and store them in an array
  let religionsResults = Object.entries(religionCount).map(
    ([religion, count]) => ({
      name: religion,
      y: calculatePercentage(count, totalPersons)
    })
  )
  return religionsResults
}

function calculateDistrictData (rows) {
  let districtCount = {}
  // Calculate the total number of persons
  let totalPersons = rows.length
  rows.forEach(row => {
    let rowData = row.getData()
    let htmlString = rowData.district
    // Create a temporary div element to parse the HTML
    let tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlString
    // Extract text values from list items
    let textValues = Array.from(tempDiv.querySelectorAll('li a')).map(item =>
      item.textContent.trim()
    )
    if (textValues.length === 0) {
      districtCount['Unknown']++
    } else {
      textValues.forEach(value => {
        if (districtCount[value]) {
          districtCount[value]++
        } else {
          districtCount[value] = 1
        }
      })
    }
  })
  // Calculate the percentages for each district and store them in an array
  let districtResults = Object.entries(districtCount).map(
    ([district, count]) => ({
      name: district,
      y: calculatePercentage(count, totalPersons)
    })
  )
  return districtResults
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
  table.on("dataLoaded", function(data){
    $("#total_count").text(data.length);
});

  table.on('tableBuilt', function () {
    let rows = table.getRows()
    generateChartsFromTable(rows)
  })
  table.on('dataFiltered', function (_filters, rows) {
    generateChartsFromTable(rows)
    $("#search_count").text(rows.length);
  })
})


