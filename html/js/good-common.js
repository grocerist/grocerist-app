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
      field: "document",
      // TODO: find out if multiple documents are actually intended and adjust accordingly
      formatter: function (cell) {
        const year = (cell.getValue()[0].year);
        return year;
      },
      sorter:function(a, b){
        return a[0].year - b[0].year; 
    },
    },
    {
      title: "Price",
      field: "price",
    },
    {
      title: "Unit",
      field: "unit.value",
    },
    {
      title: "Amount",
      field: "amount_of_units",
    },
    {
      title: "Total Value",
      field: "total_value",
    },
  ];
  console.log(priceData);
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
