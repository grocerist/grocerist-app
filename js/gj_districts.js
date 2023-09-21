const gjDataUrl = "json_dumps/gj_districts.json"

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
    const map = L.map('map').setView([41.02602, 28.97451], 12);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.geoJSON(data, {

        filter(feature, layer) {
            if (feature.properties) {
                // If the property "underConstruction" exists and is true, return false (don't render features under construction)
                return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
            }
            return false;
        },

        onEachFeature
    }).addTo(map);
})