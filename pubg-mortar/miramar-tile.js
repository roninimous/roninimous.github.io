// Define the bounds for the image overlay (coordinates correspond to 8x8 km area)
const imageBounds = [[0, 0], [8192, 8192]];

// Create a custom CRS that properly scales the tiles
const customCRS = L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1/32, 0, -1/32, 8192/32)
});

// Initialize the map
const map = L.map('map', {
    crs: customCRS, // Use custom coordinate reference system for tiles
    minZoom: 0,
    maxZoom: 8,
    maxBounds: [[0, 0], [8000, 8000]],
    maxBoundsViscosity: 1.0
}).setView([4000, 4000], 2); // Center the map in the middle of the image

// Add the tile layer instead of image overlay
L.tileLayer('miramar-tiles/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 8,
    maxNativeZoom: 5,
    tileSize: 256,
    noWrap: true
}).addTo(map);

// Variables to store the start and end points
let startPoint = null;
let endPoint = null;
let startMarker = null;
let endMarker = null;
let polyline = null;
let distanceMarker = null;
let radiusCircle = null;
let radiusLines = [];

// Array of given numbers
const numberArray = [121,133,145,157,169,181,193,204,216,228,239,250,262,273,284,295,307,317,328,339,350,360,371,381,391,401,411,421,431,440,450,459,468,477,486,495,503,512,520,528,536,544,551,559,566,573,580,587,593,600,606,612,618,624,629,634,639,644,649,653,658,662,666,669,673,676,679,682,685,687,689,691,693,695,696,697,698,699,699.25,699.5,699.75,700];

// Function to calculate distance
function calculateDistance(point1, point2) {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    const distance = Math.sqrt(dx * dx + dy * dy); // Distance in pixels
    const meters = distance * 8 / 8100; // Convert pixels to kilometers and then to meters
    return Math.floor(meters * 1000); // Convert km to meters
}

// Function to find the closest and second closest numbers in the array to the calculated distance
function findClosestNumbers(target, array) {
    const sortedArray = array.slice().sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    return [sortedArray[0], sortedArray[1]];
}

// Function to draw radius circle and lines
function drawRadius(point) {
    if (radiusCircle) {
        map.removeLayer(radiusCircle);
    }
    radiusCircle = L.circle(point, {
        radius: 711.25,
        color: 'red',
        weight: 1,
        fillOpacity: 0.1
    }).addTo(map);

    radiusLines.forEach(line => map.removeLayer(line));
    radiusLines = [];

    for (let i = 102; i <= 700; i += 101.25) {
        const circle = L.circle(point, {
            radius: i,
            color: 'orange',
            weight: 0.5,
            fillOpacity: 0
        }).addTo(map);
        radiusLines.push(circle);
    }
}

// Add click event to the map
map.on('click', function(e) {
    const latlng = e.latlng;
    const point = [latlng.lat, latlng.lng];

    if (!startPoint) {
        if (startMarker) {
            map.removeLayer(startMarker);
        }
        startPoint = point;
        startMarker = L.marker(startPoint).addTo(map);
        drawRadius(startPoint);
    } else {
        const distance = calculateDistance(startPoint, point);
        if (distance > 700) {
            if (startMarker) {
                map.removeLayer(startMarker);
            }
            if (radiusCircle) {
                map.removeLayer(radiusCircle);
            }
            radiusLines.forEach(line => map.removeLayer(line));
            radiusLines = [];
            startPoint = null;
            endPoint = null;
            return;
        }
        if (endMarker) {
            map.removeLayer(endMarker);
        }
        endPoint = point;
        endMarker = L.marker(endPoint).addTo(map);

        const [closestNumber, secondClosestNumber] = findClosestNumbers(distance, numberArray);

        // Draw the line
        if (polyline) {
            map.removeLayer(polyline);
        }
        polyline = L.polyline([startPoint, endPoint], { color: 'blue' }).addTo(map);

        // Place distance marker at the center of the line
        const midPoint = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];
        if (distanceMarker) {
            map.removeLayer(distanceMarker);
        }
        distanceMarker = L.marker(midPoint, {
            icon: L.divIcon({
                className: 'distance-label',
                html: `<div style="font-size:20px;font-weight:600;color:limegreen;text-shadow:1px 1px 1px black;width:100% ;white-space: nowrap;">
                        ${distance}M<br>Closest: ${closestNumber}M<br>Second Closest: ${secondClosestNumber}M</div>`
            })
        }).addTo(map);

        // Reset points for next calculation
        startPoint = null;
        endPoint = null;
        if (startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
        }
        if (radiusCircle) {
            map.removeLayer(radiusCircle);
        }
        radiusLines.forEach(line => map.removeLayer(line));
        radiusLines = [];
    }
});

// Handle keypress events
document.addEventListener('keypress', function(e) {
    if (e.key === 'c' || e.key === 'C') {
        if (startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
        }
        if (endMarker) {
            map.removeLayer(endMarker);
            endMarker = null;
        }
        if (polyline) {
            map.removeLayer(polyline);
            polyline = null;
        }
        if (distanceMarker) {
            map.removeLayer(distanceMarker);
            distanceMarker = null;
        }
        if (radiusCircle) {
            map.removeLayer(radiusCircle);
            radiusCircle = null;
        }
        radiusLines.forEach(line => map.removeLayer(line));
        radiusLines = [];
        startPoint = null;
        endPoint = null;
    }
});

// Change the cursor style to a circle
document.getElementById('map').style.cursor = 'crosshair';

// CSS for circle cursor
const cursorStyle = document.createElement('style');
cursorStyle.type = 'text/css';
cursorStyle.innerHTML = `
    #map {
        cursor: crosshair;
    }
  
    .distance-label {
        pointer-events: none; /* Make sure the label is not interactive */
    }
`;
document.head.appendChild(cursorStyle);
