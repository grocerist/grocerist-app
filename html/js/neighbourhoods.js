
const dataUrl = "json_dumps/neighbourhoods.json"

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

function mutatePersonField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="person__${item.id}.html">${item.value}</a></li>`
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

    data = Object.values(data)
    let tableData = data.map((item) => {
        const enriched = item;
        enriched["doc_count"] = item.documents.length
        enriched["person_count"] = item.persons.length
        return enriched
    }).filter(item => item.name.trim() !== "");

    var table = new Tabulator("#example-table", {
        height: 800,
        layout: "fitColumns",
        tooltips: true,
        data: tableData,
        responsiveLayout: "collapse",
        persistence: {
            headerFilter: true,
        },
        initialSort: [
        { column: "name", dir: "asc" }
        ],
        columns: [
            {
                title: "Name", field: "name", headerFilter: "input", formatter: function (cell) {
                    return linkToDetailView(cell)
                }
            },
            {
                title:"District 18th century", field: "district_eighteenth_century", mutator: mutateDistrictField, headerFilter: "input", formatter:"html"
            },
            {
                title:"District 19th century", field: "district_nineteenth_century", mutator: mutateDistrictField, headerFilter: "input", formatter:"html"   
            },

            {
                title: "Documents", field: "documents", mutator: mutateDocumentField, headerFilter: "input",
                formatter: function (cell) {
                    return get_scrollable_cell(this, cell);
                },
                tooltip: true
            },
            {
                title: "Nr. of Documents", field: "doc_count", headerFilter: "number", headerFilterPlaceholder: "at least...", headerFilterFunc: ">="
            },
            {
                title: "Persons", field: "persons", mutator: mutatePersonField, headerFilter: "input", 
                formatter: function (cell) {
                    return get_scrollable_cell(this, cell);
                },

            },
            {
                title: "Nr. of Persons", field: "person_count", headerFilter: "number", headerFilterPlaceholder: "at least...", headerFilterFunc: ">="
            },
        ]
    });
});



