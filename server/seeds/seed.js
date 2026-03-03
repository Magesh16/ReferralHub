require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const ReferralPost = require('../src/models/ReferralPost');
const Appointment = require('../src/models/Appointment');
const Notification = require('../src/models/Notification');
const ResumeMatch = require('../src/models/ResumeMatch');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      ReferralPost.deleteMany({}),
      Appointment.deleteMany({}),
      Notification.deleteMany({}),
      ResumeMatch.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Employees ──────────────────────────────────────────────────────────
    const employees = await User.create([
      { name: 'Magi Kumar',   email: 'magi@example.com',  password: 'password123', role: 'employee', company: 'Google',     jobTitle: 'Senior SDE',          department: 'Engineering', yearsAtCompany: 4, isVerified: true, avgRating: 4.8, totalReferrals: 12, successRate: 85 },
      { name: 'Arjun Reddy',  email: 'arjun@example.com', password: 'password123', role: 'employee', company: 'Microsoft',  jobTitle: 'Product Manager',      department: 'Product',     yearsAtCompany: 3, isVerified: true, avgRating: 4.5, totalReferrals:  8, successRate: 75 },
      { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'employee', company: 'Amazon',     jobTitle: 'SDE-2',                department: 'Engineering', yearsAtCompany: 2, isVerified: true, avgRating: 4.6, totalReferrals: 15, successRate: 80 },
      { name: 'Ravi Patel',   email: 'ravi@example.com',  password: 'password123', role: 'employee', company: 'Flipkart',   jobTitle: 'Staff Engineer',       department: 'Backend',     yearsAtCompany: 5, isVerified: true, avgRating: 4.9, totalReferrals: 20, successRate: 90 },
      { name: 'Deepa Nair',   email: 'deepa@example.com', password: 'password123', role: 'employee', company: 'Razorpay',   jobTitle: 'Engineering Manager',  department: 'Payments',    yearsAtCompany: 3, isVerified: true, avgRating: 4.7, totalReferrals: 10, successRate: 82 },
      { name: 'Karan Mehta',  email: 'karan@example.com', password: 'password123', role: 'employee', company: 'Swiggy',     jobTitle: 'DevOps Engineer',      department: 'Infra',       yearsAtCompany: 2, isVerified: true, avgRating: 4.4, totalReferrals:  6, successRate: 72 },
      { name: 'Aisha Verma',  email: 'aisha@example.com', password: 'password123', role: 'employee', company: 'PhonePe',    jobTitle: 'Data Scientist',       department: 'Analytics',   yearsAtCompany: 3, isVerified: true, avgRating: 4.6, totalReferrals:  9, successRate: 78 },
    ]);
    console.log(`👨‍💼 Created ${employees.length} employees`);

    // ── Seekers ────────────────────────────────────────────────────────────
    const seekers = await User.create([
      {
        name: 'Sana Khan',   email: 'sana@example.com',   password: 'password123', role: 'seeker',
        skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'MongoDB', 'CSS'],
        experienceYears: 2, currentRole: 'Frontend Developer',
        // Provide synthetic resumeText so AI matching works regardless of PDF upload
        resumeText: 'Sana Khan — Frontend Developer with 2 years of experience. Expert in React.js, TypeScript, Node.js, Express.js, and MongoDB. Built full-stack MERN applications. Strong in CSS, Tailwind, REST API design, and Git. Seeking MERN stack / full-stack engineer roles.',
      },
      {
        name: 'Vikram Singh', email: 'vikram@example.com', password: 'password123', role: 'seeker',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Kafka'],
        experienceYears: 3, currentRole: 'Backend Developer',
        resumeText: 'Vikram Singh — Backend Engineer with 3 years of Python and Django experience. Proficient in PostgreSQL, Docker, AWS (EC2, S3, Lambda), Kafka, and REST APIs. Experience with microservices architecture, CI/CD pipelines, and cloud deployments.',
      },
      {
        name: 'Ananya Gupta', email: 'ananya@example.com', password: 'password123', role: 'seeker',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'PostgreSQL'],
        experienceYears: 5, currentRole: 'Senior Java Developer',
        resumeText: 'Ananya Gupta — Senior Java Developer with 5 years of experience. Deep expertise in Java, Spring Boot, microservices architecture, Kubernetes, and PostgreSQL. Led distributed systems design at scale. Familiar with AWS, Docker, and CI/CD.',
      },
    ]);
    console.log(`👨‍🎓 Created ${seekers.length} seekers`);

    // ── Referral Posts — diverse, all with techCategory ────────────────────
    const now = new Date();
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const referralPosts = await ReferralPost.create([
      // MERN
      {
        employee: employees[0]._id, company: 'Google', role: 'Full Stack Engineer (MERN)',
        department: 'Cloud', experienceMin: 2, experienceMax: 5,
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
        description: 'Join Google Cloud UI team. Build high-scale React dashboards backed by Node.js microservices. MongoDB and TypeScript required.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'MERN',
        predictedPrice: 3000, finalPrice: 3000, maxSlots: 3, bookedSlots: 1,
        availableFrom: now, availableTo: in30, totalViews: 210, totalBookings: 1, status: 'active',
      },
      {
        employee: employees[4]._id, company: 'Razorpay', role: 'Frontend Engineer',
        department: 'Dashboard', experienceMin: 1, experienceMax: 4,
        skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'JavaScript'],
        description: 'Razorpay Dashboard team — build merchant-facing React/Next.js UIs for payments. Strong TypeScript and CSS skills needed.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'MERN',
        predictedPrice: 1500, finalPrice: 1500, maxSlots: 3, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 130, totalBookings: 0, status: 'active',
      },
      {
        employee: employees[3]._id, company: 'Flipkart', role: 'MERN Stack Developer',
        department: 'Seller Portal', experienceMin: 1, experienceMax: 3,
        skills: ['Node.js', 'React', 'MongoDB', 'Redis', 'REST APIs'],
        description: 'Seller Portal at Flipkart uses MERN stack. Need developer with solid Node.js backend and React frontend experience.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'MERN',
        predictedPrice: 1800, finalPrice: 1800, maxSlots: 4, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 95, totalBookings: 0, status: 'active',
      },

      // Java
      {
        employee: employees[2]._id, company: 'Amazon', role: 'SDE-2 (Java)',
        department: 'Retail', experienceMin: 3, experienceMax: 6,
        skills: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'System Design'],
        description: 'Amazon Retail SDE-2. Must be strong in Java, Spring Boot, AWS services, and distributed system design.',
        location: 'Chennai', jobType: 'full-time', techCategory: 'Java',
        predictedPrice: 2800, finalPrice: 2800, maxSlots: 5, bookedSlots: 2,
        availableFrom: now, availableTo: in30, totalViews: 280, totalBookings: 2, status: 'active',
      },
      {
        employee: employees[1]._id, company: 'Microsoft', role: 'Senior Java Engineer',
        department: 'Azure', experienceMin: 4, experienceMax: 8,
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Kubernetes'],
        description: 'Azure Microservices team building distributed cloud-native services. Deep Java + Spring Boot + Kubernetes experience required.',
        location: 'Hyderabad', jobType: 'full-time', techCategory: 'Java',
        predictedPrice: 3500, finalPrice: 3500, maxSlots: 2, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 155, totalBookings: 0, status: 'active',
      },

      // Backend (Python)
      {
        employee: employees[3]._id, company: 'Flipkart', role: 'Senior Backend Engineer (Python)',
        department: 'Supply Chain', experienceMin: 4, experienceMax: 8,
        skills: ['Python', 'Django', 'Kafka', 'PostgreSQL', 'Docker'],
        description: 'Supply chain team at Flipkart. Handle >100k QPS. Python/Django backend, Kafka for streaming, PostgreSQL at scale.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'Backend',
        predictedPrice: 2000, finalPrice: 2000, maxSlots: 4, bookedSlots: 1,
        availableFrom: now, availableTo: in30, totalViews: 190, totalBookings: 1, status: 'active',
      },
      {
        employee: employees[4]._id, company: 'Razorpay', role: 'Backend Engineer (Golang)',
        department: 'Payments Core', experienceMin: 2, experienceMax: 5,
        skills: ['Go', 'Golang', 'gRPC', 'PostgreSQL', 'Redis'],
        description: 'Razorpay Payments Core team. Build high-performance Go services processing millions of transactions daily.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'Backend',
        predictedPrice: 2200, finalPrice: 2200, maxSlots: 3, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 110, totalBookings: 0, status: 'active',
      },

      // DevOps
      {
        employee: employees[5]._id, company: 'Swiggy', role: 'DevOps Engineer',
        department: 'Infrastructure', experienceMin: 2, experienceMax: 5,
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
        description: 'Swiggy Infrastructure team — own K8s cluster operations, CI/CD pipelines, and cloud cost optimization on AWS.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'DevOps',
        predictedPrice: 1800, finalPrice: 1800, maxSlots: 3, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 88, totalBookings: 0, status: 'active',
      },
      {
        employee: employees[2]._id, company: 'Amazon', role: 'Cloud Infrastructure Engineer',
        department: 'AWS Infra', experienceMin: 3, experienceMax: 7,
        skills: ['AWS', 'Terraform', 'Ansible', 'Jenkins', 'Docker', 'Kubernetes'],
        description: 'AWS Infra team managing global cloud infrastructure. Terraform, Ansible, and deep AWS experience required.',
        location: 'Pune', jobType: 'full-time', techCategory: 'DevOps',
        predictedPrice: 2600, finalPrice: 2600, maxSlots: 2, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 130, totalBookings: 0, status: 'active',
      },

      // Data
      {
        employee: employees[6]._id, company: 'PhonePe', role: 'Data Scientist',
        department: 'Risk & Analytics', experienceMin: 2, experienceMax: 5,
        skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'TensorFlow'],
        description: 'Risk & Analytics team building ML models for fraud detection and transaction risk scoring at PhonePe.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'Data',
        predictedPrice: 2400, finalPrice: 2400, maxSlots: 3, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 160, totalBookings: 0, status: 'active',
      },
      {
        employee: employees[1]._id, company: 'Microsoft', role: 'Data Engineer',
        department: 'Azure Data', experienceMin: 3, experienceMax: 6,
        skills: ['Python', 'Spark', 'SQL', 'Data Science', 'Kafka', 'Airflow'],
        description: 'Azure Data team building large-scale pipelines with Spark and Kafka. Strong SQL and Python data engineering skills needed.',
        location: 'Hyderabad', jobType: 'full-time', techCategory: 'Data',
        predictedPrice: 2900, finalPrice: 2900, maxSlots: 2, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 120, totalBookings: 0, status: 'active',
      },

      // Frontend
      {
        employee: employees[0]._id, company: 'Google', role: 'Frontend Engineer (Angular/TypeScript)',
        department: 'Google Workspace', experienceMin: 2, experienceMax: 5,
        skills: ['Angular', 'TypeScript', 'HTML', 'CSS', 'JavaScript'],
        description: 'Google Workspace team. Build document editors and collaboration tools with Angular and TypeScript.',
        location: 'Bangalore', jobType: 'full-time', techCategory: 'Frontend',
        predictedPrice: 3200, finalPrice: 3200, maxSlots: 2, bookedSlots: 0,
        availableFrom: now, availableTo: in30, totalViews: 200, totalBookings: 0, status: 'active',
      },
    ]);

    console.log(`📋 Created ${referralPosts.length} referral posts`);

    // ── Sample Appointments ────────────────────────────────────────────────
    await Appointment.create([
      {
        referralPost: referralPosts[0]._id,  // MERN Google
        seeker: seekers[0]._id,              // Sana (MERN)
        employee: employees[0]._id,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        scheduledTime: '10:00 AM - 10:30 AM', duration: 30,
        resumeUrl: '/uploads/resumes/seed-sana-resume.pdf', coverNote: '2 years of MERN stack experience, passionate about building scalable UIs.',
        status: 'confirmed', amount: 3000,
      },
      {
        referralPost: referralPosts[3]._id,  // Java Amazon
        seeker: seekers[1]._id,              // Vikram (Backend)
        employee: employees[2]._id,
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        scheduledTime: '2:00 PM - 2:30 PM', duration: 30,
        resumeUrl: '/uploads/resumes/seed-vikram-resume.pdf', coverNote: 'Strong in Java and distributed systems. 3 years of backend experience.',
        status: 'pending', amount: 2800,
      },
    ]);

    console.log('📅 Created sample appointments');
    console.log('\n✅ Database seeded successfully!\n');
    console.log('── Login Credentials ──────────────────────');
    console.log('Employees:');
    employees.forEach((e) => console.log(`  ${e.email} / password123  (${e.company})`));
    console.log('Seekers:');
    seekers.forEach((s) => console.log(`  ${s.email} / password123  (skills: ${s.skills.join(', ')})`));
    console.log('\n── Referral Posts by category ─────────────');
    const cats = {};
    referralPosts.forEach(p => { cats[p.techCategory] = (cats[p.techCategory] || 0) + 1; });
    Object.entries(cats).forEach(([c, n]) => console.log(`  ${c}: ${n} posts`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
