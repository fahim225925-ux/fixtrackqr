const User = require('../models/User');
const Location = require('../models/Location');
const Complaint = require('../models/Complaint');

const seedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Already populated
    }

    console.log('🌱 Database is empty. Seeding initial demo campus data...');

    // 1. Create Default Users
    const adminUser = await User.create({
      name: 'Campus Facilities Admin',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Estate & Campus Maintenance',
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@campus.edu',
      password: 'student123',
      role: 'student',
      studentId: 'CS-2024-042',
      department: 'Computer Science & Engineering',
    });

    // 2. Create Campus Room Locations with QR Identifiers
    const locations = await Location.create([
      {
        building: 'Science Block',
        floor: '1st Floor',
        roomNumber: 'LH 101',
        qrCodeId: 'LOC-SCI-101',
        description: 'Large Physics Lecture Hall with dual projectors',
      },
      {
        building: 'Engineering Block',
        floor: '3rd Floor',
        roomNumber: 'Lab 302',
        qrCodeId: 'LOC-ENG-302',
        description: 'Advanced Computer Networks & Database Laboratory',
      },
      {
        building: 'Main Academic Wing',
        floor: 'Ground Floor',
        roomNumber: 'Seminar Hall A',
        qrCodeId: 'LOC-MAIN-SEM-A',
        description: 'Auditorium style hall for guest lectures and conferences',
      },
      {
        building: 'Central Library',
        floor: '2nd Floor',
        roomNumber: 'Study Room 2',
        qrCodeId: 'LOC-LIB-SR2',
        description: 'Silent reading & group research room',
      },
      {
        building: 'Tech Complex',
        floor: '1st Floor',
        roomNumber: 'Robotics Lab 104',
        qrCodeId: 'LOC-TECH-104',
        description: 'Hardware prototyping and embedded systems workspace',
      },
    ]);

    // 3. Create Sample Complaints
    await Complaint.create([
      {
        title: 'Projector turns off automatically after 10 minutes',
        description: 'The ceiling projector in LH 101 overheats or has a faulty cable. Video cuts out during lectures.',
        category: 'Projector/AV',
        priority: 'High',
        location: locations[0]._id,
        submittedBy: studentUser._id,
        status: 'In Progress',
        adminRemarks: 'AV technician scheduled to replace HDMI splitter on Monday morning.',
      },
      {
        title: 'Broken desk armrest in row 3',
        description: 'Third row desk has sharp broken plastic on the armrest, causing safety issue.',
        category: 'Furniture',
        priority: 'Medium',
        location: locations[0]._id,
        submittedBy: studentUser._id,
        status: 'Pending',
      },
      {
        title: 'Ethernet port #14 loose / no connectivity',
        description: 'Workstation 14 does not connect to the campus intranet. Cable jack is loose.',
        category: 'Wi-Fi/Network',
        priority: 'Medium',
        location: locations[1]._id,
        submittedBy: studentUser._id,
        status: 'Resolved',
        adminRemarks: 'Crimped new RJ-45 connector and tested throughput: 1 Gbps verified.',
        resolvedAt: new Date(Date.now() - 24 * 3600 * 1000),
      },
      {
        title: 'Ceiling fan making loud grinding noise',
        description: 'Middle fan squeaks loudly when set above speed 2, distracting students.',
        category: 'Electrical',
        priority: 'Low',
        location: locations[3]._id,
        submittedBy: studentUser._id,
        status: 'Pending',
      },
    ]);

    console.log('✅ Demo seed completed!');
    console.log('   Admin login: admin@campus.edu / admin123');
    console.log('   Student login: student@campus.edu / student123');
  } catch (error) {
    console.error('❌ Error during auto-seeding:', error.message);
  }
};

module.exports = seedIfEmpty;
