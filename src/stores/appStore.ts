import { computed, reactive, readonly } from 'vue'
import {
  type User,
  type Programme,
  type AcademicSession,
  type Semester,
  type Subject,
  type Student,
  type MarksEntry,
  type SemesterResult,
  type GradeRule,
  type AuditLog,
  type Message,
} from '../types'
import { computeCGPA, computeGPA, computeTotal, getGradeRule } from '../utils/calculations'
import { clearApiToken, deleteProgrammeRequest, deleteSemesterRequest, deleteSessionRequest, deleteStudentRequest, deleteSubjectRequest, getEntity, loginRequest, processResultsRequest, saveMarksRequest, saveProgrammeRequest, saveResultRequest, saveSemesterRequest, saveSessionRequest, saveStudentRequest, saveSubjectRequest, saveUserRequest, updateResultStatusRequest, type ApiMark, type ApiUser } from '../services/api'

type MarksEntryInput = Omit<MarksEntry, 'totalMarks' | 'percentage' | 'grade' | 'gradePoint' | 'status'>

type AppState = {
  currentUser: User | null
  currentPage: string
  users: User[]
  programmes: Programme[]
  sessions: AcademicSession[]
  semesters: Semester[]
  subjects: Subject[]
  students: Student[]
  marksEntries: MarksEntry[]
  semesterResults: SemesterResult[]
  gradeRules: GradeRule[]
  auditLogs: AuditLog[]
  messages: Message[]
}

const state = reactive<AppState>({
  currentUser: null,
  currentPage: 'login',
  users: [],
  programmes: [],
  sessions: [],
  semesters: [],
  subjects: [],
  students: [],
  marksEntries: [],
  semesterResults: [],
  gradeRules: [],
  auditLogs: [],
  messages: [],
})

const messagesStorageKey = 'erp-messages'
const localAuditStorageKey = 'erp-local-audit'

function replaceItems<T>(target: T[], updater: T[] | ((items: T[]) => T[])) {
  const nextItems = typeof updater === 'function' ? updater([...target]) : updater
  target.splice(0, target.length, ...nextItems)
}

function persistProgrammes(items: Programme[], previous: Programme[]) {
  const nextIds = new Set(items.map(item => item.id))
  previous.filter(item => !nextIds.has(item.id)).forEach(item => { void deleteProgrammeRequest(item.id).catch(() => undefined) })
  items.forEach(item => { void saveProgrammeRequest({ id: item.id, name: item.name, department: item.department, duration: item.duration, totalSemesters: item.totalSemesters, status: item.status }).catch(() => undefined) })
}

function persistStudents(items: Student[], previous: Student[]) {
  const nextIds = new Set(items.map(item => item.id))
  previous.filter(item => !nextIds.has(item.id)).forEach(item => { void deleteStudentRequest(item.id).catch(() => undefined) })
  items.forEach(item => {
    void saveStudentRequest({ id: item.id, studentId: item.studentId, rollNumber: item.rollNumber, name: item.name, email: item.email, accessCode: item.accessCode, phone: item.phone, programmeId: item.programmeId, currentSemester: item.currentSemester, sessionId: item.sessionId, status: item.status, enrolledAt: item.enrolledAt }).then(response => {
      const saved = response.data as Record<string, unknown>
      if (!saved.student_id || !saved.roll_number) return
      const current = state.students.find(student => student.id === item.id)
      if (!current) return
      current.studentId = String(saved.student_id)
      current.rollNumber = String(saved.roll_number)
      if (saved.access_code) current.accessCode = String(saved.access_code)
    }).catch(() => undefined)
  })
}

function persistSessions(items: AcademicSession[], previous: AcademicSession[]) {
  const nextIds = new Set(items.map(item => item.id)); previous.filter(item => !nextIds.has(item.id)).forEach(item => { void deleteSessionRequest(item.id).catch(() => undefined) })
  items.forEach(item => { void saveSessionRequest({ id: item.id, name: item.name, startYear: item.startYear, endYear: item.endYear, status: item.status }).catch(() => undefined) })
}

function persistSemesters(items: Semester[], previous: Semester[]) {
  const nextIds = new Set(items.map(item => item.id)); previous.filter(item => !nextIds.has(item.id)).forEach(item => { void deleteSemesterRequest(item.id).catch(() => undefined) })
  items.forEach(item => { void saveSemesterRequest({ id: item.id, number: item.number, name: item.name, programmeId: item.programmeId, sessionId: item.sessionId, status: item.status }).catch(() => undefined) })
}

function persistSubjects(items: Subject[], previous: Subject[]) {
  const nextIds = new Set(items.map(item => item.id)); previous.filter(item => !nextIds.has(item.id)).forEach(item => { void deleteSubjectRequest(item.id).catch(() => undefined) })
  items.forEach(item => { void saveSubjectRequest({ id: item.id, code: item.code, title: item.title, credits: item.credits, semesterNumber: item.semesterNumber, programmeId: item.programmeId, components: item.components, passMark: item.passMark }).catch(() => undefined) })
}

