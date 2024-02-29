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
        title: '<i>Bakkal</i>/Grocer',
        field: 'main_person',
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: '',
          idField: 'grocerist_id',
          nameField: 'name'
        },
        headerFilterFuncParams: { nameField: 'name' }
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
        formatterParams: {
          scrollable: true,
          urlPrefix: '',
          idField: 'grocerist_id',
          nameField: 'name'
        },
        ...linkListColumnSettings,
        headerFilterFuncParams: { nameField: 'name' }
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
  })

  table.on('dataLoaded', function (data) {
    $('#total_count').text(data.length)
  })

  table.on('dataFiltered', function (filters, rows) {
    $('#search_count').text(rows.length)
  })
})
