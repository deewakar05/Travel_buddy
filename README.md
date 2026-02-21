# 🚗 GroupDrive

## Real-Time Group Location Sharing System for Group Travel & Driving

---

## 📌 Overview

**GroupDrive** is a web-based real-time location sharing system designed for group travel scenarios where people are moving in multiple vehicles (cars/bikes). It allows users to create a private group, join via a shareable link, and view each other’s **live GPS locations on a shared map** while driving.

The system is lightweight, privacy-focused, and built mainly using **open-source technologies**, making it suitable for a beta release, college projects, or startup MVPs.

---

## 🎯 Problem Statement

When people travel together in different vehicles:
* They lose track of each other easily
* Frequent calls/messages distract drivers
* Existing navigation apps focus on individuals, not groups

There is a need for a **simple, browser-based solution** that enables **real-time group coordination during travel**.

---

## 💡 Proposed Solution

GroupDrive provides:

### ✅ In Scope (Beta Version)

* Group creation and deletion
* Join group via shareable link
* Exit group at any time
* Role-based access control (Admin, Route Planner, Member)
* Live GPS location tracking
* Real-time map updates
* Start / Stop location sharing
* Temporary data storage for trips

### ✨ Advanced Features (New!)

* **Leader / Convoy Mode**: Displays distance to the group leader and warns users if they are falling behind (> 1km).
* **Smart Stop Alerts**: Automatically notifies the entire group if a member has been stopped for more more than 3 minutes.
* **Temporary Trip History**: Draws a dotted breadcrumb path showing the last 15 minutes of travel history for every active member.
* **Lightweight Authentication**: Generates unique `memberToken` UUIDs stored in browser cache to validate WebSockets and prevent location spoofing.

No app installation is required — it works directly in a mobile browser.

---

## 🛠️ Technology Stack

### Frontend
* HTML5
* CSS3 / **Tailwind CSS**
* Vanilla **JavaScript**
* **Leaflet.js** (Map rendering)
* **Browser Geolocation API** & SockJS / STOMP

### Backend 
* **Java 17 / 25**
* **Spring Boot**
* **Spring Web** (REST APIs)
* **Spring WebSocket** (Real-time broadcasting via STOMP)
* **Maven** (Build & dependency management)

### Database
* **H2** (In-memory database for beta)

### Deployment
* **Render** (via Multi-stage **Docker** build)
* **Netlify / Vercel / GitHub Pages** (Frontend)

---

## 💻 How to Run Locally

### 1. Start the Backend
1. Ensure you have Java 17+ and Maven installed.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`.*

### 2. Start the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Serve the static files using any local HTTP server. For example, using Python:
   ```bash
   python -m http.server 3000
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 🐳 How to Deploy on Render

The backend is fully Dockerized and ready for 1-click deployment on Render.

1. Create an account on [Render.com](https://render.com).
2. Click **New > Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Connect this repository to Render.
5. In the settings:
   - **Name**: `groupdrive-api`
   - **Runtime**: `Docker` (Render automatically detects the provided `Dockerfile`)
   - **Instance Type**: `Free`
6. Click **Create Web Service**.

> **Note**: After the backend is successfully deployed, update the `SOCKET_URL` variable inside `frontend/js/socket.js` to point to your new public Render backend URL (e.g. `https://groupdrive-api.onrender.com/ws`) instead of `localhost`. Then, deploy the frontend using GitHub Pages, Vercel, or Netlify.

---

## 🗂️ Data Model Design

### Group
```
groupId
groupName
adminId
createdAt
isActive
```

### Member
```
memberId
groupId
name
role (ADMIN / ROUTE_PLANNER / MEMBER)
latitude
longitude
isSharing
lastUpdated
```

---

## 🔐 Security & Privacy

* Explicit user consent for GPS access
* Location sharing starts only after user action
* Location visible only to group members
* Location data cleared after trip ends
* No public or permanent storage of user location

---

## 🧠 Technical Blueprint

### Backend Structure
```
backend/
├── pom.xml
└── src/main/java/com/groupdrive/
    ├── GroupDriveApplication.java
    ├── config/ WebSocketConfig.java
    ├── controller/ GroupController.java, LocationController.java
    ├── dto/ CreateGroupRequest.java, JoinGroupRequest.java, etc.
    ├── model/ Group.java, Member.java
    ├── repository/ GroupRepository.java, MemberRepository.java
    ├── service/ GroupService.java
    └── util/ IdGenerator.java
```

### Frontend Structure
```
frontend/
├── index.html
├── create-group.html
├── join-group.html
├── map.html
└── js/
    ├── map.js
    ├── socket.js
    └── gps.js
```

### Real-Time Flow
```
GPS → Browser → STOMP WebSocket → Spring Boot Server
Server → Broadcast → Subscribed Group Members
Map (Leaflet) → Marker Update → Live View
```

---

## 📄 License

This project is intended for educational and prototype purposes.
