const dataUrl = "json_dumps/goods.json";

const baseColumnDefinitions = [
  {
    title: "Name",
    field: "name",
    headerFilter: "input",
    formatter: linkToDetailView,
  },
  {
    title: "Documents",
    field: "documents",
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
    field: "doc_count",
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: ">=",
  },
  {
    title: "Categories",
    field: "has_category",
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "category__",
      idField: "id",
      nameField: "value",
    },
  },
];
// Add minWidth and visibility toggle to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 200,
}));
d3.json(dataUrl, function (data) {
  data = Object.values(data).filter((item) => item.name !== "");
  let tableData = data.map((item) => {
    const enriched = item;
    enriched["doc_count"] = item.documents.length;
    return enriched;
  });

  var table = new Tabulator("#goods-table", {
    ...commonTableConfig,
    data: tableData,
    columns: columnDefinitions,
    initialSort:[{column:"name", dir:"asc"}]
  });
});
