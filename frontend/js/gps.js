// gps.js - Handles Geolocation API and location sharing toggle

let watchId = null;
let isSharing = false;
let lastKnownLocation = null;
let lastMoveTime = Date.now();
let stopAlertSent = false;

const toggleBtn = document.getElementById('toggleSharingBtn');
const toggleKnob = document.getElementById('toggleKnob');
const statusLabel = document.getElementById('statusLabel');

// Initialize the toggle and permissions
document.addEventListener('DOMContentLoaded', () => {
    // Start sharing automatically when joining
    toggleSharing(true);
});

// Toggle Button Click Handler
toggleBtn.addEventListener('click', () => {
    toggleSharing(!isSharing);
});

// Visually update the toggle button
function toggleVisualState(on) {
    if (on) {
        toggleBtn.classList.remove('bg-slate-300');
        toggleBtn.classList.add('bg-blue-600');
        toggleKnob.classList.remove('translate-x-1');
        toggleKnob.classList.add('translate-x-8'); // Moving knob to right
    } else {
        toggleBtn.classList.remove('bg-blue-600');
        toggleBtn.classList.add('bg-slate-300');
        toggleKnob.classList.remove('translate-x-8');
        toggleKnob.classList.add('translate-x-1');
    }
}

// Start or Stop GPS Tracking
function toggleSharing(start) {

    if (start && !isSharing) {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        statusLabel.textContent = "Locating...";
        statusLabel.classList.remove("text-green-600", "text-red-600");
        statusLabel.classList.add("text-slate-500");

        // Request GPS access and start watching
        watchId = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000 // Accept positions up to 5s old
            }
        );
        isSharing = true;
        toggleVisualState(true);

        // Start checking for stops every 10 seconds
        setInterval(checkStopAlert, 10000);

    } else if (!start && isSharing) {
        // Stop watching
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        isSharing = false;
        toggleVisualState(false);

        statusLabel.textContent = "Sharing Paused";
        statusLabel.classList.remove("text-green-600", "text-slate-500");
        statusLabel.classList.add("text-red-600");

        // Inform backend we stopped
        if (typeof sendLocationUpdate === "function") {
            sendLocationUpdate(null, null, "OFFLINE");
        }
    }
}

// Check if stopped for > 3 minutes (180,000 ms)
function checkStopAlert() {
    if (!isSharing || !lastKnownLocation) return;

    const now = Date.now();
    const timeSinceLastMove = now - lastMoveTime;

    if (timeSinceLastMove > 180000 && !stopAlertSent) {
        console.log("User stopped for > 3 mins. Sending STOPPED status.");
        stopAlertSent = true;
        if (typeof sendLocationUpdate === "function") {
            sendLocationUpdate(lastKnownLocation.lat, lastKnownLocation.lng, "STOPPED");
        }
    }
}

// Helper to calculate distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// GPS Success
function successCallback(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // Check if we moved significantly (e.g. > 10 meters)
    if (lastKnownLocation) {
        const distance = calculateDistanceMeters(lat, lng, lastKnownLocation.lat, lastKnownLocation.lng);
        if (distance > 10) {
            lastMoveTime = Date.now(); // Reset the stop timer
            stopAlertSent = false;
        }
    } else {
        lastMoveTime = Date.now();
    }

    lastKnownLocation = { lat, lng };

    console.log(`GPS Update: Lat ${lat}, Lng ${lng}. Status: ${stopAlertSent ? 'STOPPED' : 'SHARING'}`);

    // Broadcast via WebSockets
    if (typeof sendLocationUpdate === "function") {
        sendLocationUpdate(lat, lng, stopAlertSent ? "STOPPED" : "SHARING");
    }
}

// GPS Error
function errorCallback(error) {
    console.error("GPS Error: ", error);
    let msg = "GPS Error";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            msg = "Permission Denied! Please enable GPS.";
            // Auto-turn off visually
            toggleSharing(false);
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "Location info unavailable.";
            break;
        case error.TIMEOUT:
            msg = "GPS request timed out.";
            break;
    }

    statusLabel.textContent = msg;
    statusLabel.classList.remove("text-green-600", "text-slate-500");
    statusLabel.classList.add("text-red-600");
}
