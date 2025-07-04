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
  //define column width and add column visibility toggle
  const columnDefinitions = baseColumnDefinitions.map((column) => ({
    ...column,
    headerMenu: headerMenu,
    minWidth: 100,
  }));

  const currencyData = priceData.some((entry) => entry.currency);
  if (currencyData) {
    columnDefinitions.push({
      title: "Currency",
      field: "currency.value",
      headerFilter: "input",
      visible: false,
    });
  }
  const table = new Tabulator("#prices-table", {
    height: 700,
    data: priceData,
    layout: "fitColumns",
    responsiveLayout: "collapse",
    columns: columnDefinitions,
    initialSort: [{ column: "doc_year", dir: "asc" }],
    pagination: true,
    paginationSize: 10,
    footerElement: `<span class="tabulator-counter float-left">
                      Showing <span id="search_count"></span> results out of <span id="total_count"></span>
                      </span>`,
  });
      table.on("dataLoaded", function (data) {
      $("#total_count").text(data.length);
    });

    table.on("dataFiltered", function (_filters, rows) {
      $("#search_count").text(rows.length);
    });
}

function markerPerDoc(doc_list, layerGroups) {
  const icon = "bi bi-basket3-fill";
  // create markers for each document
  for (let i = 0; i < doc_list.length; i++) {
    const doc = doc_list[i];
    const century = doc.century?.value || null;
    const year = getYearFromISODate(doc.iso_date);
    if (doc.lat && doc.long) {
      const yearText = year ? `in ${year}` : "";
      const markerData = {
        lat: doc.lat,
        long: doc.long,
        century,
        popupContent: `<p>Mentioned in document <br>
            <strong><a href="document__${doc.id}.html">${doc.value}</a></strong><br>
            ${yearText}</p>`,
        icon: icon,
      };
      const { marker, layerName } = createMarker(markerData, true);
      marker.addTo(layerGroups[layerName]);
    }
  }
}
