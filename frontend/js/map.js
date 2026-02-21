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
        const recenterBtn = document.getElementById('recenterBtn');
        if (recenterBtn) {
            recenterBtn.classList.remove('bg-blue-100', 'text-blue-700');
            recenterBtn.classList.add('bg-slate-100', 'text-slate-700');
        }
    });

    // Toggle Panel Logic
    const panel = document.getElementById('participantsPanel');
    const toggleBtn = document.getElementById('toggleParticipantsBtn');
    const closeBtn = document.getElementById('closeParticipantsBtn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('hidden-panel');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.add('hidden-panel');
        });
    }

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
            // Store metadata for the list even if no location yet
            memberMetadata[m.memberId] = {
                memberId: m.memberId,
                name: m.name,
                role: m.role,
                isSharing: !!(m.latitude && m.longitude)
            };

            // We only map members who have a location
            if (m.latitude && m.longitude) {
                updateMemberOnMap({
                    memberId: m.memberId,
                    memberName: m.name,
                    role: m.role,
                    latitude: m.latitude,
                    longitude: m.longitude,
                    status: 'SHARING'
                });
            }
        });
        updateMemberCount();
        updateParticipantsUI();
    } catch (err) {
        console.error("Initial member sync failed:", err);
    }
}

function updateMemberCount() {
    const activeCount = Object.keys(markers).length;
    const label = document.getElementById('memberCountLabel');
    if (label) {
        label.textContent = `${activeCount} ${activeCount === 1 ? 'Member' : 'Members'} Active`;
    }
}

// Recenter Button Logic
const recenterBtn = document.getElementById('recenterBtn');
if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
        isFollowingUser = true;
        recenterBtn.classList.remove('bg-slate-100', 'text-slate-700');
        recenterBtn.classList.add('bg-blue-100', 'text-blue-700');

        if (markers[memberId]) {
            map.setView(markers[memberId].getLatLng(), 15, { animate: true });
        }
    });
}

// Cache for member metadata (names/roles) to build the list
const memberMetadata = {};

