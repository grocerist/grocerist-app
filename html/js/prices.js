const dataUrl = "json_dumps/price_per_document.json";

const goodsListColumnDefinitions = [
  {
    title: "Good",
    field: "good",
    headerFilter: "input",
    //...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "goods__",
      idField: "id",
      nameField: "value",
    },
    sorterParams: {
      type: "string",
      alignEmptyValues: "bottom",
      valueMap: "value",
    },
  },
];

function initializeTable(correctedGoodName, priceTableData) {
  const baseColumnDefinitions = [
  {
    title: "Document",
    field: "document",
    headerFilter: "input",
    ...linkListColumnSettings,
    formatterParams: {
      urlPrefix: "document__",
      idField: "id",
      nameField: "value",
    },
    sorterParams: {
      type: "string",
      alignEmptyValues: "bottom",
      valueMap: "value",
    },
  },
  {
    title: "Year",
    field: "doc_year",
    mutator: function (value, data, type, params, component) {
      return value[0].value
    },
    headerFilter: "input",
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
  {
    title: "Price",
    field: "price",
    formatter: noDataFormatter,
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: greaterThanFilter,
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
  {
    title: "Unit",
    field: "unit.value",
    headerFilter: "list",
    headerFilterParams: {
      valuesLookup: true,
    },
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
  {
    title: "Amount",
    field: "amount_of_units",
    formatter: noDataFormatter,
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: greaterThanFilter,
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
  {
    title: "Total Value",
    field: "total_value",
    headerFilter: "number",
    headerFilterPlaceholder: "at least...",
    headerFilterFunc: greaterThanFilter,
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
];
  //define column width and add column visibility toggle
  const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    headerMenu: headerMenu,
    minWidth: 100,
  }));

  const currencyData = priceTableData.some((entry) => entry.currency);
  if (currencyData) {
    columnDefinitions.push({
      title: "Currency",
      field: "currency.value",
      headerFilter: "input",
      visible: false,
    });
  }

  const table = new Tabulator(`#table-${correctedGoodName}`, {
    layout: "fitColumns",
    height: "100%",
    responsiveLayout: "collapse",
    data: priceTableData,
    columns: columnDefinitions,
    initialSort: [{ column: "doc_year", dir: "asc" }],
    footerElement: `<span class="tabulator-counter"></span>`,
  });
}

function handleRowSelection(row, allData) {
  let rowData = row.getData();
  let goodName = rowData.good;
  let goodId = rowData.id;

  let correctedGoodName = goodName.replace(/\//g, "").replace(/\s+/g, "_");

  let goodData = document.createElement("div");
  goodData.id = `data-${correctedGoodName}`;
  goodData.className = "row col-12";

  goodData.innerHTML = `
    <h2 id="title-${correctedGoodName}"><a href="goods__${goodId}.html">${goodName}</a></h2>
    <div id="table-${correctedGoodName}" style="margin-bottom: 1em"></div>
  `;

  const pricesContainer = document.getElementById("prices-tables");
  pricesContainer.appendChild(goodData);
  let priceTableData = JSON.parse(
    JSON.stringify(
      allData.filter(
        (item) => item.document.length > 0 && item.good.length > 0 && item.good[0].value == goodName
      )
    )
  );
  initializeTable(correctedGoodName, priceTableData);
}

function handleRowDeselection(row) {
  let rowData = row.getData();
  let goodName = rowData.good;

  let correctedGoodName = goodName.replace(/\//g, "").replace(/\s+/g, "_");
  let goodData = document.getElementById(`data-${correctedGoodName}`);
  goodData.remove();
}

function handleDeselectingAllRows(table) {
  table.deselectRow();
}

(async function () {
  try {
    const dataFromJson = await d3.json(dataUrl);
    let allData = Object.values(dataFromJson).filter(
      (item) => item.good && Array.isArray(item.good) && item.good.length > 0
    );
    let tableData = allData
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex((t) => t.good[0].value === item.good[0].value)
      )
      .map((item) => ({
        good: item.good[0].value,
        id: item.good[0].id,
      }));
    const table = new Tabulator(`#goods-list`, {
      selectableRows: 3,
      ...commonTableConfig,
      pagination: false,
      data: tableData,
      height: "90%",
      columns: goodsListColumnDefinitions,
      initialSort: [{ column: "good", dir: "asc" }],
      footerElement: `<span class="tabulator-counter"></span>`,
    });
    table.on("rowSelected", function (row) {
      handleRowSelection(row, allData);
    });
    table.on("rowDeselected", function (row) {
      handleRowDeselection(row);
    });
    document
      .getElementById("deselect-button")
      .addEventListener("click", function () {
        handleDeselectingAllRows(table);
      });
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
})();
