const dataUrl = "json_dumps/locations.json";
const baseColumnDefinitions = [
  {
    title: "Name",
    field: "properties.name",
    headerFilter: "input",
    formatter: function (cell) {
      return linkToDetailView(cell);
    },
  },
  {
    title: "Documents",
    field: "properties.documents",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "document__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "Nr. of Documents",
    field: "properties.doc_count",
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: ">=",
  },
  {
    title: "Persons",
    field: "properties.persons",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "person__",
      idField: "id",
      nameField: "value",
    },
  },
  {
    title: "Nr. of Persons",
    field: "properties.person_count",
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: ">=",
  },
  {
    title: "Location Type",
    field: "properties.location_type",
    formatter: makeItalic,
    headerFilter: "list",
    headerFilterFunc: "in",
    headerFilterParams: {
      valuesLookup: true,
      multiselect: true,
      itemFormatter: makeItalic,
    },
  },
];
// Add minWidth to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 150,
}));

// Config settings for table
const tableConfig = {
  ...commonTableConfig,
  headerFilterLiveFilterDelay: 600,
  columns: columnDefinitions,
  initialSort: [{ column: "properties.name", dir: "asc" }],
  footerElement: `<span class="tabulator-counter float-left">
  Showing <span id="search_count"></span> results out of <span id="total_count"></span>
  </span>`,
};

d3.json(dataUrl, function (dataFromJson) {
  // remove items with an empty name (mostly found in the neighbourhoods table)
  const tableData = Object.values(dataFromJson)[1].filter(
    (item) => item.properties.name.trim() !== ""
  );
  tableConfig.data = tableData;
  const table = new Tabulator("#places_table", tableConfig);
  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });

  table.on("dataFiltered", function (filters, rows) {
    $("#search_count").text(rows.length);
  });
});
