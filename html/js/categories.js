const dataUrl = "json_dumps/categories.json";
const baseColumnDefinitions = [
  {
    title: "Grocery Category",
    field: "name",
    headerFilter: "input",
    formatter: linkToDetailView,
    bottomCalc: "count",
    minWidth: 200,
  },
  {
    title: "Groceries",
    field: "goods",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "",
      idField: "grocerist_id",
      nameField: "name",
    },
    headerFilterFuncParams: { nameField: "name" },
  },
  {
    title: "# Groceries",
    field: "good_count",
    bottomCalc: "sum",
  },
  {
    title: "Documents",
    field: "documents",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "",
      idField: "grocerist_id",
      nameField: "name",
    },
  },
  {
    title: "# Docs",
    field: "doc_count",
    bottomCalc: "sum",
  },
];
// Add minWidth to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 150,
}));
d3.json(dataUrl, function (data) {
  tableData = Object.values(data);

  var table = new Tabulator("#categories-table", {
    ...commonTableConfig,
    data: tableData,
    columnCalcs: "both",
    columns: columnDefinitions,
  });
});
