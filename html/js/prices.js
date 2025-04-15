const dataUrl = "json_dumps/price_per_document.json";

const columnDefinitions = [
    {
        title: "Document",
        field: "document",
        minWidth: 250,
        headerFilter: "input",
        ...linkListColumnSettings,
        formatterParams: {
            urlPrefix: "document__",
            idField: "id",
            nameField: "value",
          },
          sorterParams:{
            type:"string",
            alignEmptyValues:"bottom",
            valueMap:"value",
        },
    },
    {
        title: "Year",
        field: "doc_year",
        mutator: function (value, data, type, params, component) {
          return value[0].value;
        },
        headerFilter: "input",
        sorterParams:{
            alignEmptyValues:"bottom",
        }
      },
    {
        title: "Price",
        field: "price",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: greaterThanFilter,
        sorterParams:{
            alignEmptyValues:"bottom",
        }
    },
    {
        title: "Unit",
        field: "unit.value",
        headerFilter: "list",
        headerFilterParams: {
          valuesLookup: true,
        },
        sorterParams:{
            alignEmptyValues:"bottom",
        }
    },
    {
        title: "Amount",
        field: "amount_of_units",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: greaterThanFilter,
        sorterParams:{
            alignEmptyValues:"bottom",
        }
    },
    {
        title: "Total Value",
        field: "total_value",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: greaterThanFilter,
        sorterParams:{
            alignEmptyValues:"bottom",
        }
    },
];

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


initializeTable = function (goodName, correctedGoodName) {
    d3.json(dataUrl, function (dataFromJson) {
        let tableData = Object.values(dataFromJson)
            .filter((item) => (item.good.length > 0 && item.good[0].value == goodName))

        const table = new Tabulator(`#table-${correctedGoodName}`, {
            ...priceTableConfig,
            data: tableData,
            columns: columnDefinitions,
            initialSort: [{ column: "doc_year", dir: "asc" }],
            footerElement: `<span class="tabulator-counter float-left">
                    </span>`,
        });
        table.on("dataLoaded", function (data) {
            $("#total_count").text(data.length);
        });
        table.on("dataFiltered", function (_filters, rows) {
            $("#search_count").text(rows.length);
        });
    });
}

function handleRowSelection(row) {
    rowData = row.getData()
    goodName = rowData.good
    goodId = rowData.id

    const pricesTablesContainer = document.getElementById("prices-tables");
    let correctedGoodName = goodName.replace(/\//g, "").replace(/\s+/g, "_");

    let goodDiv = document.getElementById(`prices-${correctedGoodName}`);
    if (!goodDiv) {
        rowDiv = document.createElement("div");
        rowDiv.className = "row";
        rowDiv.id = `rowDiv-${correctedGoodName}`
        pricesTablesContainer.appendChild(rowDiv)
        rowDivInPricesTablesContainer = document.getElementById(`rowDiv-${correctedGoodName}`);
        goodDiv = document.createElement("div");
        goodDiv.id = `prices-${correctedGoodName}`;
        goodDiv.className = "col-10"
    
        goodDiv.innerHTML = `
            <h2 id="title-${correctedGoodName}"><a href="/goods__${goodId}.html">${goodName}</a></h2>
            <div id="table-${correctedGoodName}"></div>
        `;
        rowDivInPricesTablesContainer.appendChild(goodDiv);
    
        initializeTable(goodName, correctedGoodName);
    } else {
        goodDiv.style.display = "block";
    }
}

function handleRowDeselection(row) {
    rowData = row.getData()
    goodName = rowData.good
    goodId = rowData.good

    
    let correctedGoodName = goodName.replace(/\//g, "").replace(/\s+/g, "_");
    let goodDiv = document.getElementById(`prices-${correctedGoodName}`);
    goodDiv.style.display = "none";
    rowDivInPricesTablesContainer = document.getElementById(`rowDiv-${correctedGoodName}`);
    rowDivInPricesTablesContainer.remove()
}

//main
d3.json(dataUrl, function (dataFromJson) {

    const tableData = Object.values(dataFromJson)
        .filter(item => item.good && Array.isArray(item.good) && item.good.length > 0)
        .filter((item, index, self) =>
            index === self.findIndex(t => t.good[0].value === item.good[0].value)
        )
        .map(item => ({
            good: item.good[0].value,
            id: item.good[0].id
        }));

    const table = new Tabulator(`#goods-list`, {
        selectableRows:3,
        ...commonTableConfig,
        pagination: false,
        data: tableData,
        columns: goodsListColumnDefinitions,
        initialSort: [{ column: "good", dir: "asc" }],
        footerElement: `<span class="tabulator-counter float-left"></span>`,
       
    });
    table.on("dataLoaded", function (data) {
        $("#total_count").text(data.length);
    });
    table.on("dataFiltered", function (_filters, rows) {
        $("#search_count").text(rows.length);
    });
    table.on("rowSelected", function(row){
        handleRowSelection(row);
    });
    table.on("rowDeselected", function(row){
        handleRowDeselection(row);
    });
});