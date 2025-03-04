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
  const columnDefinitions = [
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
      sorterParams:{
        type:"string",
        alignEmptyValues:"bottom",
        valueMap:"value",
    },
    },
    {
      title: "Year",
      field: "doc_year",
      mutator: function (value, data, type, params, component) {
        return value[0].value;
      },
      headerFilter: "input",
    },
    {
      title: "Price",
      field: "price",
      headerFilter: "number",
      headerFilterPlaceholder: "at least...",
      headerFilterFunc: greaterThanFilter
    },
    {
      title: "Unit",
      field: "unit.value",
      headerFilter: "list",
      headerFilterParams: {
        valuesLookup: true,
      },
    },
    {
      title: "Amount",
      field: "amount_of_units",
      headerFilter: "number",
      headerFilterPlaceholder: "at least...",
      headerFilterFunc: greaterThanFilter
    },
    {
      title: "Total Value",
      field: "total_value",
      headerFilter: "number",
      headerFilterPlaceholder: "at least...",
      headerFilterFunc: greaterThanFilter
    },
  ];

  new Tabulator("#prices-table", {
    data: priceData,
    layout: "fitColumns",
    columns: columnDefinitions,
  });
}

function markerPerDoc(doc_list, layerGroups) {
  const icon = "bi bi-basket3-fill";
  // create markers for each document
  for (let i = 0; i < doc_list.length; i++) {
    const doc = doc_list[i];
    const year = getYearFromISODate(doc.iso_date);
    if (doc.lat && doc.long) {
      const yearText = year ? `in ${year}` : "";
      const markerData = {
        lat: doc.lat,
        long: doc.long,
        year: year,
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
