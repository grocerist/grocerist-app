// Description: Settings and utility functions for Tabulator tables

// common settings for all Tabulator tables
const commonTableConfig = {
  layout: "fitColumns",
  responsiveLayout: "collapse",
  height: 800,
  // width: "100%",
  pagination: true,
  paginationSize: 15,
};

// common settings for columns with arrays of objects
const linkListColumnSettings = {
  formatter: linkListFormatter,
  // headerFilter: "input",
  headerFilterFunc: objectArrayHeaderFilter,
  sorter: "array",
};

function get_scrollable_cell(renderer, cell, cell_html_string) {
  // by @cfhaak, https://github.com/NestroyCA/nestroyca-astro-base/blob/main/src/pages/places.astro#L80
  if (cell_html_string === undefined) {
    cell_html_string = cell.getValue();
  }
  var cell_html_element = cell.getElement();
  cell_html_element.style.whiteSpace = "pre-wrap";
  cell_html_element.style.overflow = "auto";
  cell_html_element.style.maxHeight = "100px";
  let final_val = renderer.emptyToSpace(cell_html_string);
  return final_val;
}

// CUSTOM FORMATTERS

// for the first column, the name is a link to the detail view
function linkToDetailView(cell) {
  var row = cell.getRow().getData();
  var cellData = cell.getData();
  var groceristId = row.grocerist_id;
  // for documents, name = shelfmark
  var linkText = cellData.name ? cellData.name : cellData.shelfmark;
  var theLink = `<a href="${groceristId}.html">${linkText}</a>`;
  // for locations, the id is in the properties (geoJSON)
  if (groceristId === undefined) {
    groceristId = row.properties.grocerist_id;
    theLink = `<a href="${groceristId}.html">${cellData.properties.name}</a>`;
  }
  return theLink;
}

function linkListFormatter(cell, formatterParams, onRendered) {
  let value = cell.getValue();
  let output = value
    .map((item) => {
      return `<li><a href="${formatterParams.urlPrefix}${
        item[formatterParams.idField]
      }.html">${item[formatterParams.nameField]}</a></li>`;
    })
    .join(" ");
  output = `<ul class="list-unstyled">${output}</ul>`;
  let renderer = this;
  if (formatterParams.scrollable === true) {
    output = get_scrollable_cell(renderer, cell, output);
  }
  return output;
}

function testFormatter(cell, formatterParams, onRendered) {
  let value = cell.getValue();
  if (value === null) {
    return value;
  } else {
    return `<a href="district__${value.ids.database_table_1492}.html">${value.value}</a>`;
  }
}

// CUSTOM MUTATORS

// custom mutator that combines the values of an array of objects into a string
function combineValues(value, data, type, params, component) {
  let output = value
    .map((item) => {
      return `${item.value}`;
    })
    .join("/");
  return `${output}`;
}

function makeItalic(value) {
  let turkishWords = ["Nahiye", "Mahalle", "Karye"];
  if (typeof value === "string") {
    //headerfilter case
    output = value;
  } else {
    //tab cell case
    output = value.getValue();
  }
  if (turkishWords.includes(output)) {
    output = "<i>" + output + "</i>";
  }
  return output;
}

// Custom mutator for fields with arrays that aren't meant to be arrays
function reduceArrayMutator(value, data, type, params, component) {
  if (typeof value === "object" && value.length > 0) {
    // Check if value is an array and has at least one element
    return value[0];
  } else {
    // For empty array or strings ("N/A"), the cell should be empty
    return null;
  }
}

// CUSTOM FILTERS

// custom headerFilter for cells with arrays of objects
function objectArrayHeaderFilter(headerValue, rowValue, rowData, filterParams) {
  // for columns where the name of the items is not in the "value" field,
  // the line headerFilterFuncParams: { nameField: 'name' } needs to be added to the column config
  if (filterParams.nameField) {
    return rowValue.some(function (item) {
      return item[filterParams.nameField]
        .toLowerCase()
        .includes(headerValue.toLowerCase());
    });
  } else {
    return rowValue.some(function (item) {
      return item.value.toLowerCase().includes(headerValue.toLowerCase());
    });
  }
}
// custom headerFilter for cells with a single object
function objectHeaderFilter(headerValue, rowValue, rowData, filterParams) {
  if (rowValue?.value) {
    return rowValue.value === headerValue;
  } else {
    return false;
  }
}

// custom headerFilter function for columns containing numbers as strings
// NOTE: Baserow exports numbers as strings to keep the decimal points
// Numbers calculated by us, like Nr. of Documents are numbers, so they can use the standard ">="
function greaterThanFilter(headerValue, rowValue, rowData, filterParams) {
  // Convert headerValue to a number before comparing
  return Number(rowValue) >= Number(headerValue);
}

// custom lookupfunction for list type headerfilters
function objectLookup(cell, filterTerm) {
  // necessary for field names with dots (i.e. properties.upper_admin)
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  };
  const results = new Set();
  let column = cell.getColumn();
  let field = column.getField();
  let data = cell.getTable().getData();
  data.forEach((row) =>  {
    let cellValue = getNestedValue(row, field);
    if (cellValue !== null) {
      if (Array.isArray(cellValue)) {
        cellValue.forEach((item) => {
          results.add(item.value);
        });
      } else {
        results.add(cellValue.value);
      }
    }
  });

  return Array.from(results);
}

// Define column header menu as column visibility toggle
const headerMenu = function () {
  let menu = [];
  const allColumns = this.getColumns();
  table = this; // to access the table instance in the menu item action

  allColumns.forEach((column) => {
    let icon = document.createElement("i");
    icon.className = "bi " + (column.isVisible() ? "bi-eye" : "bi-eye-slash");

    //build label (contains icon and title)
    let label = document.createElement("span");
    let title = document.createElement("span");

    title.innerHTML = " " + column.getDefinition().title;

    label.appendChild(icon);
    label.appendChild(title);

    // Take inital visibility into account
    if (!column.isVisible()) {
      label.classList.add("text-muted");
    }

    //create menu item
    menu.push({
      label: label,
      action: function (e) {
        // Prevent menu closing
        e.stopPropagation();

        // Toggle current column visibility
        column.toggle();

        // Redraw the table, potentially uncollapsing columns
        table.redraw();

        // Change menu item icon and toggle text-muted class based on visibility
        label.classList.toggle("text-muted", !column.isVisible());
        icon.className =
          "bi " + (column.isVisible() ? "bi-eye" : "bi-eye-slash");
      },
    });
  });

  return menu;
};

function objectSorter(a, b, aRow, bRow, column, dir, sorterParams) {
  // Handle null or empty values
  if (a === null) return dir === "asc" ? 1 : -1; // Place `a` last
  if (b === null) return dir === "asc" ? -1 : 1; // Place `b` last

  // Compare non-empty values
  return String(a.value)
    .toLowerCase()
    .localeCompare(String(b.value).toLowerCase(), "tr");
}
