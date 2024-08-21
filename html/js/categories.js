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
      urlPrefix: "goods__",
      idField: "id",
      nameField: "value",
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
      nameField: "shelfmark",
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
  data = Object.values(data);
  let tableData = data.map((item) => {
    const enriched = item;
    enriched["doc_count"] = item.documents.length;
    enriched["good_count"] = item.goods.length;
    return enriched;
  });
  var table = new Tabulator("#categories-table", {
    ...commonTableConfig,
    data: tableData,
    columnCalcs: "both",
    columns: columnDefinitions,
  });
});
