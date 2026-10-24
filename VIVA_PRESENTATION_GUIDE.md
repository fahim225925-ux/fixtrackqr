# FixTrack QR — Viva & Internship Defense Q&A Guide

Prepare for your project presentation and viva examination with these answers to common evaluator questions:

---

### Q1: What problem does FixTrack QR solve that existing college portals do not?
**Answer:**  
Traditional college complaint systems require students to manually type or search for their campus building, floor, and room number from long dropdowns. This creates high friction, resulting in students not reporting issues at all or reporting the wrong room. FixTrack QR uses physical QR code stickers placed inside classrooms and laboratories. Scanning the code automatically locks in the verified physical location (`LOC-SCI-101`) in under 2 seconds, reducing total reporting time to sub-25 seconds.

---

### Q2: Walk me through the database schema. Why did you structure it this way?
**Answer:**  
We established three normalized Mongoose models:
1. **User Model:** Stores credentials with bcrypt hashing and role enum (`student` vs `admin`).
2. **Location Model:** Stores physical campus data (building, floor, room number) mapped to a unique indexed `qrCodeId`.
3. **Complaint Model:** Stores the ticket with foreign key references (`location` referencing Location and `submittedBy` referencing User), status enum (`Pending`, `In Progress`, `Resolved`, `Rejected`), priority levels, and technician completion remarks.

This relational referencing via Mongoose `ObjectId` and `.populate()` prevents data redundancy and ensures that changing room details automatically reflects across all associated past tickets.

---

### Q3: How is security and Role-Based Access Control (RBAC) implemented?
**Answer:**  
Security is enforced on both backend and frontend:
- **Backend:** JWT (JSON Web Token) authentication middleware. The `protect` middleware verifies the Bearer token signature, and `adminOnly` middleware rejects non-admin users with an HTTP 403 Forbidden.
- **Frontend:** A React `ProtectedRoute` wrapper inspects the user role stored in `AuthContext`. If an unauthenticated user or student tries to open `/admin-dashboard` or `/locations`, they are automatically redirected.
- **Password Security:** Sensitive credentials are never stored in plaintext; `bcryptjs` salt rounds (10 rounds) hash all passwords before saving.

---

### Q4: How does the QR code scanning work technically?
**Answer:**  
Each location has a unique identifier (e.g., `LOC-ENG-302`). The QR code encodes a direct deep-link:
`https://<domain>/report?code=LOC-ENG-302`
When scanned by a smartphone camera or the in-app simulator, the React router parses the query parameter, fires a `GET /api/locations/code/LOC-ENG-302` API request, and locks the room card into the submission form.

---

### Q5: How did you test the system?
**Answer:**  
We built an automated integration test suite in `backend/test-api.js` covering 8 critical end-to-end paths:
1. API Health Check (`GET /api/health`)
2. Student Authentication (`POST /api/auth/login`)
3. Admin Authentication & Role Claim (`POST /api/auth/login`)
4. Public Campus Directory Retrieval (`GET /api/locations`)
5. QR Code Deep-link Lookup (`GET /api/locations/code/:id`)
6. Student Issue Ticket Creation (`POST /api/complaints`)
7. Admin Status Transition & Remarks Update (`PATCH /api/complaints/:id/status`)
8. Dashboard Aggregation Metrics (`GET /api/complaints/stats`)

All 8 tests pass with a 100% success rate.

---

### Q6: What are the planned future extensions?
**Answer:**  
1. **Photo Uploads:** Direct camera capture upload to AWS S3 / Cloudinary to attach photos of physical damage.
2. **Technician Mobile App:** Push notifications alerting campus electricians and carpenters on their phones.
3. **SLA Automation:** Escalation flags if high-priority safety hazards remain in `Pending` status after 24 hours.
