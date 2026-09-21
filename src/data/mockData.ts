/* Legacy demo fixtures retained for reference. Runtime data now comes from the Express/SQLite API.
import {
  User, Programme, AcademicSession, Semester,
  Subject, Student, MarksEntry, SemesterResult, AuditLog,
} from '../types';
import { DEFAULT_GRADE_RULES } from '../utils/calculations';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Dr. Joseph T. Nyuma',
    email: 'admin@bluecrest.edu.lr',
    password: 'Admin@2024',
    role: 'admin',
    permissions: ['all'],
    status: 'active',
    createdAt: '2024-08-01T08:00:00Z',
  },
  {
    id: 'u2',
    name: 'Mr. Emmanuel K. Kollie',
    email: 'ekollie@bluecrest.edu.lr',
    password: 'Staff@2024',
    role: 'staff',
    permissions: ['marks_entry', 'view_students', 'reports'],
    status: 'active',
    createdAt: '2024-08-10T09:00:00Z',
  },
  {
    id: 'u3',
    name: 'Ms. Abigail M. Saye',
    email: 'amsaye@bluecrest.edu.lr',
    password: 'Staff@2024',
    role: 'staff',
    permissions: ['marks_entry', 'view_students', 'reports'],
    status: 'active',
    createdAt: '2024-08-10T09:30:00Z',
  },
];

export const INITIAL_PROGRAMMES: Programme[] = [
  {
    id: 'p1',
    name: 'Bachelor of Science in Computer Science',
    department: 'School of Science & Technology',
    duration: 4,
    totalSemesters: 8,
    status: 'active',
  },
  {
    id: 'p2',
    name: 'Bachelor of Business Administration',
    department: 'School of Business & Management',
    duration: 4,
    totalSemesters: 8,
    status: 'active',
  },
  {
    id: 'p3',
    name: 'Bachelor of Science in Information Technology',
    department: 'School of Science & Technology',
    duration: 4,
    totalSemesters: 8,
    status: 'active',
  },
];

export const INITIAL_SESSIONS: AcademicSession[] = [
  { id: 's1', name: '2023–2024', startYear: 2023, endYear: 2024, status: 'completed' },
  { id: 's2', name: '2024–2025', startYear: 2024, endYear: 2025, status: 'active' },
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem1', number: 1, name: 'Semester 1', programmeId: 'p1', sessionId: 's2', status: 'results_published' },
  { id: 'sem2', number: 2, name: 'Semester 2', programmeId: 'p1', sessionId: 's2', status: 'closed' },
  { id: 'sem3', number: 1, name: 'Semester 1', programmeId: 'p2', sessionId: 's2', status: 'open' },
  { id: 'sem4', number: 3, name: 'Semester 3', programmeId: 'p1', sessionId: 's2', status: 'open' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // BSc CS Semester 1
  {
    id: 'sub1',
    code: 'CS101',
    title: 'Introduction to Computer Science',
    credits: 3,
    semesterNumber: 1,
    programmeId: 'p1',
    components: [
      { name: 'Internal', maxMarks: 30 },
      { name: 'External', maxMarks: 70 },
    ],
    passMark: 50,
  },
  {
    id: 'sub2',
    code: 'CS102',
    title: 'Mathematics for Computing',
    credits: 3,
    semesterNumber: 1,
    programmeId: 'p1',
    components: [
      { name: 'Internal', maxMarks: 30 },
      { name: 'External', maxMarks: 70 },
    ],
    passMark: 50,
  },
  {
    id: 'sub3',
    code: 'CS103',
    title: 'Programming Fundamentals',
    credits: 4,
    semesterNumber: 1,
    programmeId: 'p1',
    components: [
      { name: 'Internal', maxMarks: 30 },
      { name: 'Practical', maxMarks: 20 },
      { name: 'External', maxMarks: 50 },
    ],
    passMark: 50,
  },
  {
    id: 'sub4',
    code: 'GE101',
    title: 'English Communication',
    credits: 2,
    semesterNumber: 1,
    programmeId: 'p1',
    components: [
      { name: 'Internal', maxMarks: 40 },
      { name: 'External', maxMarks: 60 },
    ],
    passMark: 50,
  },
  // BSc CS Semester 2
  {
    id: 'sub5',
    code: 'CS201',
    title: 'Data Structures & Algorithms',
    credits: 4,
    semesterNumber: 2,
    programmeId: 'p1',
    components: [
      { name: 'Internal', maxMarks: 30 },
      { name: 'External', maxMarks: 70 },
    ],
    passMark: 50,
  },
  {
    id: 'sub6',
    code: 'CS202',
    title: 'Discrete Mathematics',
    credits: 3,
    semesterNumber: 2,
    programmeId: 'p1',
    components: [
      { name: 'Internal', maxMarks: 30 },
      { name: 'External', maxMarks: 70 },
    ],
    passMark: 50,
  },
  // BBA Semester 1
  {
    id: 'sub7',
    code: 'BA101',
    title: 'Principles of Management',
    credits: 3,
    semesterNumber: 1,
    programmeId: 'p2',
    components: [
      { name: 'Internal', maxMarks: 30 },
      { name: 'External', maxMarks: 70 },
    ],
    passMark: 50,
  },
  {
    id: 'sub8',
    code: 'BA102',
    title: 'Business Communication',
    credits: 2,
    semesterNumber: 1,
    programmeId: 'p2',
    components: [
      { name: 'Internal', maxMarks: 40 },
      { name: 'External', maxMarks: 60 },
    ],
    passMark: 50,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'st1', studentId: 'BCU/CS/24/001', rollNumber: 'CS-2401', name: 'Marcus Tamba Kollie',    email: 'mtkollie@student.bluecrest.edu.lr',  phone: '+231 770 123 456', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st2', studentId: 'BCU/CS/24/002', rollNumber: 'CS-2402', name: 'Grace Pewee Flomo',      email: 'gpflomo@student.bluecrest.edu.lr',   phone: '+231 880 234 567', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st3', studentId: 'BCU/CS/24/003', rollNumber: 'CS-2403', name: 'James Varney Saye',      email: 'jvsaye@student.bluecrest.edu.lr',    phone: '+231 776 345 678', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st4', studentId: 'BCU/CS/24/004', rollNumber: 'CS-2404', name: 'Fatumata Kamara',        email: 'fkamara@student.bluecrest.edu.lr',   phone: '+231 886 456 789', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st5', studentId: 'BCU/CS/24/005', rollNumber: 'CS-2405', name: 'David Sumo Jr.',         email: 'dsumo@student.bluecrest.edu.lr',     phone: '+231 770 567 890', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st6', studentId: 'BCU/CS/24/006', rollNumber: 'CS-2406', name: 'Victoria Nyenabo',       email: 'vnyenabo@student.bluecrest.edu.lr',  phone: '+231 886 678 901', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st7', studentId: 'BCU/CS/24/007', rollNumber: 'CS-2407', name: 'Prince Kofi Mensah',     email: 'pkmensah@student.bluecrest.edu.lr',  phone: '+231 776 789 012', programmeId: 'p1', currentSemester: 2, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st8', studentId: 'BCU/BA/24/001', rollNumber: 'BA-2401', name: 'Josephine Kpehe Dolo',   email: 'jkdolo@student.bluecrest.edu.lr',    phone: '+231 880 890 123', programmeId: 'p2', currentSemester: 1, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
  { id: 'st9', studentId: 'BCU/BA/24/002', rollNumber: 'BA-2402', name: 'Abraham Tokpa Cooper',   email: 'atcooper@student.bluecrest.edu.lr',  phone: '+231 770 901 234', programmeId: 'p2', currentSemester: 1, sessionId: 's2', status: 'active', enrolledAt: '2024-09-01' },
];

// Pre-filled marks for BSc CS Semester 1 (sem1) — all 7 CS students, subjects sub1-sub4
const mkEntry = (
  id: string, studentId: string, subjectId: string,
  components: Record<string, number>,
  total: number, percentage: number,
  grade: string, gradePoint: number, status: 'pass' | 'fail'
): MarksEntry => ({
  id, studentId, subjectId,
  semesterId: 'sem1', sessionId: 's2',
  components, totalMarks: total, percentage,
  grade, gradePoint, status,
  enteredBy: 'u2', enteredAt: '2025-02-10T10:00:00Z', updatedAt: '2025-02-10T10:00:00Z',
});

export const INITIAL_MARKS: MarksEntry[] = [
  // Marcus — good student
  mkEntry('m1',  'st1','sub1',{Internal:26,External:61},87, 87,'A', 4.0,'pass'),
  mkEntry('m2',  'st1','sub2',{Internal:24,External:55},79, 79,'B+',3.5,'pass'),
  mkEntry('m3',  'st1','sub3',{Internal:25,External:12,Practical:50},87, 87,'A', 4.0,'pass'),
  mkEntry('m4',  'st1','sub4',{Internal:33,External:52},85, 85,'A', 4.0,'pass'),
  // Grace — above average
  mkEntry('m5',  'st2','sub1',{Internal:22,External:50},72, 72,'B', 3.0,'pass'),
  mkEntry('m6',  'st2','sub2',{Internal:20,External:52},72, 72,'B', 3.0,'pass'),
  mkEntry('m7',  'st2','sub3',{Internal:22,External:10,Practical:44},76, 76,'B+',3.5,'pass'),
  mkEntry('m8',  'st2','sub4',{Internal:30,External:48},78, 78,'B+',3.5,'pass'),
  // James — average
  mkEntry('m9',  'st3','sub1',{Internal:18,External:45},63, 63,'C', 2.0,'pass'),
  mkEntry('m10', 'st3','sub2',{Internal:17,External:46},63, 63,'C', 2.0,'pass'),
  mkEntry('m11', 'st3','sub3',{Internal:18,External:9,Practical:40},67, 67,'C+',2.5,'pass'),
  mkEntry('m12', 'st3','sub4',{Internal:25,External:40},65, 65,'C+',2.5,'pass'),
  // Fatumata — strong
  mkEntry('m13', 'st4','sub1',{Internal:28,External:65},93, 93,'A', 4.0,'pass'),
  mkEntry('m14', 'st4','sub2',{Internal:25,External:58},83, 83,'A', 4.0,'pass'),
  mkEntry('m15', 'st4','sub3',{Internal:27,External:14,Practical:48},89, 89,'A', 4.0,'pass'),
  mkEntry('m16', 'st4','sub4',{Internal:36,External:55},91, 91,'A', 4.0,'pass'),
  // David — borderline / one fail
  mkEntry('m17', 'st5','sub1',{Internal:15,External:38},53, 53,'D', 1.0,'pass'),
  mkEntry('m18', 'st5','sub2',{Internal:12,External:30},42, 42,'F', 0.0,'fail'),
  mkEntry('m19', 'st5','sub3',{Internal:14,External:8,Practical:30},52, 52,'D', 1.0,'pass'),
  mkEntry('m20', 'st5','sub4',{Internal:20,External:35},55, 55,'D+',1.5,'pass'),
  // Victoria — above average
  mkEntry('m21', 'st6','sub1',{Internal:23,External:52},75, 75,'B+',3.5,'pass'),
  mkEntry('m22', 'st6','sub2',{Internal:22,External:50},72, 72,'B', 3.0,'pass'),
  mkEntry('m23', 'st6','sub3',{Internal:24,External:11,Practical:43},78, 78,'B+',3.5,'pass'),
  mkEntry('m24', 'st6','sub4',{Internal:28,External:46},74, 74,'B', 3.0,'pass'),
  // Prince — average
  mkEntry('m25', 'st7','sub1',{Internal:19,External:48},67, 67,'C+',2.5,'pass'),
  mkEntry('m26', 'st7','sub2',{Internal:18,External:47},65, 65,'C+',2.5,'pass'),
  mkEntry('m27', 'st7','sub3',{Internal:20,External:10,Practical:38},68, 68,'C+',2.5,'pass'),
  mkEntry('m28', 'st7','sub4',{Internal:24,External:42},66, 66,'C+',2.5,'pass'),
];

// Pre-computed GPA for Sem 1 BSc CS (sem1)
// Subjects: sub1=3cr, sub2=3cr, sub3=4cr, sub4=2cr → total 12 credits
const mkResult = (
  id: string, studentId: string,
  gpa: number, cgpa: number, totalCredits: number, earnedCredits: number,
  overallStatus: 'pass'|'fail',
  publicationStatus: 'draft'|'approved'|'published'
): SemesterResult => ({
  id, studentId,
  semesterId: 'sem1', sessionId: 's2',
  gpa, cgpa, totalCredits, earnedCredits, overallStatus,
  publicationStatus,
  publishedAt: publicationStatus === 'published' ? '2025-03-01T08:00:00Z' : undefined,
  approvedBy: publicationStatus !== 'draft' ? 'u1' : undefined,
  approvedAt: publicationStatus !== 'draft' ? '2025-02-28T16:00:00Z' : undefined,
});

export const INITIAL_RESULTS: SemesterResult[] = [
  // Marcus:  (3×4+3×3.5+4×4+2×4)/12 = (12+10.5+16+8)/12 = 46.5/12 = 3.88
  mkResult('r1','st1', 3.88, 3.88, 12, 12, 'pass', 'published'),
  // Grace:   (3×3+3×3+4×3.5+2×3.5)/12 = (9+9+14+7)/12 = 39/12 = 3.25
  mkResult('r2','st2', 3.25, 3.25, 12, 12, 'pass', 'published'),
  // James:   (3×2+3×2+4×2.5+2×2.5)/12 = (6+6+10+5)/12 = 27/12 = 2.25
  mkResult('r3','st3', 2.25, 2.25, 12, 12, 'pass', 'published'),
  // Fatumata:(3×4+3×4+4×4+2×4)/12 = 48/12 = 4.00
  mkResult('r4','st4', 4.00, 4.00, 12, 12, 'pass', 'published'),
  // David:   (3×1+3×0+4×1+2×1.5)/12 = (3+0+4+3)/12 = 10/12 = 0.83 — fail (sub2 F)
  mkResult('r5','st5', 0.83, 0.83, 12, 9,  'fail', 'published'),
  // Victoria:(3×3.5+3×3+4×3.5+2×3)/12 = (10.5+9+14+6)/12 = 39.5/12 = 3.29
  mkResult('r6','st6', 3.29, 3.29, 12, 12, 'pass', 'published'),
  // Prince:  (3×2.5+3×2.5+4×2.5+2×2.5)/12 = (7.5+7.5+10+5)/12 = 30/12 = 2.50
  mkResult('r7','st7', 2.50, 2.50, 12, 12, 'pass', 'published'),
];

export const INITIAL_AUDIT: AuditLog[] = [
  { id: 'a1', userId: 'u1', userName: 'Dr. Joseph T. Nyuma', action: 'PUBLISH_RESULT', entity: 'SemesterResult', details: 'Published Semester 1 results for BSc CS 2024-2025', timestamp: '2025-03-01T08:00:00Z' },
  { id: 'a2', userId: 'u1', userName: 'Dr. Joseph T. Nyuma', action: 'APPROVE_RESULT',  entity: 'SemesterResult', details: 'Approved Semester 1 results for BSc CS 2024-2025', timestamp: '2025-02-28T16:00:00Z' },
  { id: 'a3', userId: 'u2', userName: 'Mr. Emmanuel K. Kollie', action: 'MARKS_ENTRY', entity: 'MarksEntry', details: 'Entered marks for BSc CS Semester 1 — 7 students × 4 subjects', timestamp: '2025-02-10T10:00:00Z' },
  { id: 'a4', userId: 'u1', userName: 'Dr. Joseph T. Nyuma', action: 'CREATE_STUDENT', entity: 'Student', details: 'Registered 9 new students for 2024-2025 session', timestamp: '2024-09-05T09:00:00Z' },
];

export const INITIAL_GRADE_RULES = DEFAULT_GRADE_RULES;
*/
