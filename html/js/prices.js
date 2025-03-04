const dataUrl = "json_dumps/price_per_document.json";

const baseColumnDefinitions = [
    {
        title: "Good",
        field: "good",
        ...linkListColumnSettings,
        formatterParams: {
            urlPrefix: "goods__",
            idField: "id",
            nameField: "value",
          },
    },
    {
        title: "Document",
        field: "document",
        ...linkListColumnSettings,
        formatterParams: {
            urlPrefix: "document__",
            idField: "id",
            nameField: "value",
          },
    },
    
    {
        title: "Price",
        field: "price",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: greaterThanFilter,
    },
    {
        title: "Unit",
        field: "unit.value",
        headerFilter: "input",
    },
    {
        title: "Amount",
        field: "amount_of_units",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: greaterThanFilter,
    },
    {
        title: "Total Value",
        field: "total_value",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: greaterThanFilter,
    },
];

const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    minWidth: 150,
}));

d3.json(dataUrl, function (dataFromJson) {
    let tableData = Object.values(dataFromJson)
        .filter((item) => item.good.length > 0) 
    console.log(tableData)
    new Tabulator("#prices-table", {
        ...commonTableConfig,
        data: tableData,
        columns: columnDefinitions,
        initialSort: [{ column: "good", dir: "asc" }],
    });
});
