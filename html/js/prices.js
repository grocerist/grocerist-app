const dataUrl = "json_dumps/price_per_document.json";

const baseColumnDefinitions = [

    {
        title: "Name",
        field: "good",
        headerFilter: "input",
        formatter: function (cell) {
            let good = cell.getValue();
            return `<a href="goods__${good.id}.html">${good.value}</a>`;
        }
    },
    {
        title: "Document",
        field: "document",
        headerFilter: "input",
        formatter: function (cell) {
            let document = cell.getValue();
            return `<a href="document__${document.id}.html">${document.value}</a>`;
        }
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

d3.json(dataUrl, function (error, data) {
    if (error) {
        console.error("Failed to load JSON data:", error);
        return;
    }

    console.log("Raw JSON Data:", data);    
    let tableData = Object.values(data)
        .filter((item) => item.good?.length > 0) 
        .map((item) => ({
            document: item.document?.[0],
            good: item.good?.[0],
            price: item?.price ?? "N/A",
            unit: item?.unit?.value ?? "N/A",
            amount_of_units: item?.amount_of_units ?? "N/A",
            total_value: item?.total_value ?? "N/A",
        }));

    console.log("Processed Table Data:", tableData);

    var table = new Tabulator("#prices-table", {
        ...commonTableConfig,
        data: tableData,
        columns: columnDefinitions,
        initialSort: [{ column: "good", dir: "asc" }],
    });
});
