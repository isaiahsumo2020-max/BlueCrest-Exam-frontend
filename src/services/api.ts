const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `http://${browserHost}:3001/api`

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message ?? `Request failed with status ${response.status}`)
  return payload as T
}

export type ApiUser = { id: string; name: string; email: string; role: 'admin' | 'staff'; permissions?: string[]; permissions_json?: string; status: 'active' | 'inactive'; created_at: string }
export type ApiMark = { id: string; student_id: string; subject_id: string; semester_id: string; session_id: string; components_json: string; total_marks: number; percentage: number; grade: string; grade_point: number; status: 'pass' | 'fail'; entered_by: string; entered_at: string; updated_at: string }

export async function getEntity<T>(entity: string) {
  return request<{ data: T[] }>(`/${entity}`)
}

export async function loginRequest(email: string, password: string) {
  return request<{ user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function saveUserRequest(user: unknown) {
  return request<{ data: ApiUser }>('/users', { method: 'POST', body: JSON.stringify(user) })
}

export async function saveMarksRequest(input: unknown) {
  return request<{ data: ApiMark; message: string }>('/marks', { method: 'POST', body: JSON.stringify(input) })
}

export async function processResultsRequest(semesterId: string, sessionId: string) {
  return request<{ data: { studentsProcessed: number; coursesProcessed: number; status: string } }>('/results/process', { method: 'POST', body: JSON.stringify({ semesterId, sessionId }) })
}

export async function saveResultRequest(result: unknown) {
  return request<{ data: Record<string, unknown> }>('/results', { method: 'POST', body: JSON.stringify(result) })
}

export async function updateResultStatusRequest(resultId: string, publicationStatus: 'approved' | 'published', approvedBy?: string, approvedAt?: string, publishedAt?: string) {
  return request<{ data: Record<string, unknown> }>('/results/status', { method: 'POST', body: JSON.stringify({ resultId, publicationStatus, approvedBy, approvedAt, publishedAt }) })
}

export async function saveProgrammeRequest(programme: unknown) {
  return request<{ data: Record<string, unknown> }>('/programmes', { method: 'POST', body: JSON.stringify(programme) })
}

export async function deleteProgrammeRequest(id: string) {
  return request<void>(`/programmes/${id}`, { method: 'DELETE' })
}

export async function saveStudentRequest(student: unknown) {
  return request<{ data: Record<string, unknown> }>('/students', { method: 'POST', body: JSON.stringify(student) })
}

export async function deleteStudentRequest(id: string) {
  return request<void>(`/students/${id}`, { method: 'DELETE' })
}

export async function saveSessionRequest(session: unknown) { return request<{ data: Record<string, unknown> }>('/sessions', { method: 'POST', body: JSON.stringify(session) }) }
export async function deleteSessionRequest(id: string) { return request<void>(`/sessions/${id}`, { method: 'DELETE' }) }
export async function saveSemesterRequest(semester: unknown) { return request<{ data: Record<string, unknown> }>('/semesters', { method: 'POST', body: JSON.stringify(semester) }) }
export async function deleteSemesterRequest(id: string) { return request<void>(`/semesters/${id}`, { method: 'DELETE' }) }
export async function saveSubjectRequest(subject: unknown) { return request<{ data: Record<string, unknown> }>('/subjects', { method: 'POST', body: JSON.stringify(subject) }) }
export async function deleteSubjectRequest(id: string) { return request<void>(`/subjects/${id}`, { method: 'DELETE' }) }
