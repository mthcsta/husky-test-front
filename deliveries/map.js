function DeliveryMap(mapeta) {
    const map = L.map(mapeta, {
        center: [-30.039328, -51.211701],
		zoom: 10,
    })
    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    var mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

	L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr}).addTo(map);

    function createLayer(markTitle, markColor) {
        const layerGroup = L.layerGroup().addTo(map);
        const addMarker = (lat, lng) => {
            const marker = L.marker([lat, lng]).bindPopup(markTitle)
            layerGroup.addLayer(marker);
            marker.openPopup()
            marker._icon.classList.add(markColor);
        }
        const cleanMarkers = () => {
            layerGroup.clearLayers();
        }
        const updateMarker = (lat, lng) => {
            cleanMarkers();
            addMarker(lat, lng);
        };
        return { updateMarker, cleanMarkers };    
    }    
    function destroy () {
        if (map && map.remove) {
            map.off();
            map.remove();    
        }
    }

    return { createLayer, destroy }
}