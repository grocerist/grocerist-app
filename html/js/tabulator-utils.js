function get_scrollable_cell (table, cell, cell_html_string = undefined) {
  // by @cfhaak, https://github.com/NestroyCA/nestroyca-astro-base/blob/main/src/pages/places.astro#L80
  if (cell_html_string === undefined) {
    cell_html_string = cell.getValue()
  }
  var cell_html_element = cell.getElement()
  cell_html_element.style.whiteSpace = 'pre-wrap'
  cell_html_element.style.overflow = 'auto'
  cell_html_element.style.maxHeight = '100px'
  let final_val = table.emptyToSpace(cell_html_string)
  return final_val
}

function mutateSelectField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `${item.value}`
    })
    .join('/')
  return `${output}`
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

function linkList (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `<li><a href="${item.grocerist_id}.html">${item.name}</a></li>`
    })
    .join('')
  return `<ul class="list-unstyled">${output}</ul>`
}

function linkToDocumentsDetailView (cell) {
  var row = cell.getRow().getData()
  var cellData = cell.getData()
  var groceristId = row.grocerist_id
  var theLink = `<a href="${groceristId}.html">${cellData.shelfmark}</a>`
  return theLink
}

function linkToDetailView (cell) {
  var row = cell.getRow().getData()
  var cellData = cell.getData()
  console.log(row)
  var groceristId = row.grocerist_id;
  var theLink = `<a href="${groceristId}.html">${cellData.name}</a>`
  if (groceristId === undefined) {
      groceristId = row.properties.grocerist_id;
      var theLink = `<a href="${groceristId}.html">${cellData.properties.name}</a>`
  }
  return theLink
}

function mutateCategoryField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `<li><a href="category__${item.id}.html">${item.value}</a></li>`
    })
    .join(' ')
  return `<ul class="list-unstyled">${output}</ul>`
}

function mutatePersonField (value, data, type, params, component) {
  let output = value
    .map(item => {
      return `<li><a href="person__${item.id}.html">${item.value}</a></li>`
    })
    .join(' ')
  return `<ul class="list-unstyled">${output}</ul>`
}
