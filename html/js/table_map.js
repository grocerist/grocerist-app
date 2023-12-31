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
const commonTableCfg = {
  height: '60vh',
  layout: 'fitColumns',
  width: '100%',
  pagination:true,
  paginationSize:15,
  headerFilterLiveFilterDelay: 600,
  responsiveLayout: 'collapse',
  initialSort: [
    { column: "name", dir: "asc" }
    ],
  persistence: {
      headerFilter: true
  },
  langs: {
    default: {
      pagination: {
        counter: {
          showing: '',
          of: 'of',
          rows: ''
        }
      }
    }
  }
}

// mutator & formatter functions used by the columns in the table
export function mutateDocumentField (value, data, type, params, component) {
    let output = value
      .map(item => {
        return `<li><a href="document__${item.id}.html">${item.value}</a></li>`
      })
      .join(' ')
    return `<ul class="list-unstyled">${output}</ul>`
  }

export  function mutatePersonField (value, data, type, params, component) {
    let output = value
      .map(item => {
        return `<li><a href="person__${item.id}.html">${item.value}</a></li>`
      })
      .join(' ')
    return `<ul class="list-unstyled">${output}</ul>`
  }
export  function mutateDistrictField(value, data, type, params, component) {
    let output = value.map((item) => {
        return `<li><a href="district__${item.id}.html">${item.value}</a></li>`
    }).join(" ");
    return `<ul class="list-unstyled">${output}</ul>`
}
export  function linkToDetailView (cell) {
    let row = cell.getRow().getData()
    let cellData = cell.getData()
    let groceristId = row.grocerist_id
    let theLink = `<a href="${groceristId}.html">${cellData.name}</a>`
    return theLink
  }

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

// Functions for creating and initializing the table
function createTable (TABLE_CFG) {
  console.log('loading table')
  const table = new Tabulator('#places_table', TABLE_CFG)
  return table
}

function createMarkerLayers (table, layerGroups) {
  console.log('creating markers')
  let rows = table.getRows()
  let existingCirclesByCoordinates = {}
  rows.forEach(row => {
    let rowData = row.getData()
    if (rowData.lat) {
      let coordinateKey = rowData.lat + rowData.long

      // create markers for doc count
      let numDocs = rowData.doc_count
      let docsCircle = L.divIcon({
        html: '<span style="width: 100%; height: 100%; border-radius: 50%; display: table-cell; border: 4px solid #536e61; background: rgba(83, 110, 97, .5) ; overflow: hidden; position: absolute;"></span>',
        className: '',
        iconSize: [numDocs, numDocs]
      })
      let docsMarker = L.marker([rowData.lat, rowData.long], {
        icon: docsCircle
      })

      // create markers for person count
      let numPers = rowData.person_count
      let persCircle = L.divIcon({
        html: '<span style="width: 100%; height: 100%; border-radius: 50%; display: table-cell; border: 4px solid #79B4A9; background: rgba(121, 180, 169, .5); overflow: hidden; position: absolute;"></span>',
        className: '',
        iconSize: [numPers, numPers]
      })
      let persMarker = L.marker([rowData.lat, rowData.long], {
        icon: persCircle
      })

      // store markers in existingCirclesByCoordinates
      existingCirclesByCoordinates[coordinateKey] = {
        'number of documents': docsMarker,
        'number of persons': persMarker
      }

      function onEachFeature (rowData) {
        let popupContent = `
          <h3><a href="${rowData.grocerist_id}.html">${rowData.name}<a/></h3>
          <ul>
          <li>${rowData.doc_count} related <a href="documents.html">Documents</a></li>
          <li>${rowData.person_count} related <a href="persons.html">Persons</a></li>
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
        let coordinateKey = rowData.lat + rowData.long
        zoomToPointFromRowData(rowData, map, existingCirclesByCoordinates)
        displayedMarkers.push(coordinateKey)
      } else {
        map.setView(MAP_CFG.initialCoordinates, MAP_CFG.initialZoom)
      }

      let markersToDisplay = []
      rows.forEach(row => {
        let rowData = row.getData()
        let coordinateKey = rowData.lat + rowData.long
        markersToDisplay.push(coordinateKey)
      })
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
    if (rowData.lat) {
      let activeLayer = LayerManager.getActiveLayer()
      let coordinateKey = rowData.lat + rowData.long
      let marker = existingCirclesByCoordinates[coordinateKey][activeLayer]
      marker.openPopup()
      map.setView([rowData.lat, rowData.long], MAP_CFG.onRowClickZoom)
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
            let circleElement = marker.options.icon
            let currentSize = circleElement.options.iconSize
            let newSize = currentSize.map(size => size * zoomRatio)
            // Adjust the circle size
            circleElement.options.iconSize = newSize
            marker.setIcon(circleElement)
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
export function setupMapAndTable (dataUrl, specificTableCfg) {
  const TABLE_CFG = { ...commonTableCfg, ...specificTableCfg }
  const { map, layerGroups } = createMap()
  d3.json(dataUrl, function (dataFromJson) {
    dataFromJson = Object.values(dataFromJson)
    // adds doc and person count to the data 
    // and removes items with an empty name (mostly found in the neighbourhoods table)
    const tableData = dataFromJson.map(item => {
      let enriched = item
      enriched['doc_count'] = item.documents.length
      enriched['person_count'] = item.persons.length
      return enriched
    }).filter(item => item.name.trim() !== "");
    TABLE_CFG.data = tableData
    const table = createTable(TABLE_CFG)
    table.on('tableBuilt', function () {
      let existingCirclesByCoordinates = createMarkerLayers(table, layerGroups)
      setupEventHandlers(map, table, existingCirclesByCoordinates, layerGroups)
    })
  })
}
