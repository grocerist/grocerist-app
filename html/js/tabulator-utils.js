function get_scrollable_cell (renderer, cell, cell_html_string) {
  // by @cfhaak, https://github.com/NestroyCA/nestroyca-astro-base/blob/main/src/pages/places.astro#L80
  if (cell_html_string === undefined) {
    cell_html_string = cell.getValue()
  }
  var cell_html_element = cell.getElement()
  cell_html_element.style.whiteSpace = 'pre-wrap'
  cell_html_element.style.overflow = 'auto'
  cell_html_element.style.maxHeight = '100px'
  let final_val = renderer.emptyToSpace(cell_html_string)
  return final_val
}

function linkListFormatter (cell, formatterParams, onRendered) {
  let value = cell.getValue()
  let output = value
    .map(item => {
      return `<li><a href="${formatterParams.urlPrefix}${
        item[formatterParams.idField]
      }.html">${item[formatterParams.nameField]}</a></li>`
    })
    .join(' ')
  output = `<ul class="list-unstyled">${output}</ul>`
  let renderer = this
  if (formatterParams.scrollable === true) {
    output = get_scrollable_cell(renderer, cell, output)
  }
  return output
}

function mutateSelectField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `${item.value}`
    })
    .join('/')
  return `${output}`
}

function makeItalic (value) {
  let turkishWords = ['Nahiye', 'Mahalle', 'Karye']
  if (typeof value === 'string') {
    //headerfilter case
    output = value
  } else {
    //tab cell case
    output = value.getValue()
  }
  if (turkishWords.includes(output)) {
    output = '<i>' + output + '</i>'
  }
  return output
}

// for the first column, the name is a link to the detail view
function linkToDetailView (cell) {
  var row = cell.getRow().getData()
  var cellData = cell.getData()
  var groceristId = row.grocerist_id
  // for documents, name = shelfmark
  var linkText = cellData.name ? cellData.name : cellData.shelfmark
  var theLink = `<a href="${groceristId}.html">${linkText}</a>`
  // for locations, the id is in the properties (geoJSON)
  if (groceristId === undefined) {
    groceristId = row.properties.grocerist_id
    theLink = `<a href="${groceristId}.html">${cellData.properties.name}</a>`
  }
  return theLink
}
// custom headerFilter for cells with arrays of objects
function customHeaderFilter (headerValue, rowValue, rowData, filterParams) {
  // for columns where the name of the items is not in the "value" field,
  // the line headerFilterFuncParams: { nameField: 'name' } needs to be added to the column config
  if (filterParams.nameField) {
    return rowValue.some(function (item) {
      return item[filterParams.nameField]
        .toLowerCase()
        .includes(headerValue.toLowerCase())
    })
  } else {
    return rowValue.some(function (item) {
      return item.value.toLowerCase().includes(headerValue.toLowerCase())
    })
  }
}

// common settings for columns with arrays of objects
const linkListColumnSettings = {
  formatter: linkListFormatter,
  headerFilter: 'input',
  headerFilterFunc: customHeaderFilter,
  sorter: 'array'
}
