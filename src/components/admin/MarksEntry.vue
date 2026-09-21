<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { getGradeRule, gradeColor } from '../../utils/calculations'

const { programmes, sessions, semesters, subjects, students, marksEntries, saveMarksEntry, currentUser } = useAppStore()

const selProg = ref('')
const selSession = ref('')
const selSem = ref('')
const selSub = ref('')
const saved = ref<string[]>([])
const marks = ref<Record<string, Record<string, number | null>>>({})
const feedback = ref('')

const defaultProgramme = computed(() => programmes.value.find(item => students.value.some(student => student.programmeId === item.id && student.status === 'active') && subjects.value.some(subject => subject.programmeId === item.id)) ?? programmes.value[0] ?? null)
const defaultSession = computed(() => sessions.value.find(item => item.status === 'active') ?? sessions.value[0] ?? null)

const filteredSems = computed(() => semesters.value.filter(item => item.programmeId === selProg.value && item.sessionId === selSession.value))
const editableSems = computed(() => filteredSems.value.filter(item => item.status !== 'results_published' || subjects.value.some(subject => subject.programmeId === item.programmeId && subject.semesterNumber === item.number)))
const activeSem = computed(() => {
  const selected = filteredSems.value.find(item => item.id === selSem.value)
  if (selected && (selected.status !== 'results_published' || subjects.value.some(subject => subject.programmeId === selected.programmeId && subject.semesterNumber === selected.number))) return selected
  return editableSems.value[0] ?? filteredSems.value[0] ?? null
})
const filteredSubs = computed(() => subjects.value.filter(item => item.programmeId === selProg.value && (item.semesterNumber === (activeSem.value?.number ?? 0) || !subjects.value.some(subject => subject.programmeId === selProg.value && subject.semesterNumber === (activeSem.value?.number ?? 0)))))
const activeSub = computed(() => filteredSubs.value.find(item => item.id === selSub.value) ?? filteredSubs.value[0] ?? null)
const semStudents = computed(() => students.value.filter(item => item.programmeId === selProg.value && item.status === 'active'))
const isLocked = computed(() => false)
const maxTotal = computed(() => activeSub.value?.components.reduce((sum, component) => sum + component.maxMarks, 0) ?? 0)

watch([programmes, sessions, semesters, subjects, students], () => {
  if (!programmes.value.length || !sessions.value.length) return

  if (!selProg.value) {
    selProg.value = defaultProgramme.value?.id ?? programmes.value[0].id
  }

  if (!selSession.value) {
    selSession.value = defaultSession.value?.id ?? sessions.value[0].id
  }

  const nextSemester = filteredSems.value.find(item => item.status !== 'results_published' || subjects.value.some(subject => subject.programmeId === item.programmeId && subject.semesterNumber === item.number)) ?? filteredSems.value.find(item => subjects.value.some(subject => subject.programmeId === item.programmeId && subject.semesterNumber === item.number)) ?? filteredSems.value[0]
  if (!selSem.value || !filteredSems.value.some(item => item.id === selSem.value)) {
    selSem.value = nextSemester?.id ?? ''
  }

  const nextSubject = filteredSubs.value.find(item => item.programmeId === selProg.value && item.semesterNumber === (activeSem.value?.number ?? 0)) ?? filteredSubs.value[0]
  if (!selSub.value || !filteredSubs.value.some(item => item.id === selSub.value)) {
    selSub.value = nextSubject?.id ?? ''
  }
}, { immediate: true })

watch([selProg, selSession], () => {
  const nextSemester = filteredSems.value.find(item => item.status !== 'results_published' || subjects.value.some(subject => subject.programmeId === item.programmeId && subject.semesterNumber === item.number)) ?? filteredSems.value.find(item => subjects.value.some(subject => subject.programmeId === item.programmeId && subject.semesterNumber === item.number)) ?? filteredSems.value[0]
  selSem.value = nextSemester?.id ?? ''
  const nextSubject = filteredSubs.value.find(item => item.programmeId === selProg.value && item.semesterNumber === (nextSemester?.number ?? 0)) ?? filteredSubs.value[0]
  selSub.value = nextSubject?.id ?? ''
})

