# FixTrack QR — Final Submission Package & Checklist

### 📋 Student & Project Details
- **Project Title:** FixTrack QR — Smart Campus Maintenance Reporting System
- **Stack:** MongoDB, Express.js, React.js, Node.js (MERN)
- **Student Name:** Fahim
- **Email:** fahim225925@sahrdaya.ac.in
- **Repository Name:** `fixtrackqr`
- **GitHub Target:** `https://github.com/fahim225925-ux/fixtrackqr.git`

---

### 📦 Files & Documentation Index
1. **Source Code:**
   - Backend API: `backend/src/` (Express, Mongoose, JWT, Controllers, Routes)
   - Frontend UI: `frontend/src/` (React 18, Vite, Pages, Context, Components)
2. **Internship Report (Full 9 Chapters):**
   - `INTERNSHIP_REPORT.md` (Matches the provided Word document structure)
3. **Viva / Oral Defense Guide:**
   - `VIVA_PRESENTATION_GUIDE.md` (Anticipated questions & answers)
4. **Integration Test Suite:**
   - `backend/test-api.js` (8/8 automated tests passing)
5. **Project README & Execution Guide:**
   - `README.md` (Setup, architecture, credentials, screenshots guide)

---

### 🧪 Automated Test Verification Output
```
🧪 Starting FixTrack QR Integration Smoke Tests...

  ✅ PASS: Health check endpoint returns online
  ✅ PASS: Student login with default seed credentials
  ✅ PASS: Admin login with default seed credentials
  ✅ PASS: Public GET /locations returns campus rooms
  ✅ PASS: Lookup location by QR code (LOC-SCI-101)
  ✅ PASS: Student submits a new maintenance complaint
  ✅ PASS: Admin updates complaint status and adds remarks
  ✅ PASS: Admin fetches stats summary with category aggregations

📊 Test Summary: 8 passed, 0 failed.
```

---

### 🚀 Running the Project
```bash
# 1. Start Backend Server (runs on http://localhost:5000)
cd backend
npm start

# 2. Start Frontend App (runs on http://localhost:5173)
cd frontend
npm run dev

# 3. Run Automated Tests
cd backend
npm test
```