function updateParticipantsUI() {
    const listContainer = document.getElementById('detailedParticipantsList');
    const countBadge = document.getElementById('memberCountBadge');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const allMembers = Object.values(memberMetadata);

    if (countBadge) {
        countBadge.textContent = allMembers.length;
        countBadge.classList.toggle('hidden', allMembers.length === 0);
    }

    if (allMembers.length === 0) {
        listContainer.innerHTML = '<p class="text-xs text-slate-400 italic text-center py-8">No participants yet</p>';
        return;
    }

    allMembers.forEach(m => {
        const isSelf = m.memberId === memberId;
        const roleClass = m.role ? `marker-${m.role.toLowerCase().replace('_', '-')}` : 'marker-member';
        const roleTitle = m.role ? m.role.replace('_', ' ') : 'Member';

        const row = document.createElement('div');
        row.className = `participant-row flex items-center gap-3 p-3 rounded-xl border border-slate-50 transition-all ${isSelf ? 'bg-blue-50/50 border-blue-100' : 'bg-white shadow-sm'}`;

        const initials = m.name ? m.name.substring(0, 2).toUpperCase() : "?";
        const dotColor = m.role === 'ADMIN' ? 'bg-amber-400' : (m.role === 'ROUTE_PLANNER' ? 'bg-purple-400' : 'bg-blue-400');

        row.innerHTML = `
            <div class="relative">
                <div class="custom-marker ${roleClass} ${isSelf ? 'self-marker' : ''}" style="width: 40px; height: 40px; font-size: 0.75rem; border-width: 2px;">
                    ${initials}
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${dotColor}"></span>
            </div>
            <div class="flex-grow">
                <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-slate-900">${m.name}${isSelf ? ' (You)' : ''}</h4>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">${roleTitle}</span>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full ${m.isSharing !== false ? 'bg-green-500' : 'bg-slate-300'}"></span>
                    <span class="text-[10px] text-slate-500">${m.isSharing !== false ? 'Live on Map' : 'Position Offline'}</span>
                </div>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

// Create custom icon
function createIcon(name, isSelf, role) {
    const initials = name ? name.substring(0, 2).toUpperCase() : "?";
    const roleClass = role ? `marker-${role.toLowerCase().replace('_', '-')}` : 'marker-member';
    const cssClass = `custom-marker ${roleClass} ${isSelf ? 'self-marker' : ''}`;

    return L.divIcon({
        className: 'custom-icon-wrapper',
        html: `<div class="${cssClass}" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">${initials}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

// Show a temporary toast notification
function showStopAlert(memberName) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce ease-in-out pointer-events-auto';
    toast.innerHTML = `⚠️ <b>${memberName}</b> has stopped!`;

    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 5000);
}

// Logic to check distance to leader
function updateLeaderDistance(myLatLng) {
    const HUD = document.getElementById('leaderHud');
    if (!HUD || !leaderMarkerId || leaderMarkerId === memberId || !markers[leaderMarkerId] || !myLatLng) {
        if (HUD) HUD.classList.add('hidden');
        return;
    }

    const leaderLatLng = markers[leaderMarkerId].getLatLng();
    const myPos = L.latLng(myLatLng[0], myLatLng[1]);
    const distanceMeters = myPos.distanceTo(leaderLatLng);

    const distText = document.getElementById('leaderDistance');
    const warningText = document.getElementById('leaderWarning');

    HUD.classList.remove('hidden');

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
    const isSelf = update.memberId === memberId;

    // 1. Update Metadata (Always do this even if lat/lng are missing)
    const isSharing = !!(update.latitude && update.longitude) && update.status !== 'OFFLINE';

    if (!memberMetadata[update.memberId] || memberMetadata[update.memberId].name !== update.memberName || memberMetadata[update.memberId].isSharing !== isSharing) {
        memberMetadata[update.memberId] = {
            memberId: update.memberId,
            name: update.memberName,
            role: update.role,
            isSharing: isSharing
        };
        updateParticipantsUI();
    }

    // 2. If coordinates are missing or status is OFFLINE, remove from map if exists
    if (!update.latitude || !update.longitude || update.status === 'OFFLINE') {
        if (markers[update.memberId]) {
            map.removeLayer(markers[update.memberId]);
            delete markers[update.memberId];
            updateMemberCount();
        }
        return;
    }

    const latLng = [update.latitude, update.longitude];

    if (update.role === 'ADMIN') {
        leaderMarkerId = update.memberId;
    }

    if (update.status === 'STOPPED' && (!markers[update.memberId] || !markers[update.memberId].isStopped)) {
        showStopAlert(update.memberName);
    }

    if (!historyPoints[update.memberId]) historyPoints[update.memberId] = [];
    const pts = historyPoints[update.memberId];
    if (pts.length === 0 || L.latLng(pts[pts.length - 1]).distanceTo(L.latLng(latLng)) > 5) {
        pts.push(latLng);
        if (pts.length > 180) pts.shift();
    }

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

    if (markers[update.memberId]) {
        markers[update.memberId].setLatLng(latLng);
        markers[update.memberId].isStopped = (update.status === 'STOPPED');
        if (isSelf && isFollowingUser) {
            map.setView(latLng, map.getZoom(), { animate: true });
        }
    } else {
        const marker = L.marker(latLng, {
            icon: createIcon(update.memberName, isSelf, update.role),
            zIndexOffset: isSelf ? 1000 : 0
        }).addTo(map);

        marker.isStopped = (update.status === 'STOPPED');
        marker.bindPopup(`<b>${update.memberName}</b><br/>Role: ${update.role || 'Member'}`);
        markers[update.memberId] = marker;

        updateMemberCount();

        if (isSelf) {
            map.setView(latLng, 15);
            const statusLabel = document.getElementById('statusLabel');
            if (statusLabel) {
                statusLabel.textContent = "Location Shared";
                statusLabel.classList.remove("text-slate-500");
                statusLabel.classList.add("text-green-600");
            }
            if (typeof toggleVisualState === 'function') toggleVisualState(true);
        }
    }

    if (isSelf) {
        updateLeaderDistance(latLng);
    } else if (leaderMarkerId === update.memberId && markers[memberId]) {
        updateLeaderDistance([markers[memberId].getLatLng().lat, markers[memberId].getLatLng().lng]);
    }
}

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

    if (memberMetadata[exitMemberId]) {
        delete memberMetadata[exitMemberId];
        updateParticipantsUI();
    }
}

document.addEventListener("DOMContentLoaded", initMap);
