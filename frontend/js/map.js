// map.js - Handles Leaflet map rendering

let map;
let markers = {}; // Store markers by memberId
let isFollowingUser = true; // Auto-center mode

// Default coordinates (e.g. center of US or India, will update when GPS locks)
const defaultCenter = [20.5937, 78.9629];
const defaultZoom = 5;

// Initialize the map
function initMap() {
    map = L.map('map', {
        zoomControl: false // Custom controls if needed
    }).setView(defaultCenter, defaultZoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add custom zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Disable auto-follow if user manually pans the map
    map.on('dragstart', () => {
        isFollowingUser = false;
        document.getElementById('recenterBtn').classList.remove('bg-blue-100', 'text-blue-700');
        document.getElementById('recenterBtn').classList.add('bg-slate-100', 'text-slate-700');
    });
}

// Recenter Button Logic
document.getElementById('recenterBtn').addEventListener('click', () => {
    isFollowingUser = true;
    document.getElementById('recenterBtn').classList.remove('bg-slate-100', 'text-slate-700');
    document.getElementById('recenterBtn').classList.add('bg-blue-100', 'text-blue-700');

    // If we have our own marker, pan to it
    if (markers[memberId]) {
        map.setView(markers[memberId].getLatLng(), 15, { animate: true });
    }
});

// Create custom icon
function createIcon(name, isSelf) {
    const initials = name ? name.substring(0, 2).toUpperCase() : "?";
    const cssClass = isSelf ? "custom-marker self-marker" : "custom-marker";

    return L.divIcon({
        className: 'custom-icon-wrapper',
        html: `<div class="${cssClass}" style="width: 36px; height: 36px;">${initials}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

// Called by socket.js when a location update is received
function updateMemberOnMap(update) {
    if (!update.latitude || !update.longitude) return;

    const latLng = [update.latitude, update.longitude];
    const isSelf = update.memberId === memberId;

    if (markers[update.memberId]) {
        // Update existing marker
        markers[update.memberId].setLatLng(latLng);

        // Auto-center map if following self
        if (isSelf && isFollowingUser) {
            map.setView(latLng, map.getZoom(), { animate: true });
        }
    } else {
        // Create new marker
        const marker = L.marker(latLng, {
            icon: createIcon(update.memberName, isSelf),
            zIndexOffset: isSelf ? 1000 : 0
        }).addTo(map);

        // Add popup
        marker.bindPopup(`<b>${update.memberName}</b><br/>Role: ${update.role || 'Member'}`);
        markers[update.memberId] = marker;

        // If it's the first time we get our own lock, zoom in
        if (isSelf) {
            map.setView(latLng, 15);
            document.getElementById('statusLabel').textContent = "Location Shared";
            document.getElementById('statusLabel').classList.remove("text-slate-500");
            document.getElementById('statusLabel').classList.add("text-green-600");

            // Set toggle to ON visually initially
            if (!document.getElementById('toggleKnob').classList.contains('translate-x-7')) {
                toggleVisualState(true);
            }
        }
    }
}

// Called by socket.js when someone exits
function removeMemberFromMap(exitMemberId) {
    if (markers[exitMemberId]) {
        map.removeLayer(markers[exitMemberId]);
        delete markers[exitMemberId];
    }
}

// Initialize map on load
document.addEventListener("DOMContentLoaded", initMap);
