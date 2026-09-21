<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { gradeColor } from '../../utils/calculations'

const { programmes, sessions, semesters, subjects, students, marksEntries, currentUser } = useAppStore()
const selProg = ref(programmes.value[0]?.id ?? '')
const selSession = ref('s2')
const selSem = ref('')
const selSub = ref('')
const showMissingOnly = ref(false)
const notice = ref('')
const filteredSems = computed(() => semesters.value.filter(item => item.programmeId === selProg.value && item.sessionId === selSession.value))
const activeSem = computed(() => filteredSems.value.find(item => item.id === selSem.value) ?? filteredSems.value[0])
const filteredSubs = computed(() => subjects.value.filter(item => item.programmeId === selProg.value && item.semesterNumber === (activeSem.value?.number ?? 0)))
const activeSub = computed(() => filteredSubs.value.find(item => item.id === selSub.value) ?? filteredSubs.value[0])
const courseStudents = computed(() => students.value.filter(item => item.programmeId === selProg.value && item.status === 'active'))
const rows = computed(() => courseStudents.value.map(student => {
  const entry = marksEntries.value.find(item => item.studentId === student.id && item.subjectId === activeSub.value?.id && item.semesterId === activeSem.value?.id)
  return { student, entry, complete: Boolean(entry) }
}).filter(row => !showMissingOnly.value || !row.complete))
const completedCount = computed(() => rows.value.filter(row => row.complete).length)
const missingCount = computed(() => rows.value.filter(row => !row.complete).length)
const canCorrect = computed(() => currentUser.value?.role === 'admin')
function requestCorrection(studentName: string) {
  if (!canCorrect.value) return
  if (window.confirm(`Open ${studentName}'s marks for correction?`)) notice.value = 'Correction access confirmed. Use Marks Entry to make the change.'
}
</script>

<template>
  <div class="space-y-5">
    <section class="rounded-xl border border-navy-100 bg-white p-5"><div class="mb-4"><p class="text-xs font-medium uppercase tracking-wider text-gold-600">Quality Control</p><h2 class="font-serif text-xl font-semibold text-navy-900">Marks Review</h2><p class="text-sm text-navy-500">Inspect entered marks and identify incomplete records before result processing.</p></div><div class="grid grid-cols-2 gap-4 lg:grid-cols-4"><label class="text-xs font-medium text-navy-600">Programme<select v-model="selProg" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"><option v-for="item in programmes" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium text-navy-600">Academic Session<select v-model="selSession" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"><option v-for="item in sessions" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium text-navy-600">Semester<select v-model="selSem" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"><option v-for="item in filteredSems" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium text-navy-600">Course / Subject<select v-model="selSub" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"><option v-for="item in filteredSubs" :key="item.id" :value="item.id">{{ item.code }} - {{ item.title }}</option></select></label></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3"><div class="flex gap-3 text-xs"><span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Complete: {{ completedCount }}</span><span class="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Missing: {{ missingCount }}</span></div><label class="flex items-center gap-2 text-xs text-navy-600"><input v-model="showMissingOnly" type="checkbox" /> Show missing entries only</label></div><div v-if="notice" class="mt-4 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-sm text-gold-700">{{ notice }}</div></section>
    <section class="overflow-hidden rounded-xl border border-navy-100 bg-white"><div class="border-b border-navy-100 px-5 py-4"><h3 class="font-serif font-semibold text-navy-900">{{ activeSub?.code }}: {{ activeSub?.title }}</h3><p class="text-xs text-navy-400">{{ rows.length }} student records in this review</p></div><div class="overflow-x-auto"><table class="w-full min-w-190 text-sm"><thead><tr class="bg-navy-50/50 text-left text-xs uppercase tracking-wider text-navy-500"><th class="px-5 py-3">Student ID</th><th class="px-5 py-3">Student Name</th><th v-for="component in activeSub?.components ?? []" :key="component.name" class="px-3 py-3 text-center">{{ component.name }}</th><th class="px-3 py-3 text-center">Total</th><th class="px-3 py-3 text-center">Grade</th><th class="px-3 py-3 text-center">Entry Status</th><th class="px-5 py-3">Action</th></tr></thead><tbody class="divide-y divide-navy-50"><tr v-for="row in rows" :key="row.student.id"><td class="px-5 py-3 font-mono text-xs text-navy-500">{{ row.student.studentId }}</td><td class="px-5 py-3"><div class="font-medium text-navy-800">{{ row.student.name }}</div><div class="text-xs text-navy-400">{{ row.student.rollNumber }}</div></td><td v-for="component in activeSub?.components ?? []" :key="component.name" class="px-3 py-3 text-center font-mono text-xs">{{ row.entry?.components[component.name] ?? '—' }}/{{ component.maxMarks }}</td><td class="px-3 py-3 text-center font-mono font-semibold">{{ row.entry?.totalMarks ?? '—' }}</td><td class="px-3 py-3 text-center"><span v-if="row.entry" class="rounded px-2 py-0.5 text-xs font-mono font-semibold" :class="gradeColor(row.entry.grade)">{{ row.entry.grade }}</span><span v-else class="text-xs text-amber-700">Not entered</span></td><td class="px-3 py-3 text-center"><span class="rounded-full px-2 py-0.5 text-xs" :class="row.entry ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">{{ row.entry ? 'Complete' : 'Missing' }}</span></td><td class="px-5 py-3"><button v-if="canCorrect && row.entry" class="text-xs text-navy-600 hover:text-navy-900" @click="requestCorrection(row.student.name)">Request correction</button><span v-else class="text-xs text-navy-400">{{ row.entry ? 'Review only' : 'Enter marks' }}</span></td></tr></tbody></table><div v-if="!rows.length" class="p-12 text-center text-sm text-navy-400">Select a course with review records.</div></div></section>
  </div>
</template>
