/**
 * FixTrack QR - In-Memory / File Fallback Storage Engine
 * Used seamlessly when a local or cloud MongoDB server is not running,
 * guaranteeing zero-setup execution for students and academic evaluators.
 */

const bcrypt = require('bcryptjs');

class FallbackDataStore {
  constructor() {
    this.users = [];
    this.locations = [];
    this.complaints = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // Seed default admin and student
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const studentPasswordHash = await bcrypt.hash('student123', salt);

    const admin = {
      _id: 'usr_admin_001',
      name: 'Campus Facilities Admin',
      email: 'admin@campus.edu',
      password: adminPasswordHash,
      role: 'admin',
      department: 'Estate & Campus Maintenance',
      createdAt: new Date().toISOString(),
    };

    const student = {
      _id: 'usr_student_001',
      name: 'Alex Johnson',
      email: 'student@campus.edu',
      password: studentPasswordHash,
      role: 'student',
      studentId: 'CS-2024-042',
      department: 'Computer Science & Engineering',
      createdAt: new Date().toISOString(),
    };

    this.users.push(admin, student);

    // Seed default locations
    const loc1 = {
      _id: 'loc_001',
      building: 'Science Block',
      floor: '1st Floor',
      roomNumber: 'LH 101',
      qrCodeId: 'LOC-SCI-101',
      description: 'Large Physics Lecture Hall with dual projectors',
      createdAt: new Date().toISOString(),
    };
    const loc2 = {
      _id: 'loc_002',
      building: 'Engineering Block',
      floor: '3rd Floor',
      roomNumber: 'Lab 302',
      qrCodeId: 'LOC-ENG-302',
      description: 'Advanced Computer Networks & Database Laboratory',
      createdAt: new Date().toISOString(),
    };
    const loc3 = {
      _id: 'loc_003',
      building: 'Main Academic Wing',
      floor: 'Ground Floor',
      roomNumber: 'Seminar Hall A',
      qrCodeId: 'LOC-MAIN-SEM-A',
      description: 'Auditorium style hall for guest lectures and conferences',
      createdAt: new Date().toISOString(),
    };
    const loc4 = {
      _id: 'loc_004',
      building: 'Central Library',
      floor: '2nd Floor',
      roomNumber: 'Study Room 2',
      qrCodeId: 'LOC-LIB-SR2',
      description: 'Silent reading & group research room',
      createdAt: new Date().toISOString(),
    };
    const loc5 = {
      _id: 'loc_005',
      building: 'Tech Complex',
      floor: '1st Floor',
      roomNumber: 'Robotics Lab 104',
      qrCodeId: 'LOC-TECH-104',
      description: 'Hardware prototyping and embedded systems workspace',
      createdAt: new Date().toISOString(),
    };

    this.locations.push(loc1, loc2, loc3, loc4, loc5);

    // Seed sample complaints
    this.complaints.push(
      {
        _id: 'cmp_001',
        title: 'Projector turns off automatically after 10 minutes',
        description: 'The ceiling projector in LH 101 overheats or has a faulty cable. Video cuts out during lectures.',
        category: 'Projector/AV',
        priority: 'High',
        location: loc1,
        submittedBy: { _id: student._id, name: student.name, email: student.email, studentId: student.studentId },
        status: 'In Progress',
        adminRemarks: 'AV technician scheduled to replace HDMI splitter on Monday morning.',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'cmp_002',
        title: 'Broken desk armrest in row 3',
        description: 'Third row desk has sharp broken plastic on the armrest, causing safety issue.',
        category: 'Furniture',
        priority: 'Medium',
        location: loc1,
        submittedBy: { _id: student._id, name: student.name, email: student.email, studentId: student.studentId },
        status: 'Pending',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'cmp_003',
        title: 'Ethernet port #14 loose / no connectivity',
        description: 'Workstation 14 does not connect to the campus intranet. Cable jack is loose.',
        category: 'Wi-Fi/Network',
        priority: 'Medium',
        location: loc2,
        submittedBy: { _id: student._id, name: student.name, email: student.email, studentId: student.studentId },
        status: 'Resolved',
        adminRemarks: 'Crimped new RJ-45 connector and tested throughput: 1 Gbps verified.',
        resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      }
    );

    this.initialized = true;
  }
}

const store = new FallbackDataStore();
module.exports = store;
