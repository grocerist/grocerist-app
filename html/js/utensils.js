const dataUrl = "json_dumps/utensils.json";

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
// Add minWidth and visibility toggle to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 200,
}));
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

    const table = new Tabulator("#utensils-table", {
      ...commonTableConfig,
      data: tableData,
      columns: columnDefinitions,
      initialSort: [{ column: "name", dir: "asc" }],
      footerElement: `<span class="tabulator-page-counter">
                        <span class="d-none d-sm-inline">
                          Showing <span class="search_count"></span> results out of <span class="total_count"></span>
                        </span>
                        <span class="d-inline d-sm-none">
                          <span class="search_count"></span> out of <span class="total_count"></span>
                        </span>
                      </span>`,
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
