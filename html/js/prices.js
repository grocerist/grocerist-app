const dataUrl = "json_dumps/price_per_document.json";

const baseColumnDefinitions = [
    {
        title: "Document",
        field: "document",
        headerFilter: "input",
        formatter: function (cell) {
            let value = cell.getValue();
            return value !== "N/A" ? `<a href="/document-detail/${value}">${value}</a>` : value;
        }
    },
    {
        title: "Name",
        field: "good",
        headerFilter: "input",
        formatter: function (cell) {
            let value = cell.getValue();
            return value !== "Unknown" ? `<a href="/price-detail/${value}">${value}</a>` : value;
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

    if (!data || Object.keys(data).length === 0) {
        console.error("Error: No data found or empty JSON!");
        return;
    }

    let tableData = Object.values(data)
        .filter((item) => item.good?.length > 0) 
        .map((item) => ({
            document: item?.document?.[0]?.value ?? "N/A",
            good: item?.good?.[0]?.value ?? "Unknown",
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