function mapUser(user: ApiUser): User {
  return { id: user.id, name: user.name, email: user.email, password: '', role: user.role, permissions: user.permissions ?? (user.permissions_json ? JSON.parse(user.permissions_json) : []), status: user.status, createdAt: user.created_at }
}

function mapMark(mark: ApiMark): MarksEntry {
  return { id: mark.id, studentId: mark.student_id, subjectId: mark.subject_id, semesterId: mark.semester_id, sessionId: mark.session_id, components: JSON.parse(mark.components_json), totalMarks: mark.total_marks, percentage: mark.percentage, grade: mark.grade, gradePoint: mark.grade_point, status: mark.status, enteredBy: mark.entered_by, enteredAt: mark.entered_at, updatedAt: mark.updated_at }
}

export async function hydrateFromApi() {
  const [apiUsers, apiProgrammes, apiSessions, apiSemesters, apiSubjects, apiStudents, apiMarks, apiResults, apiRules, apiAudit] = await Promise.all([
    getEntity<ApiUser>('users'), getEntity<Record<string, any>>('programmes'), getEntity<Record<string, any>>('sessions'), getEntity<Record<string, any>>('semesters'),
    getEntity<Record<string, any>>('subjects'), getEntity<Record<string, any>>('students'), getEntity<ApiMark>('marks'), getEntity<Record<string, any>>('results'),
    getEntity<Record<string, any>>('grade-rules'), getEntity<Record<string, any>>('audit'),
  ])
  replaceItems(state.users, apiUsers.data.map(mapUser))
  replaceItems(state.programmes, apiProgrammes.data.map(item => ({ id: item.id, name: item.name, department: item.department, duration: item.duration, totalSemesters: item.total_semesters, status: item.status })))
  replaceItems(state.sessions, apiSessions.data.map(item => ({ id: item.id, name: item.name, startYear: item.start_year, endYear: item.end_year, status: item.status })))
  replaceItems(state.semesters, apiSemesters.data.map(item => ({ id: item.id, number: item.number, name: item.name, programmeId: item.programme_id, sessionId: item.session_id, status: item.status })))
  replaceItems(state.subjects, apiSubjects.data.map(item => ({ id: item.id, code: item.code, title: item.title, credits: item.credits, semesterNumber: item.semester_number, programmeId: item.programme_id, components: JSON.parse(item.components_json), passMark: item.pass_mark })))
  replaceItems(state.students, apiStudents.data.map(item => ({ id: item.id, studentId: item.student_id, rollNumber: item.roll_number, name: item.name, email: item.email, accessCode: item.access_code, phone: item.phone, programmeId: item.programme_id, currentSemester: item.current_semester, sessionId: item.session_id, status: item.status, enrolledAt: item.enrolled_at })))
  replaceItems(state.marksEntries, apiMarks.data.map(mapMark))
  replaceItems(state.semesterResults, apiResults.data.map(item => ({ id: item.id, studentId: item.student_id, semesterId: item.semester_id, sessionId: item.session_id, gpa: item.gpa, cgpa: item.cgpa, totalCredits: item.total_credits, earnedCredits: item.earned_credits, overallStatus: item.overall_status, publicationStatus: item.publication_status, approvedBy: item.approved_by, approvedAt: item.approved_at, publishedAt: item.published_at })))
  replaceItems(state.gradeRules, apiRules.data.map(item => ({ grade: item.grade, minMarks: item.min_marks, maxMarks: item.max_marks, gradePoint: item.grade_point, passStatus: item.pass_status })))
  const remoteAudit = apiAudit.data.map(item => ({ id: item.id, userId: item.user_id, userName: item.user_name, action: item.action, entity: item.entity, details: item.details, timestamp: item.timestamp }))
  const localAudit = JSON.parse(localStorage.getItem(localAuditStorageKey) ?? '[]') as AuditLog[]
  replaceItems(state.auditLogs, [...localAudit, ...remoteAudit])
  const savedMessages = localStorage.getItem(messagesStorageKey)
  if (savedMessages) replaceItems(state.messages, JSON.parse(savedMessages) as Message[])
}

function addAuditLog(action: string, entity: string, details: string) {
  if (!state.currentUser) return
  const auditLog = {
    id: `a${Date.now()}`,
    userId: state.currentUser.id,
    userName: state.currentUser.name,
    action,
    entity,
    details,
    timestamp: new Date().toISOString(),
  }
  state.auditLogs.unshift(auditLog)
  const localAudit = JSON.parse(localStorage.getItem(localAuditStorageKey) ?? '[]') as AuditLog[]
  localStorage.setItem(localAuditStorageKey, JSON.stringify([auditLog, ...localAudit]))
}

