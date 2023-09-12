
const dataUrl = "/data/documents.json"

function listGoods(value, data, type, params, component) {
    let output = value.map((item) => {
        var category = item.has_category
        var hasCategory = category.map((cat) => {
            return `${cat.value}`
        }).join(", ");
        console.log(item["has_category"])
        return `${item.name} (${hasCategory})`
    }).join("; ");
    return `${output}`
}

d3.json(dataUrl, function (data) {
    tableData = Object.values(data)

    var table = new Tabulator("#example-table", {
        height: 600,
        layout: "fitColumns",
        tooltips:true,
        data: tableData,
        responsiveLayout: "collapse",
        persistence: {
            headerFilter: true,
        },
        columns: [
            {
                title: "Shelfmark", field: "shelfmark", headerFilter: "input"
            },
            {
                title: "Document Id", field: "grocerist_id", headerFilter: "input"
            },
            {
                title: "Goods", field: "goods", mutator: listGoods, headerFilter: "input", formatter: "textarea", tooltip:true
            },
        ]
    });
});



