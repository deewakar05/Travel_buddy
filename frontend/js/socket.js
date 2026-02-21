// socket.js - Handles STOMP WebSocket communication

let stompClient = null;

// The global group state
const groupId = sessionStorage.getItem('groupId');
const memberId = sessionStorage.getItem('memberId');
const memberName = sessionStorage.getItem('memberName');
const memberToken = sessionStorage.getItem('memberToken');

// Check if user has context, if not redirect to home
if (!groupId || !memberId) {
    window.location.replace('index.html');
}

// Ensure the UI shows the group ID and member info
const groupName = sessionStorage.getItem('groupName');
if (groupName) {
    document.getElementById('groupNameLabel').textContent = groupName;
}
document.getElementById('groupIdLabel').textContent = `ID: ${groupId}`;
document.getElementById('userNameLabel').textContent = memberName;
const role = sessionStorage.getItem('role') || 'MEMBER';
document.getElementById('roleBadge').textContent = role;
if (role === 'ADMIN' || role === 'ROUTE_PLANNER') {
    document.getElementById('roleBadge').className = "px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-md tracking-wider";
}

function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);

    // Disable debug logging in production, keep for beta
    // stompClient.debug = null; 

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);

        // Subscribe to group updates
        stompClient.subscribe(`/topic/group/${groupId}`, function (message) {
            const update = JSON.parse(message.body);
            handleLocationUpdate(update);
        });

    }, function (error) {
        console.error("STOMP connection error. Reconnecting in 5s...", error);
        setTimeout(connectWebSocket, 5000);
    });
}

function sendLocationUpdate(lat, lng, status = "SHARING") {
    if (stompClient && stompClient.connected) {
        const update = {
            groupId: groupId,
            memberId: memberId,
            memberName: memberName,
            memberToken: memberToken,
            latitude: lat,
            longitude: lng,
            status: status
        };
        stompClient.send("/app/location.update", {}, JSON.stringify(update));
    } else {
        console.warn("Cannot send update, STOMP client disconnected.");
    }
}

// Function triggered when an update is received from the broker
function handleLocationUpdate(update) {
    // If it's our own update bouncing back, we optionally ignore it if we handle local state,
    // but in this architecture, we let the map draw everyone including ourselves from the server.

    if (update.status === "EXITED") {
        removeMemberFromMap(update.memberId);
    } else {
        updateMemberOnMap(update);
    }
}

// Initialize connection
connectWebSocket();

// Handle exit group
document.getElementById('exitGroupBtn').addEventListener('click', () => {
    if (confirm("Are you sure you want to exit the trip?")) {
        sendLocationUpdate(null, null, "EXITED");
        // Clear session
        sessionStorage.clear();
        setTimeout(() => {
            window.location.replace('index.html');
        }, 500);
    }
});

function copyGroupLink() {
    // For Beta, we copy the ID. A true prod version would copy a full absolute URL.
    const url = `${window.location.origin}/join-group.html?groupId=${groupId}`;
    navigator.clipboard.writeText(`Join my trip on GroupDrive!\nLink: ${url}\nID: ${groupId}`);
    alert('Invite link copied to clipboard!');
}
