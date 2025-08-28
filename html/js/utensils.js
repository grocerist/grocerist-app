const dataUrl = "json_dumps/utensils.json";

const columnDefinitions = [
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
    headerSort: false,
  },
  {
    title: "Nr. of Documents",
    field: "doc_count",
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
  },
];
(async function () {
  try {
    const dataFromJson = await d3.json(dataUrl);
    let tableData = Object.values(dataFromJson)
      .filter((item) => item.name !== "")
      .map((item) => {
        const enriched = item;
        enriched["doc_count"] = item.documents.length;
        return enriched;
      });

    const table = createTable("#utensils-table", {
      ...commonTableConfig,
      data: tableData,
      columns: columnDefinitions,
      columnDefaults: {
        minWidth: 200,
      },
      initialSort: [{ column: "name", dir: "asc" }],
    });
    handleDownloads(table, "Utensils");
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
