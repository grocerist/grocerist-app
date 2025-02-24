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
// Price information
const priceDataUrl = "json_dumps/price_per_document.json";

function loadPriceData(goodId) {
    d3.json(priceDataUrl, function (error, priceData) {
        if (error) {
            console.error("Failed to load price data:", error);
            return;
        }

        // Use `good[0].id` to filter prices correctly
        let relatedPrices = Object.values(priceData).filter(
            (item) => item.good?.[0]?.id == goodId
        );

        let priceTable = document.querySelector("#price-table");

        if (relatedPrices.length === 0) {
            priceTable.innerHTML = "<tr><td colspan='4'>No price data available</td></tr>";
        } else {
            priceTable.innerHTML = relatedPrices.map((price) => `
                <tr>
                    <td>${price.price ?? "N/A"}</td>
                    <td>${price.unit?.value ?? "N/A"}</td>
                    <td>${price.amount_of_units ?? "N/A"}</td>
                    <td>${price.total_value ?? "N/A"}</td>
                </tr>
            `).join("");
        }
    });
}

// Get the good ID from the page URL and load prices
const goodId = window.location.pathname.match(/goods__(\d+).html/)[1];
if (goodId) {
    loadPriceData(goodId);
}