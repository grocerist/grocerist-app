const dataUrl = "json_dumps/districts.json"

//config settings for map
let map_cfg = {
    initial_zoom: "12",
    initial_coordinates: [41.02602, 28.97451],
    base_map_url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    max_zoom: "20",
    on_row_click_zoom: "16",
    div_id: "map",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
};

//config settings for table
let table_cfg = {
	maxHeight: "45vh",
	layout: "fitColumns",
	width: "100%",
	headerFilterLiveFilterDelay: 600,
	responsiveLayout: "collapse",
	paginationCounter: "rows",
	pagination: "local",
	paginationSize: 10,
	langs: {
		default: {
			pagination: {
				counter: {
					showing: "",
					of: "of",
					rows: "",
				},
			},
		},
	},
};

function fetch_tabulatordata_and_build_table(map_cfg, map, table_cfg, marker_layer) {
	console.log("loading table");
	d3.json(dataUrl, function (tabulator_data) {
		tabulator_data = Object.values(tabulator_data)
		let tableData = tabulator_data.map((item) => {
			const enriched = item;
			enriched["doc_count"] = item.documents.length
			enriched["person_count"] = item.persons.length
			return enriched
		});
		// the table will draw all markers on to the empty map
		table_cfg.data = tableData;
		let table = build_map_table(table_cfg);
		populateMapFromTable(table, map, marker_layer);
	})
}


function zoom_to_point_from_row_data(row_data, map, existing_markers_by_coordinates) {
	if (row_data.lat) {
		let coordinate_key = get_coordinate_key_from_row_data(row_data);
		let marker = existing_markers_by_coordinates[coordinate_key];
		marker.openPopup();
		map.setView([row_data.lat, row_data.long], map_cfg.on_row_click_zoom);
	}
	else {
		// close all open popups when resetting the map
		map.closePopup();
		map.setView(map_cfg.initial_coordinates, map_cfg.initial_zoom);
	}

}

function make_cell_scrollable(table, cell, cell_html_string_in) {
	var cell_html_element = cell.getElement();
	cell_html_element.style.whiteSpace = "pre-wrap";
	cell_html_element.style.overflow = "auto";
	cell_html_element.style.maxHeight = "100px";
	if (cell_html_string_in !== undefined) {
		return table.emptyToSpace(cell_html_string_in);
	} else {
		return table.emptyToSpace(cell.getValue());
	}
}

function get_coordinate_key_from_row_data(row_data) {
	if (row_data.lat) {
		return row_data.lat + row_data.long;
	}
}

function onEachFeature(row_data) {
    let popupContent = `
    <h3><a href="${row_data.grocerist_id}.html">${row_data.name}<a/></h3>
    <ul>
		<li>${row_data.doc_count} related <a href="documents.html">Documents</a></li>
		<li>${row_data.person_count} related <a href="persons.html">Persons</a></li>
    </ul>
    `;

    return popupContent;
}

function init_map_from_rows(rows, marker_layer) {
	console.log("populating map with icons");
	let existing_markers_by_coordinates = {};
	rows.forEach((row) => {
		let row_data = row.getData();
		if (row_data.lat) {
			let coordinate_key = get_coordinate_key_from_row_data(row_data);
			let marker = L.marker([row_data.lat, row_data.long]);
			existing_markers_by_coordinates[coordinate_key] = marker;
			marker.bindPopup(onEachFeature(row_data));
			marker.addTo(marker_layer);
		}
	});
	return existing_markers_by_coordinates;
}
/*
function toggle_marker_visibility(marker) {
	if (marker._icon.style.display == "table-cell") {
		marker._icon.style.display = "none";
	} else if (marker._icon.style.display == "none") {
		marker._icon.style.display = "table-cell";
	} else {
		// after pageload there is no value direct value there
		// its still table-cell cause css
		marker._icon.style.display = "none";
	}
}
*/

