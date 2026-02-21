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

* Private group creation
* Join via shareable link
* Role-based group management
* Live GPS location sharing
* Shared real-time map view
* Easy exit and stop-sharing controls

No app installation is required — it works directly in a mobile browser.

---

## 🎯 Objectives

* Enable real-time location sharing among group members
* Support group travel with multiple vehicles
* Implement role-based permissions
* Ensure user privacy and consent
* Keep development and deployment cost minimal using open-source tools

---

## 📦 Project Scope

### ✅ In Scope (Beta Version)

* Group creation and deletion
* Join group via shareable link
* Exit group at any time
* Role-based access control (Admin, Route Planner, Member)
* Live GPS location tracking
* Real-time map updates
* Start / Stop location sharing
* Temporary data storage for trips

### ❌ Out of Scope (Beta Version)

* Login / Signup system
* Persistent user profiles
* Chat or messaging
* Payments
* AI-based route optimization
* Native mobile applications

---

## 👥 User Roles & Permissions

### 👑 Admin

* Creates the group
* Shares group link
* Assigns roles
* Removes members
* Ends the trip for all members

### 🗺️ Route Planner

* Views all live locations
* Helps with route and navigation decisions
* Can share the group link (optional permission)

### 👤 Member

* Joins the group
* Shares live location
* Views other members’ locations
* Can exit the group anytime

### 🔐 Permission Matrix

| Action              | Admin | Route Planner | Member |
| ------------------- | ----- | ------------- | ------ |
| Join group          | ✔️    | ✔️            | ✔️     |
| Share live location | ✔️    | ✔️            | ✔️     |
| View live map       | ✔️    | ✔️            | ✔️     |
| Share group link    | ✔️    | ✔️            | ❌      |
| Assign roles        | ✔️    | ❌             | ❌      |
| Remove member       | ✔️    | ❌             | ❌      |
| End trip            | ✔️    | ❌             | ❌      |
| Exit group          | ✔️    | ✔️            | ✔️     |

---

## 🏗️ System Architecture (High Level)

1. User opens the web application
2. User creates or joins a group via link
3. Browser requests GPS permission
4. Location is fetched using Geolocation API
5. Location data is sent to backend server
6. Backend broadcasts updates using WebSockets
7. All group members see updated locations on the shared map

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3 / Tailwind CSS
* JavaScript / React.js
* Leaflet.js (map rendering)

### Backend (Java + Maven)

* Java 17+
* Spring Boot
* Spring Web (REST APIs)
* Spring WebSocket (real-time communication)
* Maven (build & dependency management)

### Maps & GPS

* Browser Geolocation API
* OpenStreetMap

### Database

* H2 (in-memory, beta)
* MongoDB (optional, future)

### Deployment

* Render / Railway (Spring Boot backend)
* Netlify / Vercel (Frontend)
* HTTPS via hosting platform or ngrok (during development)

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
name
role (ADMIN / ROUTE_PLANNER / MEMBER)
latitude
longitude
isSharing
lastUpdated
```

---

## ⚙️ Functional Requirements

* System shall allow users to create a group
* System shall generate a unique join link
* System shall allow users to join via link
* System shall fetch live GPS coordinates
* System shall update locations every 3–5 seconds
* System shall show all group members on a shared map
* System shall allow users to exit group anytime

---

## ⚡ Non-Functional Requirements

* Real-time updates within 5 seconds
* Mobile browser compatibility
* HTTPS required for GPS access
* Low battery consumption
* Secure and private group access

---

## 🔐 Security & Privacy

* Explicit user consent for GPS access
* Location sharing starts only after user action
* Location visible only to group members
* Location data cleared after trip ends
* No public or permanent storage of user location

---

## 🧩 Development Phases

| Phase   | Description                      |
| ------- | -------------------------------- |
| Phase 0 | Requirement & scope finalization |
| Phase 1 | UI/UX design                     |
| Phase 2 | Frontend development             |
| Phase 3 | Map & GPS integration            |
| Phase 4 | Backend APIs                     |
| Phase 5 | Real-time location sharing       |
| Phase 6 | Privacy & controls               |
| Phase 7 | Testing                          |
| Phase 8 | Deployment                       |

---

## 💰 Cost Estimation (Beta)

| Component           | Cost            |
| ------------------- | --------------- |
| Development tools   | ₹0              |
| Maps & APIs         | ₹0              |
| Hosting (free tier) | ₹0              |
| Domain (optional)   | ₹700 – ₹1,200   |
| **Total**           | **₹0 – ₹1,200** |

---

## ✅ Advantages

* No app installation required
* Real-time group coordination
* Simple and intuitive interface
* Cost-effective and scalable
* Ideal for group travel and convoys

---

## ⚠️ Limitations

* Requires internet connectivity
* GPS accuracy depends on device
* Battery usage during long trips

---

## 🚀 Future Enhancements

* Route sharing and navigation
* Group chat
* SOS / emergency alert
* Native mobile application
* AI-based convoy optimization

---

## 🧠 Technical Blueprint

### Backend Structure

```
server/
├── index.js
├── socket.js
├── routes/
│   └── groupRoutes.js
├── models/
│   ├── Group.js
│   └── Member.js
└── utils/
    └── idGenerator.js
```

### Frontend Structure

```
client/
├── index.html
├── create-group.html
├── join-group.html
├── map.html
├── css/
├── js/
│   ├── map.js
│   ├── socket.js
│   └── gps.js
```

### Real-Time Flow

```
GPS → Browser → WebSocket → Server
Server → Broadcast → Group Members
Map → Marker Update → Live View
```

---

## 🏁 Conclusion

GroupDrive provides a practical, real-world solution for real-time group travel coordination. By leveraging modern web technologies and real-time communication, it enables safe, efficient, and cost-effective live location sharing without requiring mobile app installation.

---

## 📄 License

This project is intended for educational and prototype purposes. License can be added as required.
