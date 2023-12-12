const dataUrl = "json_dumps/categories.json"

function linkList(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="${item.grocerist_id}.html">${item.name}</a></li>`
    }).join(" ");
    return `<ul class="list-unstyled">${output}</ul>`
}

function linkToDetailView(cell) {
    var row = cell.getRow().getData()
    var cellData = cell.getData()
    var groceristId = row.grocerist_id
    var theLink = `<a href="${groceristId}.html">${cellData.name}</a>`
    return theLink
}

d3.json(dataUrl, function (data) {
    tableData = Object.values(data)

    var table = new Tabulator("#example-table", {
        height: 800,
        layout: "fitColumns",
        tooltips: true,
        data: tableData,
        responsiveLayout: "collapse",
        persistence: {
            headerFilter: true,
        },
        columnCalcs: "both",
        columns: [
            {
                title: "Good Category", field: "name", headerFilter: "input", formatter: function (cell) {
                    return linkToDetailView(cell)
                }, bottomCalc: "count"
            },
            {
                title: "Goods", field: "goods", mutator: linkList, headerFilter: "input", 
                formatter: function (cell) {
                    return get_scrollable_cell(this, cell);
                },
            },
            {
                title: "# Goods", field: "good_count", bottomCalc: "sum"
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