function populateMapFromTable(table, map, marker_layer) {
	table.on("tableBuilt", function () {
		console.log("built table");
		let all_rows = this.getRows();
		var existing_markers_by_coordinates = init_map_from_rows(all_rows, marker_layer);
		// every marker is displayed …
		var keys_of_displayed_markers = Object.keys(existing_markers_by_coordinates);
		table.on("dataFiltered", function (filters, rows) {
			if (rows.length < 4 && rows.length > 0) {
				let row_data = rows[0].getData();
				zoom_to_point_from_row_data(
					row_data,
					map,
					existing_markers_by_coordinates,
				);
			} else {
				map.setView([41.02602, 28.97451], 12);

			}
			let keys_of_markers_to_be_displayed = [];
			rows.forEach((row) => {
				let row_data = row.getData();
				let coordinate_key = get_coordinate_key_from_row_data(row_data);
				keys_of_markers_to_be_displayed.push(coordinate_key);
			});
			// hide & display filtered markers
			Object.entries(existing_markers_by_coordinates).forEach(([coordinate_key, marker]) => {
				if (keys_of_markers_to_be_displayed.includes(coordinate_key)) {
					// this marker should be displayed
					if (!keys_of_displayed_markers.includes(coordinate_key)) {
						// it is not beeing displayed
						// display it
						marker_layer.addLayer(marker);
						keys_of_displayed_markers.push(coordinate_key);
					}
				} else {
					// this marker should be hidden
					if (keys_of_displayed_markers.includes(coordinate_key)) {
						// it is not hidden
						// hide it
						marker_layer.removeLayer(marker);
						let index_of_key = keys_of_displayed_markers.indexOf(coordinate_key);
						keys_of_displayed_markers.splice(index_of_key, 1);

					}
				}
			});
		});
		//eventlistener for click on row
		table.on('rowClick', (_e, row) => {
			zoom_to_point_from_row_data(
				row.getData(),
				map,
				existing_markers_by_coordinates,
			);
		});
	});
	}

// mutator function(s)for table
function mutateDocumentField(value, _data, _type, _params, _component) {
			let output = value.map((item) => {
				return `<li><a href="document__${item.id}.html">${item.value}</a></li>`
			}).join(" ");
			return `<ul class="list-unstyled">${output}</ul>`
		}

function mutatePersonField(value, _data, _type, _params, _component) {
			let output = value.map((item) => {
				return `<li><a href="person__${item.id}.html">${item.value}</a></li>`
			}).join(" ");
			return `<ul class="list-unstyled">${output}</ul>`
		}

// formatter function(s) for table
function linkToDetailView(cell) {
			var row = cell.getRow().getData()
			var cellData = cell.getData()
			var groceristId = row.grocerist_id
			var theLink = `<a href="${groceristId}.html">${cellData.name}</a>`
			return theLink
		}

function build_map_table(table_cfg) {
			if (!("columns" in table_cfg)) {
				table_cfg.columns = [
					{
						title: "Name",
						field: "name",
						headerFilter: "input",
						formatter: function (cell) {
							return linkToDetailView(cell)
						}
					},
					{
						title: "Documents",
						field: "documents",
						mutator: mutateDocumentField,
						headerFilter: "input",
						formatter: function (cell) {
							return get_scrollable_cell(this, cell);
						},
						tooltip: true
					},
					{
						title: "Nr. of Documents",
						field: "doc_count",
						headerFilter: "number",
						headerFilterPlaceholder: "at least...",
						headerFilterFunc: ">="
					},
					{
						title: "Persons",
						field: "persons",
						mutator: mutatePersonField,
						headerFilter: "input",
						formatter: function (cell) {
							return get_scrollable_cell(this, cell);
						},

					},
					{
						title: "Nr. of Persons",
						field: "person_count",
						headerFilter: "number",
						headerFilterPlaceholder: "at least...",
						headerFilterFunc: ">="
					},
				];
			}
			let table = new Tabulator("#places_table", table_cfg);
			console.log("made table");
			return table;
		}

/////////////////////
// building the map//
/////////////////////
function build_map_and_table(map_cfg, table_cfg, wms_cfg = null) {
			console.log("loading map");
		 	var map = L.map(map_cfg.div_id).setView(map_cfg.initial_coordinates, map_cfg.initial_zoom);
			let tile_layer = L.tileLayer(map_cfg.base_map_url, {
				maxZoom: map_cfg.max_zoom,
				attribution: map_cfg.attribution,
			});

			let marker_layer = L.layerGroup();
			// handle the layers
			// order of adding matters!
			tile_layer.addTo(map);
			/*
			// this is for the page gui / switch for toggling overlays
			let overlay_control = {
				"modern map": tile_layer,
				"mentioned entities": marker_layer,
			};
			// if cfg is provided wms map layer gets added
			if (wms_cfg !== null) {
				let wms_layer = L.tileLayer.wms(wms_cfg.wms_url, wms_cfg.wmsOptions);
				wms_layer.addTo(map);
				overlay_control["Stadtplan 1858 (k.k. Ministerium des Inneren)"] = wms_layer;
			}
			*/
			// this has to happen here, in case historical map gets added
			marker_layer.addTo(map);
			//var layerControl = L.control.layers(null, overlay_control);
			//layerControl.addTo(map);
			fetch_tabulatordata_and_build_table(map_cfg, map, table_cfg, marker_layer);
		}

build_map_and_table(map_cfg, table_cfg);