async function login(email: string, password: string) {
  const response = await loginRequest(email.trim(), password)
  const user = mapUser(response.user)
  if (user) {
    state.currentUser = user
    state.currentPage = user.role === 'admin' ? 'admin-dashboard' : user.role === 'student' ? 'student-dashboard' : 'staff-dashboard'
    localStorage.setItem('erp-session', JSON.stringify({ user, page: state.currentPage }))
  }
  return user
}

function logout() {
  state.currentUser = null
  state.currentPage = 'login'
  localStorage.removeItem('erp-session')
  clearApiToken()
}

function navigate(page: string) {
  state.currentPage = page
}

function persistMessages() {
  localStorage.setItem(messagesStorageKey, JSON.stringify(state.messages))
}

function sendMessage(recipientId: string, subject: string, body: string, replyToId?: string) {
  if (!state.currentUser || !subject.trim() || !body.trim()) return
  const recipient = state.users.find(user => user.id === recipientId)
  if (!recipient) return
  state.messages.unshift({
    id: `m${Date.now()}`,
    senderId: state.currentUser.id,
    senderName: state.currentUser.name,
    recipientId,
    recipientName: recipient.name,
    subject: subject.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
    replyToId,
  })
  persistMessages()
  addAuditLog('SEND_MESSAGE', 'Communication', `Sent message to ${recipient.name}: ${subject.trim()}`)
}

function markMessageRead(messageId: string) {
  const message = state.messages.find(item => item.id === messageId)
  if (!message || message.readAt || message.recipientId !== state.currentUser?.id) return
  message.readAt = new Date().toISOString()
  persistMessages()
}

async function saveMarksEntry(raw: MarksEntryInput) {
  const subject = state.subjects.find(item => item.id === raw.subjectId)
  if (!subject) return

  const maxTotal = subject.components.reduce((sum, component) => sum + component.maxMarks, 0)
  const total = computeTotal(raw.components)
  const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0
  const rule = getGradeRule(percentage, state.gradeRules)
  const entry: MarksEntry = {
    ...raw,
    totalMarks: total,
    percentage,
    grade: rule.grade,
    gradePoint: rule.gradePoint,
    status: rule.passStatus,
    updatedAt: new Date().toISOString(),
  }

  try {
    const saved = await saveMarksRequest(raw)
    replaceItems(state.marksEntries, items => [...items.filter(item => !(item.studentId === raw.studentId && item.subjectId === raw.subjectId && item.semesterId === raw.semesterId)), mapMark(saved.data)])
    addAuditLog('MARKS_ENTRY', 'MarksEntry', `Saved marks for student ${raw.studentId} in subject ${raw.subjectId}`)
    return
  } catch {
    // Keep local fallback while the backend is unavailable.
  }
  replaceItems(state.marksEntries, items => {
    const index = items.findIndex(item => item.studentId === raw.studentId && item.subjectId === raw.subjectId && item.semesterId === raw.semesterId)
    if (index >= 0) {
      items[index] = { ...entry, id: items[index].id }
      return items
    }
    return [...items, entry]
  })
  addAuditLog('MARKS_ENTRY', 'MarksEntry', `Saved marks for student ${raw.studentId} in subject ${raw.subjectId}`)
}

async function processResults(semesterId: string, sessionId: string) {
  try {
    await processResultsRequest(semesterId, sessionId)
  } catch (error) {
    throw error
  }
  const semester = state.semesters.find(item => item.id === semesterId)
  if (!semester) return

  const semesterStudents = state.students.filter(student => student.programmeId === semester.programmeId)
  const semesterSubjects = state.subjects.filter(subject => subject.programmeId === semester.programmeId && subject.semesterNumber === semester.number)
  const newResults = semesterStudents.map(student => {
    const entries = state.marksEntries.filter(entry => entry.studentId === student.id && entry.semesterId === semesterId)
    const { gpa, totalCredits, earnedCredits } = computeGPA(entries, semesterSubjects)
    const previousResults = state.semesterResults.filter(result => result.studentId === student.id && result.publicationStatus === 'published')
    const cgpaInputs = [...previousResults.map(result => ({ gpa: result.gpa, credits: result.totalCredits })), { gpa, credits: totalCredits }]
    const existing = state.semesterResults.find(result => result.studentId === student.id && result.semesterId === semesterId)

    return {
      id: existing?.id ?? `r${Date.now()}-${student.id}`,
      studentId: student.id,
      semesterId,
      sessionId,
      gpa,
      cgpa: computeCGPA(cgpaInputs),
      totalCredits,
      earnedCredits,
      overallStatus: entries.some(entry => entry.status === 'fail') ? 'fail' : 'pass',
      publicationStatus: existing?.publicationStatus ?? 'draft',
      approvedBy: existing?.approvedBy,
      approvedAt: existing?.approvedAt,
      publishedAt: existing?.publishedAt,
    } satisfies SemesterResult
  })

  replaceItems(state.semesterResults, items => [...items.filter(result => result.semesterId !== semesterId), ...newResults])
  newResults.forEach(result => { void saveResultRequest(result).catch(() => undefined) })
  addAuditLog('PROCESS_RESULTS', 'SemesterResult', `Processed results for semester ${semesterId}`)
}

