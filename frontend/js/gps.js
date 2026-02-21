// gps.js - Handles Geolocation API and location sharing toggle

let watchId = null;
let isSharing = false;

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
                maximumAge: 0
            }
        );
        isSharing = true;
        toggleVisualState(true);

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
            sendLocationUpdate(null, null, "STOPPED");
        }
    }
}

// GPS Success
function successCallback(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    console.log(`GPS Update: Lat ${lat}, Lng ${lng}`);

    // Broadcast via WebSockets
    if (typeof sendLocationUpdate === "function") {
        sendLocationUpdate(lat, lng, "SHARING");
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
