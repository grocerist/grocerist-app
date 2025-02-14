const dataUrl = "json_dumps/price_per_document.json";

const baseColumnDefinitions = [
    {
        title: "Name",
        field: "good",
        headerFilter: "input",
        formatter: linkToDetailView,
    },
    {
        title: "Price",
        field: "price",
        headerFilter: "input",
    },
    {
        title: "Unit",
        field: "unit",
        headerFilter: "input",
    },
    {
        title: "Amount",
        field: "amount_of_units",
        headerFilter: "input",
    },
    {
        title: "Total Value",
        field: "Total Value",
        headerFilter: "input",
    },
];

const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    minWidth: 200,
  }));

  d3.json(dataUrl, function (data) {
    data = Object.values(data).filter((item) => item.good !== ""); 
  
    let tableData = data.map((item) => {
      const enriched = item;
      return {
        good: item.good,                 
        price: item.price,               
        unit: item.unit,                 
        amount_of_units: item.amount_of_units,
        total_value: item["Total Value"], 
      };
    });
  
    var table = new Tabulator("#prices-table", {
      ...commonTableConfig,
      data: tableData,
      columns: columnDefinitions,
      initialSort: [{ column: "good", dir: "asc" }],
    });
  });
  