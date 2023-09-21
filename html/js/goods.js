
const dataUrl = "json_dumps/goods.json"

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

function mutateCateogryField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="category__${item.id}.html">${item.value}</a></li>`
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

    data = Object.values(data)
    let tableData = data.map((item) => {
        const enriched = item;
        enriched["doc_count"] = item.documents.length
        enriched["cat_cont"] = item.has_category.length
        return enriched
    });

    var table = new Tabulator("#example-table", {
        height: 800,
        layout: "fitColumns",
        tooltips: true,
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
                title: "Documents", field: "documents", mutator: mutateDocumentField, headerFilter: "input", formatter: "html", tooltip: true
            },
            {
                title: "Nr. of Documents", field: "doc_count", headerFilter: "number", headerFilterPlaceholder: "at least...", headerFilterFunc: ">="
            },
            {
                title: "Categories", field: "has_category", headerFilter: "input", formatter: "html", mutator: mutateCateogryField
            },
            {
                title: "Nr. of Cateogires", field: "cat_cont", headerFilter: "number", headerFilterPlaceholder: "at least...", headerFilterFunc: ">="
            },
        ]
    });
});



