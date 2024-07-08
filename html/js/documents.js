const dataUrl = 'json_dumps/documents.json'

d3.json(dataUrl, function (data) {
  tableData = Object.values(data)

  var table = new Tabulator('#documents-table', {
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
        visible: false,
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
        visible: false,
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
        visible: false,
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
        visible: false,
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
        visible: false,
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: 'address__',
          idField: 'id',
          nameField: 'value'
        }
      },
      {
        title: 'Year <i>Hicri</i>',
        field: 'year_of_creation_hicri',
        headerFilter: 'input'
      },
      {
        title: 'Year <i>Miladi</i>',
        field: 'year_of_creation_miladi',
        headerFilter: 'input'
      }
    ],
    footerElement:
      '<span class="tabulator-counter float-left">' +
      'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
      '</span>'
  })

  function updateDropdownItems () {
    const allColumns = table.getColumns()
    const dropdownMenu = document.querySelector('#columnVisibility')
    //dropdownMenu.innerHTML = '' // Clear existing dropdown items if necessary
    // Add a dropdown item for each column
    allColumns.forEach(column => {
      const title = column.getDefinition().title
      const item = document.createElement('a')
      item.href = '#'
      item.classList.add('dropdown-item')
      // Add 'text-muted' class if the column is hidden
      if (!column.isVisible()) {
        item.classList.add('text-muted')
      }
      item.textContent = title
      // Toggle column visibility (& text-muted class) when an item is clicked
      item.onclick = function (event) {
        event.preventDefault() // Prevent the default anchor action
        column.toggle()
        item.classList.toggle('text-muted', !column.isVisible())
      }
      dropdownMenu.appendChild(item)
    })
  }
  // Populate the dropdown after the table is fully built
  table.on('tableBuilt', function () {
    updateDropdownItems()
  })

  table.on('dataLoaded', function (data) {
    $('#total_count').text(data.length)
  })

  table.on('dataFiltered', function (filters, rows) {
    $('#search_count').text(rows.length)
  })
})
