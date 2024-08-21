const dataUrl = "json_dumps/categories.json";

d3.json(dataUrl, function (data) {
  tableData = Object.values(data);

  var table = new Tabulator("#example-table", {
    height: 800,
    layout: "fitColumns",
    tooltips: true,
    data: tableData,
    pagination: true,
    paginationSize: 15,
    responsiveLayout: "collapse",
    columnCalcs: "both",
    columns: [
      {
        title: "Grocery Category",
        field: "name",
        headerFilter: "input",
        formatter: linkToDetailView,
        bottomCalc: "count",
      },
      {
        title: "Groceries",
        field: "goods",
        ...linkListColumnSettings,
        formatterParams: {
          scrollable: true,
          urlPrefix: "",
          idField: "grocerist_id",
          nameField: "name",
        },
        headerFilterFuncParams: { nameField: "name" },
      },
      {
        title: "# Groceries",
        field: "good_count",
        bottomCalc: "sum",
      },
      {
        title: "Documents",
        field: "documents",
        ...linkListColumnSettings,
        formatterParams: {
          scrollable: true,
          urlPrefix: "",
          idField: "grocerist_id",
          nameField: "name",
        },
      },
      {
        title: "# Docs",
        field: "doc_count",
        bottomCalc: "sum",
      },
    ],
  });
});
