// column definitions shared by price tables on prices page and on goods detail pages
const baseColumnDefinitions = [
  {
    title: "Document",
    field: "document",
    headerFilter: "input",
    // TODO convert this from array to string
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
      return value[0].value;
    },
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterParams: {
      labels: ["Start", "End"],
      min: 1690,
      max: 1900,
    },
    headerFilterLiveFilter: false,
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
  {
    title: "Price",
    field: "price",
    formatter: noDataFormatter,
    mutator: convertToNumber,
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
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
    mutator: convertToNumber,
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
  {
    title: "Total Value",
    field: "total_value",
    mutator: convertToNumber,
    headerFilter: rangeEditor,
    headerFilterFunc: rangeFilter,
    headerFilterLiveFilter: false,
    sorterParams: {
      alignEmptyValues: "bottom",
    },
  },
];

//define column width and add column visibility toggle
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  headerMenu: headerMenu,
  minWidth: 150,
}));

const priceTableConfig = {
  ...commonTableConfig,
  // calculate height dynamically based on the container and preceding h2 element
  height: function () {
    const container = document.querySelector("#prices-tables");
    const h2Element = container.querySelector("h2");
    const containerHeight = container.offsetHeight;
    const h2Height = h2Element ? h2Element.offsetHeight : 0;
    return containerHeight - h2Height;
  },
  columns: columnDefinitions,
  // pagination: false,
  initialSort: [{ column: "doc_year", dir: "asc" }],
};

// code specific for the price page

// function initializeTable(containerId, tableData) {
// const currencyData = tableData.some((entry) => entry.currency);
// if (currencyData) {
//   columnDefinitions.push({
//     title: "Currency",
//     field: "currency.value",
//     headerFilter: "input",
//     visible: false,
//   });
// }
//   tableConfig.data = tableData;
//   const table = createTable(containerId, tableConfig);
// }

function handleRowSelection(row, allData) {
  let rowData = row.getData();
  let goodName = rowData.good;
  let goodId = rowData.id;

  let goodData = document.createElement("div");
  goodData.id = `data-goods__${goodId}`;
  goodData.className = "row";

  goodData.innerHTML = `
   <div class="col">
    <h2 id="title-goods__${goodId}"><a href="goods__${goodId}.html">${goodName}</a></h2>
    <div id="table-goods__${goodId}" style="margin-bottom: 1em"></div>
  </div>
  `;

  const pricesContainer = document.getElementById("prices-tables");
  pricesContainer.appendChild(goodData);
  let priceTableData = allData.filter(
    (item) => item.document.length > 0 && item.good[0].id === goodId
  );

  priceTableConfig.data = priceTableData;
  priceTableConfig.pagination = false
  priceTableConfig.footerElement = `<span></span>`
  createTable(`#table-goods__${goodId}`, priceTableConfig);
}

function handleRowDeselection(row) {
  let rowData = row.getData();
  let goodId = rowData.id;

  let goodData = document.getElementById(`data-goods__${goodId}`);
  goodData.remove();
}

function handleDeselectingAllRows(table) {
  table.deselectRow();
}

function isValidPriceItem(item) {
  if (item.good.length === 0) return false;
  // Filter out items with more than one good unless it's Bal / Asel (id 25)
  if (item.good.length === 1) return true;
  return item.good.some((good) => good.id === 25);
}
function initializePricesPage() {
  (async function () {
    try {
      const dataUrl = "json_dumps/price_per_document.json";
      const dataFromJson = await d3.json(dataUrl);

      let allData = Object.values(dataFromJson).filter(isValidPriceItem);
      let uniqueGoods = new Map();
      allData.forEach((item) => {
        const goodId = item.good[0].id;
        if (!uniqueGoods.has(goodId)) {
          uniqueGoods.set(goodId, {
            good: item.good[0].value,
            id: goodId,
          });
        }
      });
      const tableData = Array.from(uniqueGoods.values());

      const goodsList = createTable(`#goods-list`, {
        selectableRows: 3,
        ...commonTableConfig,
        pagination: false,
        data: tableData,
        height: "90%",
        columns: [
          {
            title: "Good",
            field: "good",
            headerFilter: "input",
          },
        ],
        initialSort: [{ column: "good", dir: "asc" }],
        footerElement: `<span></span>`,
      });
      goodsList.on("rowSelected", function (row) {
        console.log("Row selected:", row.getData());
        handleRowSelection(row, allData);
      });
      goodsList.on("rowDeselected", function (row) {
        handleRowDeselection(row);
      });
      document
        .getElementById("deselect-button")
        .addEventListener("click", function () {
          handleDeselectingAllRows(goodsList);
        });
    } catch (error) {
      console.error("Error loading or processing data:", error);
    }
  })();
}

// Auto-initialize if we're on the prices page (has #goods-list element)
if (document.getElementById("goods-list")) {
  initializePricesPage();
}
