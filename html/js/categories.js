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
  {
    field: "part_of",
    visible: false,
  },
];
// Add minWidth to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 150,
}));
d3.json(dataUrl, function (data) {
  data = Object.values(data);
  let tableData = data
    .filter((item) => !item.is_main_category) // Remove the main categories
    .map((item) => {
      const enriched = item;
      enriched["doc_count"] = item.documents.length;
      enriched["good_count"] = item.goods.length;
      if (item.part_of && item.part_of.length > 0) {
        enriched["part_of"] = item.part_of[0].value; // There's only one parent category
      }
      return enriched;
    });
  const table = new Tabulator("#categories-table", {
    ...commonTableConfig,
    data: tableData,
    columnCalcs: "both",
    columns: columnDefinitions,
    groupBy: "part_of",
    groupHeader: function (value, count, data, group) {
      const docs = new Set();
      data.forEach((item) => {
        item.documents.forEach((doc) => {
          docs.add(doc.grocerist_id);
        });
      });
      return `${value} (mentioned in ${docs.size} documents)`;
    },
  });
});
