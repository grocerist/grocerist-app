function getYearFromISODate(date) {
  let year = null;
  if (date) {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDatePattern.test(date)) {
      year = date.substring(0, 4);
    }
  }
  return year;
}

function initializeTabulator(priceData) {
  priceData = priceData.filter(
    (item) => item.document.length > 0
  );
  const baseColumnDefinitions = [
    {
      title: "Document",
      field: "document",
      // TODO find out if multiple documents ARE supposed to be possible
      ...linkListColumnSettings,
      formatterParams: {
        urlPrefix: "document__",
        idField: "id",
        nameField: "value",
      },
      sorterParams: {
        type: "string",
        alignEmptyValues: "bottom",
        valueMap: "value",
      },
    },
    {
      title: "Year",
      field: "doc_year",
      mutator: function (value, data, type, params, component) {
        if (value && value[0]) {
          return value[0].value}
      },
      headerFilter: "input",
      sorterParams: {
        alignEmptyValues: "bottom",
      },
    },
    {
      title: "Price",
      field: "price",
      formatter: noDataFormatter,
      headerFilter: "number",
      headerFilterPlaceholder: "at least...",
      headerFilterFunc: greaterThanFilter,
      sorterParams: {
        alignEmptyValues: "bottom",
      },
    },
    {
      title: "Unit",
      field: "unit.value",
      headerFilter: "list",
      headerFilterParams: {
        valuesLookup: true,
      },
      sorterParams: {
        alignEmptyValues: "bottom",
      },
    },
    {
      title: "Amount",
      field: "amount_of_units",
      formatter: noDataFormatter,
      headerFilter: "number",
      headerFilterPlaceholder: "at least...",
      headerFilterFunc: greaterThanFilter,
      sorterParams: {
        alignEmptyValues: "bottom",
      },
    },
    {
      title: "Total Value",
      field: "total_value",
      headerFilter: "number",
      headerFilterPlaceholder: "at least...",
      headerFilterFunc: greaterThanFilter,
      sorterParams: {
        alignEmptyValues: "bottom",
      },
    },
  ];

  const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    minWidth: 100,
  }));

  const currencyData = priceData.some((entry) => entry.currency);
  if (currencyData) {
    columnDefinitions.push({
      title: "Currency",
      field: "currency.value",
      headerFilter: "input",
    });
  }
  new Tabulator("#prices-table", {
    data: priceData,
    layout: "fitColumns",
    responsiveLayout: "collapse",
    columns: columnDefinitions,
    initialSort: [{ column: "doc_year", dir: "asc" }],
  });
}
