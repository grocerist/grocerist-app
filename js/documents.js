const dataUrl = "json_dumps/documents.json";

d3.json(dataUrl, function (data) {
  tableData = Object.values(data).filter((item) => item.shelfmark !== "");

  //define column header menu as column visibility toggle
  const headerMenu = function () {
    let menu = [];
    const allColumns = this.getColumns();

    allColumns.forEach((column) => {
      let icon = document.createElement("i");
      icon.classList.add("bi");
      icon.classList.add(column.isVisible() ? "bi-eye" : "bi-eye-slash");

      //build label (contains icon and title)
      let label = document.createElement("span");
      let title = document.createElement("span");

      title.innerHTML = " " + column.getDefinition().title;

      label.appendChild(icon);
      label.appendChild(title);

      // Take inital visibility into account
      if (!column.isVisible()) {
        label.classList.add("text-muted");
      }

      //create menu item
      menu.push({
        label: label,
        action: function (e) {
          //prevent menu closing
          e.stopPropagation();

          //toggle current column visibility
          column.toggle();
          //change menu item icon and toggle text-muted class based on visibility
          label.classList.toggle("text-muted", !column.isVisible());
          if (column.isVisible()) {
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
          } else {
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
          }
        },
      });
    });

    return menu;
  };

  var table = new Tabulator("#documents-table", {
    pagination: true,
    paginationSize: 15,
    layout: "fitDataStretch",
    height: 800,
    tooltips: true,
    data: tableData,
    columns: [
      {
        title: "Shelfmark",
        field: "shelfmark",
        headerFilter: "input",
        formatter: linkToDetailView,
        headerMenu: headerMenu,
      },
      {
        title: "<i>Bakkal</i>/Grocer",
        field: "main_person",
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "",
          idField: "grocerist_id",
          nameField: "name",
        },
        headerFilterFuncParams: { nameField: "name" },
        headerMenu: headerMenu,
      },
      {
        title: "Transcript",
        field: "transcript",
        formatter: "tickCross",
        headerFilter: "tickCross",
        headerFilterParams: { tristate: true },
        headerFilterEmptyCheck: function (value) {
          return value === null;
        },
        headerMenu: headerMenu,
      },
      {
        title: "Facsimiles",
        field: "images",
        formatter: "tickCross",
        headerFilter: "tickCross",
        headerFilterParams: { tristate: true },
        headerFilterEmptyCheck: function (value) {
          return value === null;
        },
        headerMenu: headerMenu,
      },
      {
        title: "Groceries",
        field: "goods",
        formatterParams: {
          scrollable: true,
          urlPrefix: "",
          idField: "grocerist_id",
          nameField: "name",
        },
        ...linkListColumnSettings,
        headerFilterFuncParams: { nameField: "name" },
        headerMenu: headerMenu,
      },
      {
        title: "District",
        field: "district",
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "district__",
          idField: "id",
          nameField: "value",
        },
        headerMenu: headerMenu,
      },
      {
        title: "<i>Mahalle</i>",
        field: "neighbourhood",
        visible: false,
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "neighbourhood__",
          idField: "id",
          nameField: "value",
        },
        headerMenu: headerMenu,
      },
      {
        title: "<i>Karye</i>",
        field: "karye",
        visible: false,
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "karye__",
          idField: "id",
          nameField: "value",
        },
        headerMenu: headerMenu,
      },
      {
        title: "<i>Nahiye</i>",
        field: "nahiye",
        visible: false,
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "nahiye__",
          idField: "id",
          nameField: "value",
        },
        headerMenu: headerMenu,
      },
      {
        title: "Quarter",
        field: "quarter",
        visible: false,
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "quarter__",
          idField: "id",
          nameField: "value",
        },
        headerMenu: headerMenu,
      },
      {
        title: "Address",
        field: "address",
        visible: false,
        ...linkListColumnSettings,
        formatterParams: {
          urlPrefix: "address__",
          idField: "id",
          nameField: "value",
        },
        headerMenu: headerMenu,
      },
      {
        title: "Year <i>Hicri</i>",
        field: "year_of_creation_hicri",
        headerFilter: "input",
        headerMenu: headerMenu,
      },
      {
        title: "Year <i>Miladi</i>",
        field: "year_of_creation_miladi",
        headerFilter: "input",
        headerMenu: headerMenu,
      },
    ],
    footerElement: `<span class="tabulator-counter float-left">
                    Showing <span id="search_count"></span> results out of <span id="total_count"></span>
                    </span>`,
  });

  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });

  table.on("dataFiltered", function (filters, rows) {
    $("#search_count").text(rows.length);
  });
});
