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
          sorterParams:{
            type:"string",
            alignEmptyValues:"bottom",
            valueMap:"value",
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

const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    minWidth: 150,
}));

d3.json(dataUrl, function (dataFromJson) {
    let tableData = Object.values(dataFromJson)
        .filter((item) => item.good.length > 0) 
    new Tabulator("#prices-table", {
        ...commonTableConfig,
        data: tableData,
        columns: columnDefinitions,
        initialSort: [{ column: "good", dir: "asc" }],
    });
});
