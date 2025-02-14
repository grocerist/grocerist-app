const dataUrl = "json_dumps/prices.json";

const baseColumnDefinitions = [
    {
        title: "Name",
        field: "good",
        headerFilter: "input",
        formatter: linkToDetailView,
    },
    {
        title: "Price",
        field: "price",
        headerFilter: "input",
    },
    {
        title: "Unit",
        field: "unit",
        headerFilter: "input",
    },
    {
        title: "Amount",
        field: "amount_of_units",
        headerFilter: "input",
    },
    {
        title: "Total Value",
        field: "Total_Value",
        headerFilter: "input",
    },
];
