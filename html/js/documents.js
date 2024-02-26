const dataUrl = 'json_dumps/documents.json'

d3.json(dataUrl, function (data) {
  tableData = Object.values(data)

  var table = new Tabulator('#example-table', {
    pagination: true,
    paginationSize: 15,
    layout: 'fitDataStretch',
    height: 800,
    tooltips: true,
    data: tableData,
    columns: [
      {
        title: 'Shelfmark',
        field: 'shelfmark',
        headerFilter: 'input',
        formatter: linkToDetailView
      },
      {
        title: 'Bakkal/Grocer',
        field: 'main_person',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: '',
          idField: 'grocerist_id',
          nameField: 'name'
        },
        headerFilter: 'input',
      },
      {
        title: 'Transcript',
        field: 'transcript',
        formatter: 'tickCross',
        headerFilter: 'tickCross',
        headerFilterParams: { tristate: true },
        headerFilterEmptyCheck: function (value) {
          return value === null
        }
      },
      {
        title: 'Facsimiles',
        field: 'images',
        formatter: 'tickCross',
        headerFilter: 'tickCross',
        headerFilterParams: { tristate: true },
        headerFilterEmptyCheck: function (value) {
          return value === null
        }
      },
      {
        title: 'Groceries',
        field: 'goods',
        formatter: linkListFormatter,
        formatterParams: {
          scrollable: true,
          urlPrefix: '',
          idField: 'grocerist_id',
          nameField: 'name'
        },
        headerFilter: 'input',
      },
      {
        title: 'District',
        field: 'district',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: 'district__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'input',
      },
      {
        title: 'Mahalle',
        field: 'neighbourhood',
        headerFilter: 'input',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: 'neighbourhood__',
          idField: 'id',
          nameField: 'value'
        },
      },
      {
        title: 'Karye',
        field: 'karye',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: 'karye__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'input',

      },
      {
        title: 'Nahiye',
        field: 'nahiye',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: 'nahiye__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'input',
      },
      {
        title: 'Quarter',
        field: 'quarter',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: 'quarter__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'input',
      },
      {
        title: 'Address',
        field: 'address',
        formatter: linkListFormatter,
        formatterParams: {
          urlPrefix: 'address__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'input',
      }
    ],
    footerElement:
      '<span class="tabulator-counter float-left">' +
      'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
      '</span>'
  })

  table.on('dataLoaded', function (data) {
    $('#total_count').text(data.length)
  })

  table.on('dataFiltered', function (filters, rows) {
    $('#search_count').text(rows.length)
  })
})
