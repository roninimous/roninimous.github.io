// Define the bounds for the image overlay (coordinates correspond to 2x2 km area)
const imageBounds = [[0, 0], [8000, 8000]]; // Adjusting to match the image resolution

// Initialize the map
const map = L.map('map', {
    crs: L.CRS.Simple, // Use simple coordinate reference system for custom images
    minZoom: -4,
    maxZoom: 4,
    maxBounds: imageBounds,
    maxBoundsViscosity: 1.0
}).setView([4000, 4000], -2); // Center the map in the middle of the image

// Add the image overlay
L.imageOverlay('https://s3.ap-southeast-2.amazonaws.com/test.goallan.com.au/vikendi.png', imageBounds).addTo(map);

// Adjust the map zoom to fit the bounds
// map.fitBounds(imageBounds);

// Variables to store the start and end points
let startPoint = null;
let endPoint = null;
let startMarker = null;
let endMarker = null;
let polyline = null;
let distanceMarker = null;

// Array of given numbers
const numberArray = [121,133,145,157,169,181,193,204,216,228,239,250,262,273,284,295,307,317,328,339,350,360,371,381,391,401,411,421,431,440,450,459,468,477,486,495,503,512,520,528,536,544,551,559,566,573,580,587,593,600,606,612,618,624,629,634,639,644,649,653,658,662,666,669,673,676,679,682,685,687,689,691,693,695,696,697,698,699,699.25,699.5,699.75,700];


// Function to calculate distance
function calculateDistance(point1, point2) {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    const distance = Math.sqrt(dx * dx + dy * dy); // Distance in pixels
    const meters = distance * 8 / 8000; // Convert pixels to kilometers and then to meters
    return meters * 1000; // Convert km to meters
}

// Function to find the closest and second closest numbers in the array to the calculated distance
function findClosestNumbers(target, array) {
    const sortedArray = array.slice().sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    return [sortedArray[0], sortedArray[1]];
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
    } else {
        if (endMarker) {
            map.removeLayer(endMarker);
        }
        endPoint = point;
        endMarker = L.marker(endPoint).addTo(map);

        const distance = calculateDistance(startPoint, endPoint);
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
                        ${distance.toFixed(2)}M<br>Closest: ${closestNumber}M<br>Second Closest: ${secondClosestNumber}M</div>`
            })
        }).addTo(map);

        // Reset points for next calculation
        startPoint = null;
        endPoint = null;
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

