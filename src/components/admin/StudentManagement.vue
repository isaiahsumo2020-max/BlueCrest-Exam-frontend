<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { saveStudentRequest } from '../../services/api'
import type { Student } from '../../types'

const { students, programmes, sessions, setStudents } = useAppStore()
const inputCls = 'w-full border border-navy-200 rounded-lg px-3 py-2.5 text-sm text-navy-900 focus:outline-none focus:border-navy-500'
const emptyForm = { studentId: '', rollNumber: '', name: '', email: '', phone: '', programmeId: '', currentSemester: 1, sessionId: '', status: 'active' as Student['status'] }
const form = ref({ ...emptyForm })
const search = ref('')
const filterProg = ref('')
const filterSession = ref('')
const filterStatus = ref('')
const modal = ref(false)
const detailStudent = ref<Student | null>(null)
const editing = ref<string | null>(null)
const emailDomain = '@student.bluecrest.edu.lr'
const emailUsername = computed({
  get: () => form.value.email.replace(new RegExp(`${emailDomain.replace('.', '\\.')}$`), ''),
  set: value => { form.value.email = `${value.trim().replace(/@.*$/, '')}${emailDomain}` },
})

function programmeCode(programmeId: string) {
  const existingCode = students.value.filter(student => student.programmeId === programmeId).map(student => student.studentId.match(/^BCU\/([^/]+)\//)?.[1]).find(Boolean)
  if (existingCode) return existingCode
  const programme = programmes.value.find(item => item.id === programmeId)
  const name = programme?.name.toLowerCase() ?? ''
  if (name.includes('business administration')) return 'BBA'
  if (name.includes('information technology')) return 'BSIT'
  if (name.includes('computer science')) return 'BSC'
  const words = programme?.name.match(/[A-Za-z]+/g)?.filter(word => !['bachelor', 'of', 'in', 'the'].includes(word.toLowerCase())) ?? []
  return words.slice(-2).map(word => word[0].toUpperCase()).join('') || 'ST'
}

const generatedNumbers = computed(() => {
  const session = sessions.value.find(item => item.id === form.value.sessionId)
  const code = programmeCode(form.value.programmeId)
  const year = String(session?.startYear ?? new Date().getFullYear()).slice(-2)
  const cohort = students.value.filter(student => student.programmeId === form.value.programmeId && student.sessionId === form.value.sessionId)
  const registrationNumbers = cohort.map(student => Number(student.studentId.match(/^BCU\/[^/]+\/\d{2}\/(\d+)$/)?.[1] ?? 0))
  const rollNumbers = cohort.map(student => Number(student.rollNumber.match(/^[^-]+-\d{2}(\d+)$/)?.[1] ?? 0))
  const sequence = Math.max(0, ...registrationNumbers, ...rollNumbers) + 1
  return { studentId: `BCU/${code}/${year}/${String(sequence).padStart(3, '0')}`, rollNumber: `${code}-${year}${String(sequence).padStart(2, '0')}` }
})

const filtered = computed(() => {
  const query = search.value.toLowerCase()
  return students.value.filter(student => (!query || [student.name, student.rollNumber, student.email, student.studentId].some(value => value.toLowerCase().includes(query))) && (!filterProg.value || student.programmeId === filterProg.value) && (!filterSession.value || student.sessionId === filterSession.value) && (!filterStatus.value || student.status === filterStatus.value))
})

function clearFilters() { search.value = ''; filterProg.value = ''; filterSession.value = ''; filterStatus.value = '' }
function openAdd() { editing.value = null; form.value = { ...emptyForm, programmeId: programmes.value[0]?.id ?? '', sessionId: sessions.value[0]?.id ?? '' }; modal.value = true }
function openEdit(student: Student) { editing.value = student.id; form.value = { studentId: student.studentId, rollNumber: student.rollNumber, name: student.name, email: student.email, phone: student.phone, programmeId: student.programmeId, currentSemester: student.currentSemester, sessionId: student.sessionId, status: student.status }; modal.value = true }
async function save() {
  const email = form.value.email.includes('@') ? form.value.email : `${form.value.email}${emailDomain}`
  if (!form.value.name || !email) return
  const identifiers = editing.value ? { studentId: form.value.studentId, rollNumber: form.value.rollNumber } : generatedNumbers.value
  const payload = { ...form.value, email, ...identifiers, id: editing.value ?? `st${Date.now()}`, enrolledAt: new Date().toISOString().split('T')[0] }
  try {
    await saveStudentRequest(payload)
    if (editing.value) setStudents(items => items.map(student => student.id === editing.value ? { ...student, ...payload } : student))
    else setStudents(items => [...items, payload])
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Unable to save the student.')
    return
  }
  modal.value = false
}
function remove(id: string) { if (window.confirm('Remove this student record?')) setStudents(items => items.filter(student => student.id !== id)) }
</script>

<template>
  <div class="space-y-5">
    <div class="bg-white border border-navy-100 rounded-xl p-5">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-1 flex-col gap-3 md:flex-row">
          <input v-model="search" class="flex-1 border border-navy-200 rounded-lg px-3 py-2 text-sm" placeholder="Search ID, name, roll number, or email" />
          <select v-model="filterProg" class="border border-navy-200 rounded-lg px-3 py-2 text-sm"><option value="">All Programmes</option><option v-for="programme in programmes" :key="programme.id" :value="programme.id">{{ programme.name }}</option></select>
          <select v-model="filterSession" class="border border-navy-200 rounded-lg px-3 py-2 text-sm"><option value="">All Sessions</option><option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option></select>
          <select v-model="filterStatus" class="border border-navy-200 rounded-lg px-3 py-2 text-sm"><option value="">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="graduated">Graduated</option></select>
          <button v-if="search || filterProg || filterSession || filterStatus" class="whitespace-nowrap text-xs text-navy-500 hover:text-navy-800" @click="clearFilters">Clear filters</button>
        </div>
        <button class="bg-navy-800 text-white px-4 py-2 rounded-lg text-sm" @click="openAdd">+ Enrol Student</button>
      </div>
      <div class="mt-3 flex items-center justify-between text-xs text-navy-400"><span>Showing {{ filtered.length }} of {{ students.length }} students</span><span>Search and filter academic records</span></div>
    </div>

    <div class="bg-white border border-navy-100 rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-190 text-sm"><thead><tr class="text-xs text-navy-500 uppercase border-b border-navy-100 text-left bg-navy-50/50"><th class="px-5 py-3">Student / Registration</th><th class="px-5 py-3">Roll No.</th><th class="px-5 py-3">Programme</th><th class="px-5 py-3">Session</th><th class="px-5 py-3">Semester</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Actions</th></tr></thead><tbody class="divide-y divide-navy-50"><tr v-for="student in filtered" :key="student.id" class="hover:bg-navy-50/40"><td class="px-5 py-3.5"><div class="font-medium text-navy-900">{{ student.name }}</div><div class="text-xs text-navy-400">{{ student.studentId }} · {{ student.email }}</div></td><td class="px-5 py-3.5 font-mono text-xs">{{ student.rollNumber }}</td><td class="px-5 py-3.5 text-xs">{{ programmes.find(programme => programme.id === student.programmeId)?.name ?? '—' }}</td><td class="px-5 py-3.5 text-xs">{{ sessions.find(session => session.id === student.sessionId)?.name ?? '—' }}</td><td class="px-5 py-3.5">Sem {{ student.currentSemester }}</td><td class="px-5 py-3.5"><span class="text-xs px-2 py-0.5 rounded-full" :class="student.status === 'active' ? 'bg-emerald-50 text-emerald-700' : student.status === 'graduated' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'">{{ student.status }}</span></td><td class="px-5 py-3.5"><button class="text-xs mr-3" @click="detailStudent = student">View</button><button class="text-xs mr-3" @click="openEdit(student)">Edit</button><button class="text-xs text-red-500" @click="remove(student.id)">Delete</button></td></tr></tbody></table><div v-if="filtered.length === 0" class="text-center py-12 text-navy-400 text-sm">No students found.</div></div></div>

    <div v-if="modal || detailStudent" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"><div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"><div class="flex justify-between p-5 border-b border-navy-100"><h3 class="font-serif font-semibold">{{ detailStudent ? 'Student Profile' : editing ? 'Edit Student' : 'Enrol New Student' }}</h3><button class="text-xl" @click="modal = false; detailStudent = null">×</button></div><div v-if="detailStudent" class="p-5 space-y-4"><div class="text-lg font-serif font-semibold">{{ detailStudent.name }}</div><div class="text-navy-400 text-sm">{{ detailStudent.email }}</div><div class="grid grid-cols-2 gap-3 text-sm"><div v-for="item in [['Student ID', detailStudent.studentId], ['Roll Number', detailStudent.rollNumber], ['Phone', detailStudent.phone], ['Semester', `Semester ${detailStudent.currentSemester}`], ['Programme', programmes.find(programme => programme.id === detailStudent.programmeId)?.name ?? '—'], ['Session', sessions.find(session => session.id === detailStudent.sessionId)?.name ?? '—'], ['Status', detailStudent.status], ['Enrolled', detailStudent.enrolledAt]]" :key="item[0]" class="bg-navy-50 rounded-lg p-3"><div class="text-navy-400 text-xs">{{ item[0] }}</div><div class="font-medium truncate">{{ item[1] }}</div></div></div></div><div v-else class="p-5 space-y-4"><div class="grid grid-cols-2 gap-4"><label class="text-sm">Registration Number<input :value="editing ? form.studentId : generatedNumbers.studentId" readonly :class="`${inputCls} bg-navy-50`" /></label><label class="text-sm">Roll Number<input :value="editing ? form.rollNumber : generatedNumbers.rollNumber" readonly :class="`${inputCls} bg-navy-50`" /></label></div><label class="text-sm">Full Name *<input v-model="form.name" :class="inputCls" /></label><label class="text-sm">Email Address *<div class="flex"><input v-model="emailUsername" type="text" placeholder="student.name" autocomplete="email" :class="`${inputCls} rounded-r-none`" /><span class="flex items-center border border-l-0 border-navy-200 rounded-r-lg bg-navy-50 px-2 text-xs text-navy-500">{{ emailDomain }}</span></div></label><label class="text-sm">Phone<input v-model="form.phone" :class="inputCls" /></label><div class="grid grid-cols-2 gap-4"><label class="text-sm">Programme<select v-model="form.programmeId" :class="inputCls"><option v-for="item in programmes" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-sm">Session<select v-model="form.sessionId" :class="inputCls"><option v-for="item in sessions" :key="item.id" :value="item.id">{{ item.name }}</option></select></label></div><div class="grid grid-cols-2 gap-4"><label class="text-sm">Current Semester<input v-model.number="form.currentSemester" type="number" :class="inputCls" /></label><label class="text-sm">Status<select v-model="form.status" :class="inputCls"><option value="active">Active</option><option value="inactive">Inactive</option><option value="graduated">Graduated</option></select></label></div><div class="flex gap-3"><button class="bg-navy-800 text-white px-4 py-2 rounded-lg text-sm" @click="save">{{ editing ? 'Update Student' : 'Enrol Student' }}</button><button class="text-navy-500 text-sm" @click="modal = false">Cancel</button></div></div></div></div>
    <section class="rounded-xl border border-gold-200 bg-gold-50 p-5"><h3 class="font-serif font-semibold text-gold-900">Private Result Access Codes</h3><p class="mt-1 text-xs text-gold-800">Give each student only their own code. It is required with their email and roll number.</p><div class="mt-3 grid gap-2 sm:grid-cols-2"><div v-for="student in filtered" :key="`code-${student.id}`" class="flex items-center justify-between rounded-lg border border-gold-200 bg-white px-3 py-2 text-sm"><span class="text-navy-800">{{ student.name }}</span><span class="font-mono font-semibold text-gold-700">{{ student.accessCode ?? 'Unavailable' }}</span></div></div></section>
+  </div>
+</template>
