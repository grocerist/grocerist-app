
const dataUrl = "/data/persons.json"

function listGoods(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<a href="${item.grocerist_id}.html">${item.name}</a>`
    }).join(" ");
    return `${output}`
}

function linkToDetailView(cell) {
    var row = cell.getRow().getData()
    var cellData = cell.getData()
    var groceristId = row.grocerist_id
    var theLink = `<a target="_blank" href="${groceristId}.html">${cellData.name}</a>`
    return theLink
}

d3.json(dataUrl, function (data) {
    tableData = Object.values(data)

    var table = new Tabulator("#example-table", {
        height: 800,
        layout: "fitColumns",
        tooltips:true,
        data: tableData,
        responsiveLayout: "collapse",
        persistence: {
            headerFilter: true,
        },
        columns: [
            {
                title: "Name", field: "name", headerFilter: "input", formatter: function (cell) {
                    return linkToDetailView(cell)
                }
            },
            {
                title: "Religion", field: "religion", mutator: listGoods, headerFilter: "input", formatter: "html"
            }
        ]
    });
});



