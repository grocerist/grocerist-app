
const dataUrl = "json_dumps/documents.json"



d3.json(dataUrl, function (data) {
    tableData = Object.values(data)

    var table = new Tabulator("#example-table", {
        pagination:true,
        paginationSize:15,
        layout: "fitDataStretch",
        responsiveLayout:"collapse",
        height: 800,
        tooltips: true,
        data: tableData,
        persistence: {
            headerFilter: true,
        },
        columns: [
            {
                title: "Shelfmark", field: "shelfmark", headerFilter: "input", formatter: function (cell) {
                    return linkToDocumentsDetailView(cell)
                }
            },
            {
                title: "Bakkal/Grocer", field: "main_person", mutator: linkList, headerFilter: "input", formatter: "html"
            },
            {
                title: "Transcript", field: "transcript", formatter: "tickCross", headerFilter: "tickCross", headerFilterParams: { "tristate": true }, headerFilterEmptyCheck: function (value) { return value === null }
            },
            {
                title: "Facsimiles", field: "images", formatter: "tickCross", headerFilter: "tickCross", headerFilterParams: { "tristate": true }, headerFilterEmptyCheck: function (value) { return value === null }
            },
            {
                title: "Groceries", field: "goods", mutator: linkList, headerFilter: "input",
                formatter: function (cell) {
                    return get_scrollable_cell(this, cell);
                }, 
                tooltip: true
            },
            {
                title: "District", field: "district", mutator: mutateDistrictField, headerFilter: "input", formatter: "html"
            }
        ],
        footerElement: '<span class="tabulator-counter float-left">'+
        'Showing <span id="search_count"></span> results out of <span id="total_count"></span> '+
        '</span>'
    });

    table.on("dataLoaded", function(data){
        $("#total_count").text(data.length);
    });
    
    table.on("dataFiltered", function(filters, rows){
        $("#search_count").text(rows.length);
    });
});



