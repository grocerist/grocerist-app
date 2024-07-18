const dataUrl = "json_dumps/goods.json";

d3.json(dataUrl, function (data) {
  data = Object.values(data).filter((item) => item.name !== "");
  let tableData = data.map((item) => {
    const enriched = item;
    enriched["doc_count"] = item.documents.length;
    enriched["cat_cont"] = item.has_category.length;
    return enriched;
  });

  var table = new Tabulator("#example-table", {
    pagination: true,
    paginationSize: 15,
    layout: "fitDataStretch",
    responsiveLayout: "collapse",
    height: 800,
    tooltips: true,
    data: tableData,
    columns: [
      {
        title: "Name",
        field: "name",
        headerFilter: "input",
        formatter: linkToDetailView,
      },
      {
        title: "Documents",
        field: "documents",
        ...linkListColumnSettings,
        formatterParams: {
          scrollable: true,
          urlPrefix: "document__",
          idField: "id",
          nameField: "value",
        },
      },
      {
        title: "Nr. of Documents",
        field: "doc_count",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: ">=",
      },
      {
        title: "Categories",
        field: "has_category",
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "category__",
          idField: "id",
          nameField: "value",
        },
      },
      {
        title: "Nr. of Categories",
        field: "cat_cont",
        headerFilter: "number",
        headerFilterPlaceholder: "at least...",
        headerFilterFunc: ">=",
      },
    ],
  });
});
