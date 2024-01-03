const dataUrl = 'json_dumps/districts.json'

// Config settings for map
const MAP_CFG = {
  initialZoom: 12,
  initialCoordinates: [41.01224, 28.976018],
  baseMapUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  maxZoom: 20,
  onRowClickZoom: 16,
  divId: 'map',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd'
}

// Config settings for table
const TABLE_CFG = {
  maxHeight: '60vh',
  layout: 'fitColumns',
  width: '100%',
  headerFilterLiveFilterDelay: 600,
  responsiveLayout: 'collapse',
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
  const layerControl = L.control.layers(layerGroups, null)
  layerControl.addTo(map)
  return { map, layerGroups }
}

// Functions for creating and initializing the table
function createTable () {
  console.log('loading table')

  // mutator & formatter functions
  function mutateDocumentField (value, data, type, params, component) {
    let output = value
      .map(item => {
        return `<li><a href="document__${item.id}.html">${item.value}</a></li>`
      })
      .join(' ')
    return `<ul class="list-unstyled">${output}</ul>`
  }

  function mutatePersonField (value, data, type, params, component) {
    let output = value
      .map(item => {
        return `<li><a href="person__${item.id}.html">${item.value}</a></li>`
      })
      .join(' ')
    return `<ul class="list-unstyled">${output}</ul>`
  }

  function linkToDetailView (cell) {
    let row = cell.getRow().getData()
    let cellData = cell.getData()
    let groceristId = row.grocerist_id
    let theLink = `<a href="${groceristId}.html">${cellData.name}</a>`
    return theLink
  }

  if (!('columns' in TABLE_CFG)) {
    TABLE_CFG.columns = [
      {
        title: 'Name',
        field: 'name',
        headerFilter: 'input',
        formatter: function (cell) {
          return linkToDetailView(cell)
        }
      },
      {
        title: 'Documents',
        field: 'documents',
        mutator: mutateDocumentField,
        headerFilter: 'input',
        formatter: function (cell) {
          return get_scrollable_cell(this, cell)
        },
        tooltip: true
      },
      {
        title: 'Nr. of Documents',
        field: 'doc_count',
        headerFilter: 'number',
        headerFilterPlaceholder: 'at least...',
        headerFilterFunc: '>='
      },
      {
        title: 'Persons',
        field: 'persons',
        mutator: mutatePersonField,
        headerFilter: 'input',
        formatter: function (cell) {
          return get_scrollable_cell(this, cell)
        }
      },
      {
        title: 'Nr. of Persons',
        field: 'person_count',
        headerFilter: 'number',
        headerFilterPlaceholder: 'at least...',
        headerFilterFunc: '>='
      }
    ]
  }

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
        html: '<span style="width: 100%; height: 100%; border-radius: 50%; display: table-cell; border: 4px solid red; background: rgba(255, 0, 0, .5); overflow: hidden; position: absolute;"></span>',
        className: 'doccircles',
        iconSize: [numDocs, numDocs]
      })
      let docsMarker = L.marker([rowData.lat, rowData.long], {
        icon: docsCircle
      })

      // create markers for person count
      let numPers = rowData.person_count
      let persCircle = L.divIcon({
        html: '<span style="width: 100%; height: 100%; border-radius: 50%; display: table-cell; border: 4px solid blue; background: rgba(0, 0, 255, .5); overflow: hidden; position: absolute;"></span>',
        className: 'perscircles',
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
        table.clearHeaderFilter()
      })
    },
    getActiveLayer: function () {
      return this.activeLayer
    }
  }

  function filterRowsandMarkers () {
    // every marker is displayed …
    let displayedMarkers = Object.keys(existingCirclesByCoordinates)
    table.on('dataFiltered', function (filters, rows) {
      let currentMarkerLayer
      // determine active layer
      const activeLayer = LayerManager.getActiveLayer()
      if (activeLayer === 'number of documents') {
        currentMarkerLayer = layerGroups['number of documents']
      } else if (activeLayer === 'number of persons') {
        currentMarkerLayer = layerGroups['number of persons']
      }

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
        ([coordinateKey, markersForEachBaselayer]) => {
          let marker = markersForEachBaselayer[activeLayer]
          if (markersToDisplay.includes(coordinateKey)) {
            // this marker should be displayed
            if (!displayedMarkers.includes(coordinateKey)) {
              // it is not beeing displayed
              // display it
              currentMarkerLayer.addLayer(marker)
              displayedMarkers.push(coordinateKey)
            }
          } else {
            // this marker should be hidden
            if (displayedMarkers.includes(coordinateKey)) {
              // it is not hidden
              // hide it
              currentMarkerLayer.removeLayer(marker)
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
function setupMapAndTable () {
  const { map, layerGroups } = createMap()
  d3.json(dataUrl, function (dataFromJson) {
    dataFromJson = Object.values(dataFromJson)
    const tableData = dataFromJson.map(item => {
      let enriched = item
      enriched['doc_count'] = item.documents.length
      enriched['person_count'] = item.persons.length
      return enriched
    })
    TABLE_CFG.data = tableData
    const table = createTable()
    table.on('tableBuilt', function () {
      let existingCirclesByCoordinates = createMarkerLayers(table, layerGroups)
      setupEventHandlers(map, table, existingCirclesByCoordinates, layerGroups)
    })
  })
}

setupMapAndTable()
