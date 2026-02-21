// map.js - Handles Leaflet map rendering

let map;
let markers = {}; // Store markers by memberId
let paths = {}; // Store polyline histories by memberId
let historyPoints = {}; // Store array of latlngs by memberId
let leaderMarkerId = null; // Store who the leader is
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
    // Initialize the map
    document.getElementById('memberCountLabel').textContent = "1 Member";

    // Fetch existing members
    fetchGroupMembers();
}

// Fetch all members of the group to sync initial state
async function fetchGroupMembers() {
    try {
        const response = await fetch(`http://localhost:8080/api/groups/${groupId}/members`);
        if (!response.ok) throw new Error('Failed to fetch members');

        const members = await response.json();
        members.forEach(m => {
            // We only map members who have a location
            if (m.latitude && m.longitude) {
                updateMemberOnMap({
                    memberId: m.memberId,
                    memberName: m.name,
                    role: m.role,
                    latitude: m.latitude,
                    longitude: m.longitude,
                    status: 'SHARING' // Assume sharing if they have coordinates
                });
            }
        });
        updateMemberCount();
    } catch (err) {
        console.error("Initial member sync failed:", err);
    }
}

function updateMemberCount() {
    const count = Object.keys(markers).length;
    document.getElementById('memberCountLabel').textContent = `${count} ${count === 1 ? 'Member' : 'Members'}`;
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

// Show a temporary toast notification
function showStopAlert(memberName) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce ease-in-out';
    toast.innerHTML = `⚠️ <b>${memberName}</b> has stopped!`;

    container.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Logic to check distance to leader
function updateLeaderDistance(myLatLng) {
    if (!leaderMarkerId || leaderMarkerId === memberId || !markers[leaderMarkerId] || !myLatLng) {
        document.getElementById('leaderHud').classList.add('hidden');
        return;
    }

    const leaderLatLng = markers[leaderMarkerId].getLatLng();
    const myPos = L.latLng(myLatLng[0], myLatLng[1]);
    const distanceMeters = myPos.distanceTo(leaderLatLng);

    const hud = document.getElementById('leaderHud');
    const distText = document.getElementById('leaderDistance');
    const warningText = document.getElementById('leaderWarning');

    hud.classList.remove('hidden');

    if (distanceMeters > 1000) {
        distText.textContent = (distanceMeters / 1000).toFixed(1) + ' km';
        warningText.classList.remove('hidden');
    } else {
        distText.textContent = Math.round(distanceMeters) + ' m';
        warningText.classList.add('hidden');
    }
}

// Called by socket.js when a location update is received
function updateMemberOnMap(update) {
    if (!update.latitude || !update.longitude) return;

    const latLng = [update.latitude, update.longitude];
    const isSelf = update.memberId === memberId;

    // Determine Leader Activity
    if (update.role === 'ADMIN') {
        leaderMarkerId = update.memberId;
    }

    // Trigger Stop Alert Toast (Ensure we only show it once per stop by checking a local flag)
    if (update.status === 'STOPPED' && (!markers[update.memberId] || !markers[update.memberId].isStopped)) {
        showStopAlert(update.memberName);
    }

    // --- Temporary Trip History Buffer ---
    if (!historyPoints[update.memberId]) historyPoints[update.memberId] = [];

    // Only add point if it moved significantly to save memory/processing (> 5 meters)
    const pts = historyPoints[update.memberId];
    if (pts.length === 0 || L.latLng(pts[pts.length - 1]).distanceTo(L.latLng(latLng)) > 5) {
        pts.push(latLng);
        if (pts.length > 180) pts.shift(); // Max 15 mins (180 points * 5s)
    }

    // Update Polyline
    const pathColor = isSelf ? '#3b82f6' : '#94a3b8';
    if (!paths[update.memberId]) {
        paths[update.memberId] = L.polyline(pts, {
            color: pathColor,
            weight: 3,
            dashArray: '5, 10',
            opacity: 0.6
        }).addTo(map);
    } else {
        paths[update.memberId].setLatLngs(pts);
    }
    // -------------------------------------

    if (markers[update.memberId]) {
        // Update existing marker
        markers[update.memberId].setLatLng(latLng);
        markers[update.memberId].isStopped = (update.status === 'STOPPED');

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

        marker.isStopped = (update.status === 'STOPPED');

        // Add popup
        marker.bindPopup(`<b>${update.memberName}</b><br/>Role: ${update.role || 'Member'}`);
        markers[update.memberId] = marker;

        updateMemberCount();

        // If it's the first time we get our own lock, zoom in
        if (isSelf) {
            map.setView(latLng, 15);
            document.getElementById('statusLabel').textContent = "Location Shared";
            document.getElementById('statusLabel').classList.remove("text-slate-500");
            document.getElementById('statusLabel').classList.add("text-green-600");

            if (!document.getElementById('toggleKnob').classList.contains('translate-x-7')) {
                toggleVisualState(true);
            }
        }
    }

    // Update the Leader HUD distance if we have both points
    if (isSelf) {
        updateLeaderDistance(latLng);
    } else if (leaderMarkerId === update.memberId && markers[memberId]) {
        updateLeaderDistance([markers[memberId].getLatLng().lat, markers[memberId].getLatLng().lng]);
    }
}

// Called by socket.js when someone exits
function removeMemberFromMap(exitMemberId) {
    if (markers[exitMemberId]) {
        map.removeLayer(markers[exitMemberId]);
        delete markers[exitMemberId];
    }
    if (paths[exitMemberId]) {
        map.removeLayer(paths[exitMemberId]);
        delete paths[exitMemberId];
        delete historyPoints[exitMemberId];
    }
    updateMemberCount();
}

// Initialize map on load
document.addEventListener("DOMContentLoaded", initMap);
