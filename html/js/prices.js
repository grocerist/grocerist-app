const dataUrl = "json_dumps/price_per_document.json";

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
        field: "total_value",
        headerFilter: "input",
    },
];

const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    minWidth: 200,
}));

d3.json(dataUrl, function (data) {
    console.log("Raw JSON data:", data); 

    data = Object.values(data).filter((item) => item.good && item.good.length > 0);

    let tableData = data.map((item) => ({
        grocerist_id: item.grocerist_id || "N/A", 
        good: item.good[0].value || "Unknown",
        price: item.price !== null ? item.price : "N/A",
        unit: item.unit ? item.unit.value : "N/A",
        amount_of_units: item.amount_of_units !== null ? item.amount_of_units : "N/A",
        total_value: item["Total Value"] !== null ? item["Total Value"] : "N/A",
    }));

    console.log("Processed table data:", tableData); 

    var table = new Tabulator("#prices-table", {
        ...commonTableConfig,
        data: tableData,
        columns: columnDefinitions,
        initialSort: [{ column: "good", dir: "asc" }],
    });
});
