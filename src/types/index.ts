export type UserRole = 'admin' | 'staff' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Programme {
  id: string;
  accessCode?: string;
  department: string;
  duration: number;
  totalSemesters: number;
  status: 'active' | 'inactive';
}

export interface AcademicSession {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface Semester {
  id: string;
  number: number;
  name: string;
  programmeId: string;
  sessionId: string;
  status: 'open' | 'closed' | 'results_published';
}

export interface AssessmentComponent {
  name: string;
  maxMarks: number;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  credits: number;
  semesterNumber: number;
  programmeId: string;
  components: AssessmentComponent[];
  passMark: number;
}

export interface Student {
  id: string;
  studentId: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  programmeId: string;
  currentSemester: number;
  sessionId: string;
  status: 'active' | 'inactive' | 'graduated';
  enrolledAt: string;
}

export interface MarksEntry {
  id: string;
  studentId: string;
  subjectId: string;
  semesterId: string;
  sessionId: string;
  components: Record<string, number>;
  totalMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  status: 'pass' | 'fail';
  enteredBy: string;
  enteredAt: string;
  updatedAt: string;
}

export interface GradeRule {
  grade: string;
  minMarks: number;
  maxMarks: number;
  gradePoint: number;
  passStatus: 'pass' | 'fail';
}

export interface SemesterResult {
  id: string;
  studentId: string;
  semesterId: string;
  sessionId: string;
  gpa: number;
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  overallStatus: 'pass' | 'fail';
  publicationStatus: 'draft' | 'approved' | 'published';
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  createdAt: string;
  readAt?: string;
  replyToId?: string;
}

export interface AppState {
  currentUser: User | null;
  currentPage: string;
  users: User[];
  programmes: Programme[];
  sessions: AcademicSession[];
  semesters: Semester[];
  subjects: Subject[];
  students: Student[];
  marksEntries: MarksEntry[];
  semesterResults: SemesterResult[];
  gradeRules: GradeRule[];
  auditLogs: AuditLog[];
}
