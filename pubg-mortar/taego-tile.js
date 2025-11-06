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
L.tileLayer('taego-tiles/{z}/{x}/{y}.png', {
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
let endPointCircle = null;
let closestCircle = null;
let secondClosestCircle = null;
let thirdClosestCircle = null;

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

// Function to find the closest, second closest, and third closest numbers in the array to the calculated distance
function findClosestNumbers(target, array) {
    const sortedArray = array.slice().sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    return [sortedArray[0], sortedArray[1], sortedArray[2]];
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
        // Remove any previous endpoint marker and circle when starting a new measurement
        if (endMarker) {
            map.removeLayer(endMarker);
            endMarker = null;
        }
        if (endPointCircle) {
            map.removeLayer(endPointCircle);
            endPointCircle = null;
        }
        if (polyline) {
            map.removeLayer(polyline);
            polyline = null;
        }
        if (distanceMarker) {
            map.removeLayer(distanceMarker);
            distanceMarker = null;
        }
        if (closestCircle) {
            map.removeLayer(closestCircle);
            closestCircle = null;
        }
        if (secondClosestCircle) {
            map.removeLayer(secondClosestCircle);
            secondClosestCircle = null;
        }
        if (thirdClosestCircle) {
            map.removeLayer(thirdClosestCircle);
            thirdClosestCircle = null;
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
            if (endMarker) {
                map.removeLayer(endMarker);
            }
            if (endPointCircle) {
                map.removeLayer(endPointCircle);
            }
            if (closestCircle) {
                map.removeLayer(closestCircle);
            }
            if (secondClosestCircle) {
                map.removeLayer(secondClosestCircle);
            }
            if (thirdClosestCircle) {
                map.removeLayer(thirdClosestCircle);
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
        if (endPointCircle) {
            map.removeLayer(endPointCircle);
        }
        endPoint = point;
        endMarker = L.marker(endPoint).addTo(map);
        
        // Draw 5M diameter circle around the endpoint
        // Map coordinates: 8192 units = 8000 meters (8km), so 1 unit ≈ 1 meter
        endPointCircle = L.circle(endPoint, {
            radius: 7, // Adjusted radius for visibility
            color: 'yellow',
            weight: 3,
            fillOpacity: 0.3,
            fillColor: 'yellow',
            opacity: 0.8
        }).addTo(map);

        const [closestNumber, secondClosestNumber, thirdClosestNumber] = findClosestNumbers(distance, numberArray);

        // Draw circles for closest, second closest, and third closest distances around the start point
        // Remove any existing circles first
        if (closestCircle) {
            map.removeLayer(closestCircle);
        }
        if (secondClosestCircle) {
            map.removeLayer(secondClosestCircle);
        }
        if (thirdClosestCircle) {
            map.removeLayer(thirdClosestCircle);
        }
        
        // Draw closest distance circle
        closestCircle = L.circle(startPoint, {
            radius: closestNumber, // Map coordinates: 1 unit ≈ 1 meter
            color: 'lime',
            weight: 2,
            fillOpacity: 0.1,
            fillColor: 'lime',
            opacity: 0.7
        }).addTo(map);
        
        // Draw second closest distance circle
        secondClosestCircle = L.circle(startPoint, {
            radius: secondClosestNumber, // Map coordinates: 1 unit ≈ 1 meter
            color: 'orange',
            weight: 2,
            fillOpacity: 0.1,
            fillColor: 'orange',
            opacity: 0.7
        }).addTo(map);
        
        // Draw third closest distance circle
        thirdClosestCircle = L.circle(startPoint, {
            radius: thirdClosestNumber, // Map coordinates: 1 unit ≈ 1 meter
            color: 'cyan',
            weight: 2,
            fillOpacity: 0.1,
            fillColor: 'cyan',
            opacity: 0.7
        }).addTo(map);

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
                html: `<div style="font-size:20px;font-weight:600;color:limegreen;text-shadow:1px 1px 1px black;width:100% ;white-space: nowrap;">Setting 1: ${closestNumber}M</div><div style="font-size:20px;font-weight:600;color:orange;text-shadow:1px 1px 1px black;width:100% ;white-space: nowrap;">Setting 2: ${secondClosestNumber}M</div><div style="font-size:20px;font-weight:600;color:cyan;text-shadow:1px 1px 1px black;width:100% ;white-space: nowrap;">Setting 3: ${thirdClosestNumber}M</div>`
            })
        }).addTo(map);

        // Reset points for next calculation (but keep endMarker and circle visible)
        startPoint = null;
        endPoint = null;
        if (startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
        }
        // Keep endMarker and endPointCircle visible - they will be removed when a new start point is clicked
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
        if (endPointCircle) {
            map.removeLayer(endPointCircle);
            endPointCircle = null;
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
        if (closestCircle) {
            map.removeLayer(closestCircle);
            closestCircle = null;
        }
        if (secondClosestCircle) {
            map.removeLayer(secondClosestCircle);
            secondClosestCircle = null;
        }
        if (thirdClosestCircle) {
            map.removeLayer(thirdClosestCircle);
            thirdClosestCircle = null;
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
