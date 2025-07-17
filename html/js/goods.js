const dataUrl = "json_dumps/goods.json";

const baseColumnDefinitions = [
  {
    title: "Name",
    field: "name",
    headerFilter: "input",
    formatter: linkToDetailView,
  },
   {
    title: "Century",
    field: "centuries",
    formatter: "array",
    formatterParams: {
      delimiter: ", ",
    },
    sorter: "array",
    accessorDownload: function (value) {
      return value.join("; ");
    },
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: true,
    },
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
    headerSort: false,
  },
  {
    title: "Nr. of Documents",
    field: "doc_count",
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
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
    headerSort: false,
  },
  {
    title: "Broken / spoilt",
    field: "broken_or_spoilt",
    hozAlign: "center",
    formatter: "tickCross",
    headerFilter: "tickCross",
    formatterParams: {crossElement: false},
    headerFilterParams: { tristate: true },
    visible: false,
  },
];
// Add minWidth and visibility toggle to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  headerMenu: headerMenu,
  ...column,
  minWidth: 200,
}));
(async function () {
  try {
    const dataFromJson = await d3.json(dataUrl);
    const filteredData = Object.values(dataFromJson).filter(
      (item) => item.name !== ""
    );
    const tableData = filteredData.map((item) => {
      const enriched = item;
      const centuries = new Set();
      item.documents.forEach((doc) => {
        const century = doc.century?.value;
        if (century) {
          centuries.add(century);
        }
      });
      enriched["centuries"] = Array.from(centuries).sort();
      enriched["doc_count"] = item.documents.length;

      return enriched;
    });

    const table = createTable("#goods-table", {
      ...commonTableConfig,
      data: tableData,
      columns: columnDefinitions,
      initialSort: [{ column: "name", dir: "asc" }],
  });
    handleDownloads(table, "Groceries");
    table.on("dataLoaded", function (data) {
      $(".total_count").text(data.length);
    });

    table.on("dataFiltered", function (_filters, rows) {
      $(".search_count").text(rows.length);
    });
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
})();
