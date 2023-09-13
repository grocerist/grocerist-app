
const dataUrl = "/data/documents.json"

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
    var theLink = `<a href="${groceristId}.html">${cellData.shelfmark}</a>`
    return theLink
}

function mutateDistrictField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="district__${item.id}.html">${item.value}</a></li>`
    }).join(" ");
    return `<ul class="list-unstyled">${output}</ul>`
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
                title: "Shelfmark", field: "shelfmark", headerFilter: "input", formatter: function (cell) {
                    return linkToDetailView(cell)
                }
            },
            {
                title: "Main Person", field: "main_person", mutator: listGoods, headerFilter: "input", formatter: "html"
            },
            {
                title: "Goods", field: "goods", mutator: listGoods, headerFilter: "input", formatter: "html", tooltip: true
            },
            {
                title: "District", field: "district", mutator: mutateDistrictField, headerFilter: "input", formatter: "html"
            }
        ]
    });
});



