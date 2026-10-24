# FixTrack QR — Smart Campus Maintenance Reporting System

> **Beginner-Friendly MERN Stack Project**  
> Streamlined campus facility issue reporting via classroom & laboratory QR codes.

---

## 🎯 Project Overview

FixTrack QR solves a daily problem across colleges and universities: reporting broken infrastructure (projectors, fans, computers, plumbing, Wi-Fi) is slow and messy. Students usually don't know who to contact or have to fill lengthy forms manually specifying building names and room numbers.

With **FixTrack QR**:
1. Every room has a unique QR sticker (e.g. `LOC-ENG-302` for Engineering Block Lab 302).
2. A student scans the sticker with their phone camera.
3. The maintenance form opens with the room already identified and verified.
4. The student chooses a category (`Projector/AV`, `Electrical`, `Furniture`, `Wi-Fi/Network`), adds a quick note, and submits.
5. Facilities administrators view the ticket on their console, assign technician status (`Pending` ➔ `In Progress` ➔ `Resolved`), and log completion remarks.
6. The student tracks the issue resolution status in real-time.

---

## 🏗️ System Architecture

```
[ Classroom / Lab QR Sticker ]
            │ (Camera Scan)
            ▼
[ React Mobile / Web App ] ──(REST API + JWT Auth)──▶ [ Node.js / Express Backend ]
                                                                │
                                                                ▼
                                                        [ MongoDB Database ]
                                                        - Users
                                                        - Locations
                                                        - Complaints
```

---

## 🔑 Quick Demo Credentials (Auto-Seeded)

The system automatically initializes default demo accounts and campus rooms on first run:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Student** | `student@campus.edu` | `student123` | Report issues, scan QR, view my complaints |
| **Admin** | `admin@campus.edu` | `admin123` | View all reports, update ticket status, manage campus rooms & print QR plaques |

---

## 🚀 How to Run the Application

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
- The backend runs at: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- *Note:* If local MongoDB is running, it connects automatically to `mongodb://127.0.0.1:27017/fixtrack_qr`. If MongoDB is not installed or running, the backend falls back to an embedded in-memory MongoDB instance automatically!

### 2. Start the Frontend React App
```bash
cd frontend
npm install
npm run dev
```
- The frontend will be available at: `http://localhost:5173`
- Open your browser to `http://localhost:5173` to explore the application.

---

## 📱 Core Pages & User Journeys

1. **Home (`/`)**: Hero page, 3-step explanation, one-click demo login, and an interactive **Classroom QR Simulator**.
2. **Report Issue (`/report?code=...`)**: Detects room QR code, locks classroom details, and allows submitting complaints with category & priority.
3. **Student Dashboard (`/student-dashboard`)**: Shows all complaints submitted by the student, live status badges, and admin resolution remarks.
4. **Admin Console (`/admin-dashboard`)**: Metrics (Total, Pending, In Progress, Resolved), status filter, category filter, search, and inline status update with technician remarks.
5. **Manage Rooms & QR Codes (`/locations`)**: Register campus classrooms/labs and print official physical QR stickers with college headers!

---

## 📝 Internship Report Alignment Guide

This project follows the structure recommended in your **Summer Internship Report** and **MERN Stack Project Guidelines**:

- **Chapter 1: Introduction & Problem Statement**: Campus facility maintenance delays, lack of transparency, manual room entry errors.
- **Chapter 2: Objectives & Scope**: Sub-30s reporting, automated location tagging via QR, role-based dashboard.
- **Chapter 3: System Design & Architecture**: High-level architecture, MongoDB schema models (`User`, `Location`, `Complaint`), REST API contracts.
- **Chapter 4: Implementation Details**:
  - Backend: Express router, JWT middleware, bcrypt password hashing.
  - Frontend: React components, Context API authentication, QR generation via `qrcode.react`.
- **Chapter 5: Testing & Results**: Unit testing endpoints, form validation, QR code scanning verification.
- **Chapter 6: Conclusion & Future Scope**: Push notifications, photo upload attachment for broken hardware, technician mobile app.
