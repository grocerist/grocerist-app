const dataUrl = 'json_dumps/persons.json'
const titleStyle = {
  color: '#79B4A9',
  fontWeight: 'bold',
  fontSize: '20px'

}
function mutateSelectField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `<li>${item.value}</li>`
    })
    .join(' ')
  return `<ul class="list-unstyled">${output}</ul>`
}

function mutateDocumentField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `<li><a href="document__${item.id}.html">${item.value}</a></li>`
    })
    .join(' ')
  return `<ul class="list-unstyled">${output}</ul>`
}

function mutateDistrictField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `<li><a href="district__${item.id}.html">${item.value}</a></li>`
    })
    .join(' ')
  return `<ul class="list-unstyled">${output}</ul>`
}

function linkToDetailView (cell) {
  var row = cell.getRow().getData()
  var cellData = cell.getData()
  var groceristId = row.grocerist_id
  var theLink = `<a href="${groceristId}.html">${cellData.name}</a>`
  return theLink
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
d3.json(dataUrl, function (data) {
  tableData = Object.values(data)

  var table = new Tabulator('#persons-table', {
    pagination: true,
    paginationSize: 15,
    height: 800,
    layout: 'fitColumns',
    tooltips: true,
    data: tableData,
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
    ]
  })
  let dummyData = [{ name: 'District 1', y: 57 },{ name: 'District 2', y: 43 }] 
  
  table.on('tableBuilt', function () {
    let rows = table.getRows()
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

    // Function to calculate percentage  and round it to 2 decimal places
    function calculatePercentage (count, total) {
      let percentage = (count / total) * 100
      return parseFloat(percentage.toFixed(2))
    }

    // Calculate the percentages for each religion and store them in an array
    let religionsResults = Object.entries(religionCount).map(
      ([religion, count]) => ({
        name: religion,
        y: calculatePercentage(count, totalPersons)
      })
    )

    createPieChart('religion-chart', 'Religion', religionsResults)
    createPieChart('districts-chart', 'Districts', dummyData)
  })
})
