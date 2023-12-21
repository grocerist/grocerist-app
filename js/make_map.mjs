import L from "leaflet";
import { TabulatorFull as Tabulator } from "tabulator-tables";

function fetch_tabulatordata_and_build_table(map_cfg, map, table_cfg, marker_layer) {
	console.log("loading table");
	fetch(map_cfg.json_url)
		.then(function (response) {
			// json string
			return response.json();
		})
		.then(function (tabulator_data) {
			// the table will draw all markers on to the empty map
			table_cfg.data = tabulator_data;
			let table = build_map_table(table_cfg);
			populateMapFromTable(table, map, map_cfg.on_row_click_zoom, marker_layer);
		})
		.catch(function (err) {
			console.log(err);
		});
}

function get_html_link(name, url) {
	return `<a href='${url}'>${name}</a>`;
}

function get_html_list(array) {
	return `<ul><li>${array.join("</li><li>")}</li></ul>`;
}

function get_label_string_html(row, frequency) {
	let number_of_plays_mentioning = frequency;
	// could use properties.total_occurences later
	let label_string = `<b>${row.name}</b><br>(occurring in ${number_of_plays_mentioning} plays)<br>`;
	let plays_list_start = "<ul>";
	let plays_list_end = "</ul>";
	row.mentions.forEach((mention) => {
		let internal_id = mention[1];
		let play_title = mention[0];
		plays_list_start += `<li><a href='${internal_id}'>${play_title}</a></li>`;
	});
	return label_string + plays_list_start + plays_list_end;
}

function draw_cirlce_from_rowdata(latLng, frequency) {
	let radius = frequency;
	let html_dot = "";
	let border_width = 4;
	let border_color = "red";
	let size = radius * 10;
	let circle_style = `style="width: ${size}px; height: ${size}px; border-radius: 50%; display: table-cell; border: ${border_width}px solid ${border_color};  background: rgba(255, 0, 0, .5); overflow: hidden; position: absolute"`;
	let iconSize = size;
	let icon = L.divIcon({
		html: `<span ${circle_style}>${html_dot}</span>`,
		className: "",
		iconSize: [iconSize, iconSize],
	});
	let marker = L.marker(latLng, {
		icon: icon,
	});
	return marker;
}

function zoom_to_point_from_row_data(row_data, map, zoom, existing_markers_by_coordinates) {
	let coordinate_key = get_coordinate_key_from_row_data(row_data);
	let marker = existing_markers_by_coordinates[coordinate_key];
	marker.openPopup();
	map.setView([row_data.coordinates.lat, row_data.coordinates.lng], zoom);
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

export function build_linklist_cell(table, cell) {
	let values = cell.getValue();
	let i = 0;
	let links = [];
	while (i < values.length) {
		let pair = values[i];
		links.push(get_html_link(pair[0], pair[1]));
		i++;
	}
	let basic_html = get_html_list(links);
	return make_cell_scrollable(table, cell, basic_html);
}

function get_coordinate_key_from_row_data(row_data) {
	return row_data.coordinates.lat + row_data.coordinates.lng;
}

function init_map_from_rows(rows, marker_layer) {
	console.log("populating map with icons");
	let existing_circles_by_coordinates = {};
	rows.forEach((row) => {
		let row_data = row.getData();
		let coordinate_key = get_coordinate_key_from_row_data(row_data);
		let frequency = row_data.mentions.length;
		let new_circle = draw_cirlce_from_rowdata(
			[row_data.coordinates.lat, row_data.coordinates.lng],
			frequency,
		);
		existing_circles_by_coordinates[coordinate_key] = new_circle;
		new_circle.bindPopup(get_label_string_html(row_data, frequency));
		new_circle.addTo(marker_layer);
	});
	return existing_circles_by_coordinates;
}

function toggle_marker_visibility(marker) {
	if (marker._icon.style.display === "table-cell") {
		marker._icon.style.display = "none";
	} else if (marker._icon.style.display === "none") {
		marker._icon.style.display = "table-cell";
	} else {
		// after pageload there is no value direct value there
		// its still table-cell cause css
		marker._icon.style.display = "none";
	}
}

function populateMapFromTable(table, map, on_row_click_zoom, marker_layer) {
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
					on_row_click_zoom,
					existing_markers_by_coordinates,
				);
			} else {
				map.setView([48.210033, 16.363449], 5);
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
						// marker_layer.addLayer(marker);
						toggle_marker_visibility(marker);
						keys_of_displayed_markers.push(coordinate_key);
						console.log(marker);
					}
				} else {
					// this marker should be hidden
					if (keys_of_displayed_markers.includes(coordinate_key)) {
						// it is not hidden
						// hide it
						// marker_layer.removeLayer(marker);
						//console.log(marker);
						let index_of_key = keys_of_displayed_markers.indexOf(coordinate_key);
						keys_of_displayed_markers.splice(index_of_key, 1);
						toggle_marker_visibility(marker);
					}
				}
			});
		});
		//eventlistener for click on row
		table.on("rowClick", function (event, row) {
			let row_data = row.getData();
			zoom_to_point_from_row_data(
				row_data,
				map,
				on_row_click_zoom,
				existing_markers_by_coordinates,
			);
		});
	});
}

function build_map_table(table_cfg) {
	if (!("columns" in table_cfg)) {
		table_cfg.columns = [
			{
				headerFilter: "input",
				title: "name",
				field: "name",
				formatter: "html",
				resizable: false,
			},
			{
				title: "links",
				field: "geonames",
				formatter: "link",
				resizable: false,
				formatterParams: {
					url: function (cell) {
						return cell.getValue()[1];
					},
					label: function (cell) {
						return cell.getValue()[0];
					},
				},
			},
			{
				headerFilter: "input",
				title: "mentioned in",
				field: "mentions",
				resizable: false,
				formatter: function (cell) {
					return build_linklist_cell(this, cell);
				},
			},
			{
				headerFilter: "input",
				title: "alternative names",
				field: "alt_names",
				resizable: false,
				formatter: "textarea",
			},
			{
				title: "total occurences",
				field: "total_occurences",
				resizable: false,
				headerFilter: "input",
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
export function build_map_and_table(map_cfg, table_cfg, wms_cfg = null) {
	console.log("loading map");
	let map = L.map(map_cfg.div_id).setView(map_cfg.initial_coordinates, map_cfg.initial_zoom);
	let tile_layer = L.tileLayer(map_cfg.base_map_url, {
		maxZoom: map_cfg.max_zoom,
		attribution: map_cfg.attribution,
	});
	let marker_layer = L.layerGroup();
	// handle the layers
	// order of adding matters!
	tile_layer.addTo(map);
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
	// this has to happen here, in case historical map gets added
	marker_layer.addTo(map);
	var layerControl = L.control.layers(null, overlay_control);
	layerControl.addTo(map);
	fetch_tabulatordata_and_build_table(map_cfg, map, table_cfg, marker_layer);
}

export function build_table(table_id, table_cfg, json_url) {
	console.log("loading table");
	fetch(json_url)
		.then(function (response) {
			// json string
			return response.json();
		})
		.then(function (tabulator_data) {
			// the table will draw all markers on to the empty map
			table_cfg.data = tabulator_data;
			let table = new Tabulator(table_id, table_cfg);
			console.log("made table");
		})
		.catch(function (err) {
			console.log(err);
		});
}