function existingEntry(studentId: string) { return marksEntries.value.find(entry => entry.studentId === studentId && entry.semesterId === activeSem.value?.id && entry.subjectId === activeSub.value?.id) }
function getMark(studentId: string, component: string) { return marks.value[studentId]?.[component] ?? existingEntry(studentId)?.components[component] ?? 0 }
function hasMark(studentId: string, component: string) { return (marks.value[studentId]?.[component] !== undefined && marks.value[studentId]?.[component] !== null) || existingEntry(studentId)?.components[component] !== undefined }
function setMark(studentId: string, component: string, rawValue: string | number | null, max: number) {
  const nextValue = rawValue === null || rawValue === '' ? null : Math.max(0, Math.min(max, Number(rawValue)))
  marks.value = {
    ...marks.value,
    [studentId]: {
      ...(marks.value[studentId] ?? {}),
      [component]: nextValue,
    },
  }
}
function total(studentId: string) { return activeSub.value?.components.reduce((sum, component) => sum + getMark(studentId, component.name), 0) ?? 0 }
function percentage(studentId: string) { return maxTotal.value ? Math.round((total(studentId) / maxTotal.value) * 100) : 0 }
function grade(percent: number) { return getGradeRule(percent).grade }
function isComplete(studentId: string) { return Boolean(activeSub.value?.components.length && activeSub.value.components.every(component => hasMark(studentId, component.name))) }
const pendingSave = ref<{ type: 'row' | 'all'; studentId?: string } | null>(null)
const saveConfirmationText = computed(() => {
  if (!pendingSave.value) return ''
  if (pendingSave.value.type === 'all') return `Save marks for all ${semStudents.value.length} students in ${activeSub.value?.code}?`
  return `Save marks for ${semStudents.value.find(student => student.id === pendingSave.value?.studentId)?.name}?`
})
function saveRowNow(studentId: string) {
  if (!activeSem.value || !activeSub.value) return
  if (!isComplete(studentId)) {
    feedback.value = 'Please enter every assessment mark before saving.'
    return
  }
  const components: Record<string, number> = {}
  activeSub.value.components.forEach(component => {
    components[component.name] = getMark(studentId, component.name)
  })
  saveMarksEntry({
    id: `m${Date.now()}-${studentId}`,
    studentId,
    subjectId: activeSub.value.id,
    semesterId: activeSem.value.id,
    sessionId: selSession.value,
    components,
    enteredBy: currentUser.value?.id ?? 'u1',
    enteredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  feedback.value = 'Marks saved successfully.'
  saved.value = [...saved.value.filter(id => id !== studentId), studentId]
  setTimeout(() => { saved.value = saved.value.filter(id => id !== studentId) }, 2000)
}
function saveRow(studentId: string) { pendingSave.value = { type: 'row', studentId } }
function saveAllNow() {
  const incomplete = semStudents.value.filter(student => !isComplete(student.id))
  if (incomplete.length) {
    feedback.value = `${incomplete.length} student${incomplete.length === 1 ? '' : 's'} still have missing marks.`
    return
  }
  semStudents.value.forEach(student => saveRowNow(student.id))
  feedback.value = 'All marks saved successfully.'
}
function saveAll() {
  const incomplete = semStudents.value.filter(student => !isComplete(student.id))
  if (incomplete.length) {
    feedback.value = `${incomplete.length} student${incomplete.length === 1 ? '' : 's'} still have missing marks.`
    return
  }
  pendingSave.value = { type: 'all' }
}
function confirmSave() {
  if (!pendingSave.value) return
  if (pendingSave.value.type === 'row' && pendingSave.value.studentId) saveRowNow(pendingSave.value.studentId)
  if (pendingSave.value.type === 'all') saveAllNow()
  pendingSave.value = null
}
function cancelSave() { pendingSave.value = null }
</script>
<template>
  <div class="space-y-5"><div class="bg-white border border-navy-100 rounded-xl p-5"><h2 class="font-serif text-navy-900 font-semibold mb-4">Select Academic Context</h2><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><label class="text-xs font-medium">Programme<select v-model="selProg" class="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm mt-1"><option v-for="item in programmes" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium">Session<select v-model="selSession" class="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm mt-1"><option v-for="item in sessions" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium">Semester<select v-model="selSem" class="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm mt-1"><option v-for="item in filteredSems" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium">Subject<select v-model="selSub" class="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm mt-1"><option v-for="item in filteredSubs" :key="item.id" :value="item.id">{{ item.code }} – {{ item.title }}</option></select></label></div><div v-if="activeSub" class="mt-4 flex flex-wrap gap-4 items-center justify-between"><div class="flex gap-6 text-sm"><span>Credits: <b>{{ activeSub.credits }}</b></span><span>Total Max Marks: <b>{{ maxTotal }}</b></span><span>Pass Mark: <b>{{ activeSub.passMark }}%</b></span><span v-if="isLocked" class="text-amber-600">🔒 Results published — read only</span></div><button v-if="!isLocked" class="bg-navy-800 text-white px-4 py-2 rounded-lg text-sm" @click="saveAll">Save All Marks</button></div><div v-if="feedback" class="mt-4 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-sm text-gold-700">{{ feedback }}</div></div>
  <div v-if="activeSub && activeSem" class="bg-white border border-navy-100 rounded-xl overflow-hidden"><div class="px-5 py-4 border-b border-navy-100 flex justify-between"><span class="font-serif font-semibold">{{ activeSub.code }}: {{ activeSub.title }}</span><span class="text-xs text-navy-400">{{ semStudents.length }} students</span></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-navy-500 uppercase border-b border-navy-100 bg-navy-50/50"><th class="px-5 py-3 text-left">Student</th><th class="px-5 py-3 text-left">Roll No.</th><th v-for="component in activeSub.components" :key="component.name" class="px-3 py-3">{{ component.name }}/{{ component.maxMarks }}</th><th class="px-3 py-3">Total/{{ maxTotal }}</th><th class="px-3 py-3">%</th><th class="px-3 py-3">Grade</th><th class="px-3 py-3">Status</th><th v-if="!isLocked" /></tr></thead><tbody class="divide-y divide-navy-50"><tr v-for="student in semStudents" :key="student.id"><td class="px-5 py-3 font-medium">{{ student.name }}<div class="text-[11px] text-navy-400">{{ student.studentId }}</div></td><td class="px-5 py-3 font-mono text-xs">{{ student.rollNumber }}</td><td v-for="component in activeSub.components" :key="component.name" class="px-3 py-3"><input type="number" :value="getMark(student.id, component.name)" :max="component.maxMarks" min="0" :disabled="isLocked" class="w-16 text-center border border-navy-200 rounded-lg px-2 py-1 font-mono" :class="!hasMark(student.id, component.name) ? 'border-amber-300 bg-amber-50' : ''" @input="setMark(student.id, component.name, ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value), component.maxMarks)" /></td><td class="px-3 py-3 font-mono font-semibold">{{ total(student.id) }}</td><td class="px-3 py-3 font-mono">{{ percentage(student.id) }}%</td><td class="px-3 py-3"><span v-if="isComplete(student.id)" class="text-xs font-mono font-semibold px-2 py-0.5 rounded" :class="existingEntry(student.id) ? gradeColor(existingEntry(student.id)!.grade) : 'bg-blue-50 text-blue-700'">{{ existingEntry(student.id)?.grade ?? grade(percentage(student.id)) }}</span><span v-else class="text-xs text-amber-700">Not entered</span></td><td class="px-3 py-3 text-xs">{{ existingEntry(student.id)?.status?.toUpperCase() ?? (isComplete(student.id) ? 'DRAFT' : 'MISSING') }}</td><td v-if="!isLocked" class="px-5 py-3"><button class="bg-navy-800 text-white text-xs px-3 py-1.5 rounded-lg" @click="saveRow(student.id)">{{ saved.includes(student.id) ? '✓ Saved' : 'Save' }}</button></td></tr></tbody></table></div></div><div v-else class="bg-white border border-navy-100 rounded-xl p-12 text-center text-navy-500">Select a programme, semester, and subject to enter marks.</div>
    <div v-if="pendingSave" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="save-marks-dialog-title">
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div class="border-b border-navy-100 p-5"><p class="text-xs font-medium uppercase tracking-wider text-gold-600">Save Marks</p><h3 id="save-marks-dialog-title" class="mt-1 font-serif text-lg font-semibold text-navy-900">Confirm marks submission</h3></div>
        <div class="p-5 text-sm text-navy-600">{{ saveConfirmationText }} This action will update the academic record.</div>
        <div class="flex justify-end gap-3 border-t border-navy-100 p-5"><button class="rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-600" @click="cancelSave">Cancel</button><button class="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white" @click="confirmSave">Save Marks</button></div>
      </div>
    </div>
  </div>
</template>
