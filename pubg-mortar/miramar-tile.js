
document.addEventListener("DOMContentLoaded", function() {
    if (!window.myMap) {
        var map = L.map('map', {
            minZoom: 2,
            maxZoom: 9,
            maxNativeZoom: 5,
            tileSize: 256,
            continuousWorld: false,
            noWrap: true,
            center: [0, 0],
            zoom: 3,
            maxBounds: [
                [-90, -180],
                [90, 180]
            ],
            maxBoundsViscosity: 1.0
        });

        L.tileLayer('tiles/{z}/{x}/{y}.png', {
            minZoom: 2,
            maxZoom: 9,
            maxNativeZoom: 5,
            tileSize: 256,
            continuousWorld: false,
            noWrap: true
        }).addTo(map);

        // Function to measure distance between two points
        function measureDistance(latlng1, latlng2) {
            var distance = map.distance(latlng1, latlng2); // Distance in meters
            return distance;
        }

        var points = [];

        map.on('click', function(e) {
            if (points.length < 2) {
                var marker = L.marker(e.latlng).addTo(map);
                points.push(e.latlng);

                if (points.length === 2) {
                    var distance = measureDistance(points[0], points[1]);
                    console.log('Distance between points:', distance, 'meters');
                    
                    // Add a popup with the distance information
                    var midPoint = L.latLng(
                        (points[0].lat + points[1].lat) / 2,
                        (points[0].lng + points[1].lng) / 2
                    );

                    L.popup()
                        .setLatLng(midPoint)
                        .setContent('Distance between points: ' + distance.toFixed(2) + ' meters')
                        .openOn(map);

                    // Optionally, draw a line between the points
                    var polyline = L.polyline(points, { color: 'blue' }).addTo(map);
                }
            } else {
                // Reset points and markers for new measurement
                points = [];
                map.eachLayer(function(layer) {
                    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                        map.removeLayer(layer);
                    }
                });
            }
        });

        window.myMap = map;
    } else {
        console.log("Map is already initialized.");
    }
});
