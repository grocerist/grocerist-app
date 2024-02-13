const dataUrl = "json_dumps/categories.json"

d3.json(dataUrl, function (data) {
    tableData = Object.values(data)

    var table = new Tabulator("#example-table", {
        height: 800,
        layout: "fitColumns",
        tooltips: true,
        data: tableData,
        pagination:true,
        paginationSize:15,
        responsiveLayout: "collapse",
        persistence: {
            headerFilter: true,
        },
        columnCalcs: "both",
        columns: [
            {
                title: "Grocery Category", field: "name", headerFilter: "input", formatter: function (cell) {
                    return linkToDetailView(cell)
                }, bottomCalc: "count"
            },
            {
                title: "Groceries", field: "goods", mutator: linkList, headerFilter: "input", 
                formatter: function (cell) {
                    return get_scrollable_cell(this, cell);
                },
            },
            {
                title: "# Groceries", field: "good_count", bottomCalc: "sum"
            },
            {
                title: "Documents", field: "documents", mutator: linkList, headerFilter: "input",
                formatter: function (cell) {
                    return get_scrollable_cell(this, cell);
                },
                tooltip: true
            },
            {
                title: "# Docs", field: "doc_count", bottomCalc: "sum"
            }
        ]
    });
});