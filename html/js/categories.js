const dataUrl = "json_dumps/categories.json";
const baseColumnDefinitions = [
  {
    title: "Grocery Category",
    field: "name",
    headerFilter: "input",
    headerFilterFunc: childElementFilter,
    formatter: linkToDetailView,
    bottomCalc: "count",
    minWidth: 200,
  },
  {
    title: "Groceries",
    field: "goods",
    ...linkListColumnSettings,
    formatterParams: {
      scrollable: true,
      urlPrefix: "goods__",
      idField: "id",
      nameField: "value",
    },
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
      nameField: "shelfmark",
    },
    headerFilterFuncParams: { nameField: "shelfmark" },
  },
  {
    title: "# Docs",
    field: "doc_count",
    bottomCalc: "sum",
  },
];
// Add minWidth to each column
const columnDefinitions = baseColumnDefinitions.map((column) => ({
  ...column,
  minWidth: 150,
}));
let table;
function childElementFilter(headerValue, rowValue, rowData, filterParams) {
  //!! expanding while filter active will run the filter on the expanded rows
  console.log("childElementFilter");
  const searchValue = headerValue.toLowerCase();
  // console.log(rowValue);
  let match = false;
  if (rowValue.toLowerCase().includes(searchValue)) {
    match = true;
  }
  if (rowData._children) {
    rowData._children.forEach((child) => {
      if (child.name.toLowerCase().includes(headerValue.toLowerCase())) {
        const row = table.getRow(rowData.id);
        if (!row.isTreeExpanded()) {
          row.treeExpand();
        }
        match = true;
      }
    });
  }
  return match;
}

d3.json(dataUrl, function (data) {
  data = Object.values(data);

  const hierarchicalData = {};
  // First pass: Enrich data and initialize hierarchical structure for main categories
  const enrichedData = data.map((item) => {
    const enriched = {
      ...item,
      doc_count: item.documents.length,
      good_count: item.goods.length,
      part_of:
        item.part_of && item.part_of.length > 0 ? item.part_of[0].value : null,
    };

    // Initialize in hierarchical data structure only for main categories
    if (enriched.category_type.value === "main") {
      hierarchicalData[enriched.name] = enriched;
    }

    return enriched;
  });

  // Second pass: Link subcategories to their respective main categories
  enrichedData.forEach((item) => {
    if (item.category_type.value === "sub") {
      const parentCategory = hierarchicalData[item.part_of];
      if (parentCategory) {
        // Create _children array only if it doesn't exist
        if (!parentCategory._children) {
          parentCategory._children = [];
        }
        parentCategory._children.push(item);
      } else {
        console.warn("Parent category not found for", item);
      }
    }
  });

  // Third pass: Link sub-subcategories to their respective subcategories
  enrichedData.forEach((item) => {
    if (item.category_type.value === "subsub") {
      // Find the parent subcategory in the entire hierarchical data
      let parentCategory = null;
      for (const mainCategory in hierarchicalData) {
        const subcategories = hierarchicalData[mainCategory]._children || [];
        parentCategory = subcategories.find((sub) => sub.name === item.part_of);
        if (parentCategory) break;
      }

      if (parentCategory) {
        // Create _children array only if it doesn't exist
        if (!parentCategory._children) {
          parentCategory._children = [];
        }
        parentCategory._children.push(item);
      } else {
        console.warn("Parent subcategory not found for", item);
      }
    }
  });
  const tableData = Object.values(hierarchicalData);
  table = new Tabulator("#categories-table", {
    ...commonTableConfig,
    data: tableData,
    headerFilterLiveFilterDelay: 600,
    dataTree: true,
    columnCalcs: "both",
    columns: columnDefinitions,
    dataTreeExpandElement: `<i class="bi bi-caret-right-fill"></i>`,
    dataTreeCollapseElement: `<i class="bi bi-caret-down-fill"></i>`,
  });
  let filtersApplied = false;
  table.on("dataFiltered", function (filters, rows) {
    // This code will only run when all previously applied filters are cleared
    if (filtersApplied && filters.length === 0) {
      table.getRows().forEach((row) => {
        console.log(row.isTreeExpanded());
        if (row.isTreeExpanded()) {
          row.treeCollapse();
        }
      });
    }
    // Update the filtersApplied state
    filtersApplied = filters.length > 0;
  });
});
