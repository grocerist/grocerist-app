const gjDataUrl = "json_dumps/gj_neighbourhoods.json"

function onEachFeature(feature, layer) {
    let popupContent = `
    <h3><a href="${feature.properties.grocerist_id}.html">${feature.properties.name}<a/></h3>
    <ul>
        <li>${feature.properties.doc_count} related <a href="documents.html">Documents</a></li>
        <li>${feature.properties.person_count} related <a href="persons.html">Persons</a></li>
    </ul>
    `;

    if (feature.properties && feature.properties.popupContent) {
        popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
}


d3.json(gjDataUrl, function (data) {
    const map = L.map('map').setView([41.02602, 29.03451], 11);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.geoJSON(data, {
        onEachFeature
    }).addTo(map);
})