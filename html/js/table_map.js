// Config settings for map
// (Currently there are only common map settings)
const MAP_CFG = {
  initialZoom: 10,
  initialCoordinates: [41.01224, 28.976018],
  baseMapUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  maxZoom: 20,
  onRowClickZoom: 16,
  divId: 'map',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd'
}

// Common config settings for table
const TABLE_CFG = {
  height: '60vh',
  layout: 'fitColumns',
  width: '100%',
  pagination: true,
  paginationSize: 15,
  headerFilterLiveFilterDelay: 600,
  responsiveLayout: 'collapse',
  columns: [
    {
      title: 'Name',
      field: 'properties.name',
      headerFilter: 'input',
      formatter: function (cell) {
        return linkToDetailView(cell)
      }
    },
    {
      title: 'Documents',
      field: 'properties.documents',
      mutator: mutateDocumentField,
      headerFilter: 'input',
      formatter: function (cell) {
        return get_scrollable_cell(this, cell)
      },
      tooltip: true
    },
    {
      title: 'Nr. of Documents',
      field: 'properties.doc_count',
      headerFilter: 'number',
      headerFilterPlaceholder: 'at least...',
      headerFilterFunc: '>='
    },
    {
      title: 'Persons',
      field: 'properties.persons',
      mutator: mutatePersonField,
      headerFilter: 'input',
      formatter: function (cell) {
        return get_scrollable_cell(this, cell)
      }
    },
    {
      title: 'Nr. of Persons',
      field: 'properties.person_count',
      headerFilter: 'number',
      headerFilterPlaceholder: 'at least...',
      headerFilterFunc: '>='
    },
    {
      title: 'Location Type',
      field: 'properties.location_type',
      headerFilter: 'list',
      headerFilterParams: { valuesLookup: true }
    }
  ],
  initialSort: [{ column: 'properties.name', dir: 'asc' }],
  persistence: {
    headerFilter: true
  }
}

// mutator & formatter functions used by the columns in the table

// Function for initializing the (empty) map
function createMap () {
  console.log('loading map')
  const map = L.map(MAP_CFG.divId).setView(
    MAP_CFG.initialCoordinates,
    MAP_CFG.initialZoom
  )
  const baseMapLayer = L.tileLayer(MAP_CFG.baseMapUrl, {
    maxZoom: MAP_CFG.maxZoom,
    attribution: MAP_CFG.attribution
  })
  // handle the layers
  // order of adding matters!
  baseMapLayer.addTo(map)
  // create marker layers
  const docsMarkerLayer = new L.layerGroup()
  const persMarkerLayer = new L.layerGroup()
  // this is for the page gui / switch for toggling overlays
  const layerGroups = {
    'number of documents': docsMarkerLayer,
    'number of persons': persMarkerLayer
  }
  docsMarkerLayer.addTo(map)
  // persMarkerLayer.addTo(map);
  // passing the overlays as baselayers so they will be mutually exclusive
  const layerControl = L.control.layers(layerGroups, null, { collapsed: false })
  layerControl.addTo(map)
  return { map, layerGroups }
}

// Function for creating
function createTable (TABLE_CFG) {
  console.log('loading table')
  const table = new Tabulator('#places_table', TABLE_CFG)
  return table
}

// Function to create a marker
function createMarker (lat, long, radius, color) {
  return L.circleMarker([lat, long], { radius: radius, color: color })
}

// Function to get coordinate key from row data
function getCoordinates (rowData) {
  // order of coordinates in geojson is long, lat
  // order of coordinates in leaflet is lat, long
  let { coordinates } = rowData.geometry
  let [long, lat] = coordinates
  return { lat, long };
}

function getColorByLocationType(locationType) {
  switch (locationType) {
    case 'District':
      return '#662222'; 
    case 'Mahalle':
      return '#CC6666';
    case 'Karye':
      return '#994444';
    default:
      return '#000000'; // default color if locationType doesn't match any case
  }
}

function createMarkerLayers (table, layerGroups) {
  console.log('creating markers')
  let rows = table.getRows()
  let existingCirclesByCoordinates = {}
  rows.forEach(row => {
    let rowData = row.getData()
    if (rowData.geometry.coordinates) {
      let { lat, long } = getCoordinates(rowData);
      let coordinateKey = `${lat}${long}`;
      // create markers for doc count
      // using the same color for both document and person count markers
      let color = getColorByLocationType(rowData.properties.location_type);
      let docsRadius = rowData.properties.doc_count / 2
      let docsMarker = createMarker(lat, long, docsRadius / 2, color)
      // create markers for person count
      let persRadius = rowData.properties.person_count / 2
      let persMarker = createMarker(lat, long, persRadius, color)

      // store markers in existingCirclesByCoordinates
      existingCirclesByCoordinates[coordinateKey] = {
        'number of documents': docsMarker,
        'number of persons': persMarker
      }

      function onEachFeature (rowData) {
        let popupContent = `
          <h3><a href="${rowData.properties.grocerist_id}.html">${rowData.properties.name}<a/></h3>
          <ul>
          <li>${rowData.properties.doc_count} related <a href="documents.html">Documents</a></li>
          <li>${rowData.properties.person_count} related <a href="persons.html">Persons</a></li>
          </ul>
          `

        return popupContent
      }

      docsMarker.bindPopup(onEachFeature(rowData))
      persMarker.bindPopup(onEachFeature(rowData))
      // add markers to respective layerGroups
      docsMarker.addTo(layerGroups['number of documents'])
      persMarker.addTo(layerGroups['number of persons'])
    }
  })
  return existingCirclesByCoordinates
}

