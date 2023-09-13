
const dataUrl = "/data/persons.json"

function mutateSelectField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li>${item.value}</li>`
    }).join(" ");
    return `<ul class="list-unstyled">${output}</ul>`
}

function mutateDocumentField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="document__${item.id}.html">${item.value}</a></li>`
    }).join(" ");
    return `<ul class="list-unstyled">${output}</ul>`
}

function mutateDistrictField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="district__${item.id}.html">${item.value}</a></li>`
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
                title: "Religion", field: "religion", mutator: mutateSelectField, headerFilter: "input", formatter: "html"
            },
            {
                title: "Documents", field: "documents", mutator: mutateDocumentField, headerFilter: "input", formatter: "html"
            },
            {
                title: "District", field: "district", mutator: mutateDistrictField, headerFilter: "input", formatter: "html"
            }
        ]
    });
});