function approveResult(resultId: string) {
  const approvedAt = new Date().toISOString()
  replaceItems(state.semesterResults, items => items.map(result => result.id === resultId
    ? { ...result, publicationStatus: 'approved', approvedBy: state.currentUser?.id, approvedAt }
    : result))
  void updateResultStatusRequest(resultId, 'approved', state.currentUser?.id, approvedAt).catch(() => undefined)
  addAuditLog('APPROVE_RESULT', 'SemesterResult', `Approved result ID: ${resultId}`)
}

function publishResult(resultId: string) {
  const publishedAt = new Date().toISOString()
  replaceItems(state.semesterResults, items => items.map(result => result.id === resultId
    ? { ...result, publicationStatus: 'published', publishedAt }
    : result))
  void updateResultStatusRequest(resultId, 'published', undefined, undefined, publishedAt).catch(() => undefined)
  addAuditLog('PUBLISH_RESULT', 'SemesterResult', `Published result ID: ${resultId}`)
}

function getStudentResult(email: string, rollNumber: string, accessCode: string) {
  const student = state.students.find(item => item.email.toLowerCase() === email.toLowerCase() && item.rollNumber.toLowerCase() === rollNumber.toLowerCase() && item.accessCode?.toLowerCase() === accessCode.trim().toLowerCase()) ?? null
  if (!student) return { student: null, results: [] }

  const results = state.semesterResults
    .filter(result => result.studentId === student.id && result.publicationStatus === 'published')
    .map(result => ({
      result,
      semester: state.semesters.find(semester => semester.id === result.semesterId)!,
      entries: state.marksEntries.filter(entry => entry.studentId === student.id && entry.semesterId === result.semesterId),
    }))
    .sort((left, right) => left.semester.number - right.semester.number)

  return { student, results }
}

export function useAppStore() {
  return {
    ...readonly(state),
    currentUser: computed(() => state.currentUser),
    currentPage: computed(() => state.currentPage),
    users: computed(() => state.users),
    programmes: computed(() => state.programmes),
    sessions: computed(() => state.sessions),
    semesters: computed(() => state.semesters),
    subjects: computed(() => state.subjects),
    students: computed(() => state.students),
    marksEntries: computed(() => state.marksEntries),
    semesterResults: computed(() => state.semesterResults),
    gradeRules: computed(() => state.gradeRules),
    auditLogs: computed(() => state.auditLogs),
    messages: computed(() => state.messages),
    login,
    logout,
    navigate,
    setProgrammes: (updater: Programme[] | ((items: Programme[]) => Programme[])) => { const previous = [...state.programmes]; replaceItems(state.programmes, updater); persistProgrammes(state.programmes, previous) },
    setSessions: (updater: AcademicSession[] | ((items: AcademicSession[]) => AcademicSession[])) => { const previous = [...state.sessions]; replaceItems(state.sessions, updater); persistSessions(state.sessions, previous) },
    setSemesters: (updater: Semester[] | ((items: Semester[]) => Semester[])) => { const previous = [...state.semesters]; replaceItems(state.semesters, updater); persistSemesters(state.semesters, previous) },
    setSubjects: (updater: Subject[] | ((items: Subject[]) => Subject[])) => { const previous = [...state.subjects]; replaceItems(state.subjects, updater); persistSubjects(state.subjects, previous) },
    setStudents: (updater: Student[] | ((items: Student[]) => Student[])) => { const previous = [...state.students]; replaceItems(state.students, updater); persistStudents(state.students, previous) },
    setUsers: (updater: User[] | ((items: User[]) => User[])) => {
      replaceItems(state.users, updater)
      state.users.forEach(user => { void saveUserRequest({ id: user.id, name: user.name, email: user.email, password: user.password, role: user.role, permissions: user.permissions, status: user.status, createdAt: user.createdAt }).catch(() => undefined) })
      if (state.currentUser) {
        const refreshedUser = state.users.find(user => user.id === state.currentUser?.id)
        if (refreshedUser) state.currentUser = { ...refreshedUser }
      }
    },
    saveMarksEntry,
    processResults,
    approveResult,
    publishResult,
    addAuditLog,
    sendMessage,
    markMessageRead,
    getStudentResult,
  }
}
