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
        formatter: function (cell) {
          return linkToDetailView(cell)
        }
      },
      {
        title: 'Bakkal/Grocer',
        field: 'main_person',
        mutator: linkList,
        mutatorParams: {
          urlPrefix: '',
          idField: 'grocerist_id',
          nameField: 'name'
        },
        headerFilter: 'input',
        formatter: 'html'
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
        mutator: linkList,
        mutatorParams: {
          urlPrefix: '',
          idField: 'grocerist_id',
          nameField: 'name'
        },
        headerFilter: 'input',
        formatter: function (cell) {
          return get_scrollable_cell(this, cell)
        },
        tooltip: true
      },
      {
        title: 'District',
        field: 'district',
        mutator: linkList,
        mutatorParams: {
          urlPrefix: 'district__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'list',
        headerFilterParams: { valuesLookup: true },
        formatter: 'html'
      },
      {
        title: 'Mahalle',
        field: 'neighbourhood',
        mutator: linkList,
        mutatorParams: {
          urlPrefix: 'neighbourhood__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'list',
        headerFilterParams: { valuesLookup: true },
        formatter: 'html'
      },
      {
        title: 'Karye',
        field: 'karye',
        mutator: linkList,
        mutatorParams: {
          urlPrefix: 'karye__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'list',
        headerFilterParams: { valuesLookup: true },
        formatter: 'html'
      },
      {
        title: 'Nahiye',
        field: 'nahiye',
        mutator: linkList,
        mutatorParams: {
            urlPrefix: 'nahiye__',
            idField: 'id',
            nameField: 'value'
          },
        headerFilter: 'list',
        headerFilterParams: { valuesLookup: true },
        formatter: 'html'
      },
      {
        title: 'Quarter',
        field: 'quarter',
        mutator: linkList,
        mutatorParams: {
          urlPrefix: 'quarter__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'list',
        headerFilterParams: { valuesLookup: true },
        formatter: 'html'
      },
      {
        title: 'Address',
        field: 'address',
        mutator: linkList,
        mutatorParams: {
          urlPrefix: 'address__',
          idField: 'id',
          nameField: 'value'
        },
        headerFilter: 'list',
        headerFilterParams: { valuesLookup: true },
        formatter: 'html'
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
