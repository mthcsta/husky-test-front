L.mapquest.key = 'lYrP4vF3Uk5zgTiGGuEzQGwGIVDGuy24';

function DeliveryMapQuest(elementMapId) {
    const map = L.mapquest.map(elementMapId, {
        center: [45.80138200, 100.38772700],
        layers: L.mapquest.tileLayer('map'),
        zoom: 1
    });
    function createLayer(markTitle, markColor) {
        const layerGroup = L.layerGroup().addTo(map);
        const addMarker = (lat, lng) => {
            const marker = L.marker([lat, lng], {
                icon: L.mapquest.icons.marker({
                    primaryColor: markColor
                })
            }).bindPopup(markTitle);
            layerGroup.addLayer(marker);
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

    return { createLayer };
}

const createDeliveryMap = DeliveryMapQuest('create-map');
const editDeliveryMap = DeliveryMapQuest('edit-map');