function setupEventHandlers (
  map,
  table,
  existingCirclesByCoordinates,
  layerGroups
) {
  const LayerManager = {
    activeLayer: 'number of documents',

    setActiveLayer: function () {
      // Toggle between marker layers
      map.on('baselayerchange', event => {
        this.activeLayer = event.name
      })
    },
    getActiveLayer: function () {
      return this.activeLayer
    }
  }

  function filterRowsandMarkers () {
    let displayedMarkers = Object.keys(existingCirclesByCoordinates)
    // every marker is displayed …
    table.on('dataFiltered', function (filters, rows) {
      // zooming in on first result if filtered table contains only a few rows
      if (rows.length < 4 && rows.length > 0) {
        let rowData = rows[0].getData()
        let { lat, long } = getCoordinates(rowData);
        let coordinateKey = `${lat}${long}`;
        zoomToPointFromRowData(rowData, map, existingCirclesByCoordinates)
        displayedMarkers.push(coordinateKey)
      } else {
        map.setView(MAP_CFG.initialCoordinates, MAP_CFG.initialZoom)
      }
      let markersToDisplay = rows.map(row => {
        let rowData = row.getData();
        let { lat, long } = getCoordinates(rowData);
        return `${lat}${long}`;
      });
    
      // hide & display filtered markers
      Object.entries(existingCirclesByCoordinates).forEach(
        ([coordinateKey, baselayers]) => {
          let docsMarker = baselayers['number of documents']
          let persMarker = baselayers['number of persons']
          if (markersToDisplay.includes(coordinateKey)) {
            // this marker should be displayed
            if (!displayedMarkers.includes(coordinateKey)) {
              // it is not beeing displayed
              // display it
              layerGroups['number of documents'].addLayer(docsMarker)
              layerGroups['number of persons'].addLayer(persMarker)
              displayedMarkers.push(coordinateKey)
            }
          } else {
            // this marker should be hidden
            if (displayedMarkers.includes(coordinateKey)) {
              // it is not hidden
              // hide it
              layerGroups['number of documents'].removeLayer(docsMarker)
              layerGroups['number of persons'].removeLayer(persMarker)
              let keyIndex = displayedMarkers.indexOf(coordinateKey)
              displayedMarkers.splice(keyIndex, 1)
            }
          }
        }
      )
    })
  }
  function handleRowClick () {
    //eventlistener for click on row
    table.on('rowClick', (e, row) => {
      zoomToPointFromRowData(row.getData(), map, existingCirclesByCoordinates)
    })
  }

  function zoomToPointFromRowData (rowData, map, existingCirclesByCoordinates) {
    if (rowData.geometry.coordinates) {
      let activeLayer = LayerManager.getActiveLayer()
      let { lat, long } = getCoordinates(rowData);
      let coordinateKey = `${lat}${long}`;
      let marker = existingCirclesByCoordinates[coordinateKey][activeLayer]
      marker.openPopup()
      map.setView([lat, long], MAP_CFG.onRowClickZoom)
    } else {
      // close all open popups when resetting the map
      map.closePopup()
      map.setView(MAP_CFG.initialCoordinates, MAP_CFG.initialZoom)
    }
  }

  function resizeIconsOnZoom () {
    let previousZoom
    map.on('zoomstart', function () {
      previousZoom = map.getZoom()
    })
    map.on('zoomend', function () {
      let zoomRatio = map.getZoom() / previousZoom
      Object.entries(existingCirclesByCoordinates).forEach(
        ([coordinateKey, markersForEachBaselayer]) => {
          Object.values(markersForEachBaselayer).forEach(marker => {
            // Adjust the circle radius based on the zoom ratio
            let currentSize = marker.getRadius()
            marker.setRadius(currentSize * zoomRatio)
          })
        }
      )
    })
  }
  LayerManager.setActiveLayer()
  filterRowsandMarkers()
  handleRowClick()
  resizeIconsOnZoom()
}

// Main function for initializing the map and table
export function setupMapAndTable (dataUrl) {
  const { map, layerGroups } = createMap()
  d3.json(dataUrl, function (dataFromJson) {
    // remove items with an empty name (mostly found in the neighbourhoods table)
    const tableData = Object.values(dataFromJson)[1].filter(
      item => item.properties.name.trim() !== ''
    )
    TABLE_CFG.data = tableData
    const table = createTable(TABLE_CFG)
    table.on('tableBuilt', function () {
      let existingCirclesByCoordinates = createMarkerLayers(table, layerGroups)
      setupEventHandlers(map, table, existingCirclesByCoordinates, layerGroups)
    })
  })
}
