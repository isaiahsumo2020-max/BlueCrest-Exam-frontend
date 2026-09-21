<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/appStore'
const { programmes, students, marksEntries, semesterResults, semesters, subjects, sessions, users, auditLogs } = useAppStore()
const activeStudents = computed(() => students.value.filter(student => student.status === 'active').length)
const activeProgrammes = computed(() => programmes.value.filter(programme => programme.status === 'active').length)
const currentSession = computed(() => sessions.value.find(session => session.status === 'active')?.name ?? 'Not configured')
const pendingMarks = computed(() => students.value.filter(student => student.status === 'active').reduce((total, student) => {
  const studentSubjects = subjects.value.filter(subject => subject.programmeId === student.programmeId && subject.semesterNumber === student.currentSemester)
  const semesterIds = new Set(semesters.value.filter(semester => semester.programmeId === student.programmeId && semester.number === student.currentSemester).map(semester => semester.id))
  const entered = marksEntries.value.filter(entry => entry.studentId === student.id && semesterIds.has(entry.semesterId))
  return total + Math.max(studentSubjects.length - entered.length, 0)
}, 0))
const pendingApproval = computed(() => semesterResults.value.filter(result => result.publicationStatus === 'draft').length)
const publishedResults = computed(() => semesterResults.value.filter(result => result.publicationStatus === 'published').length)
const activeUsers = computed(() => users.value.filter(user => user.status === 'active').length)
const recentActivity = computed(() => auditLogs.value.slice(0, 6))
type DashboardStat = { label: string; value: string | number; sub: string; tone: 'navy' | 'gold' | 'amber' | 'green' }
const stats = computed<DashboardStat[]>(() => [
  { label: 'Total Students', value: activeStudents.value, sub: 'Active enrolments', tone: 'navy' },
  { label: 'Active Programmes', value: activeProgrammes.value, sub: 'Configured programmes', tone: 'navy' },
  { label: 'Active Courses', value: subjects.value.length, sub: 'Configured subjects', tone: 'navy' },
  { label: 'Current Session', value: currentSession.value, sub: 'Academic calendar', tone: 'gold' },
  { label: 'Pending Marks', value: pendingMarks.value, sub: 'Entries outstanding', tone: 'amber' },
  { label: 'Awaiting Approval', value: pendingApproval.value, sub: 'Draft results', tone: 'amber' },
  { label: 'Published Results', value: publishedResults.value, sub: 'Available to students', tone: 'green' },
  { label: 'System Users', value: activeUsers.value, sub: 'Active accounts', tone: 'navy' },
])
const grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']
const gradeDistribution = computed(() => grades.map(grade => ({ grade, count: marksEntries.value.filter(entry => entry.grade === grade).length })))
</script>
<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold-600">Control Center</p>
        <h2 class="font-serif text-2xl font-semibold text-navy-900">Examination Overview</h2>
        <p class="text-sm text-navy-500">Monitor academic setup, marks progress, and result publication.</p>
      </div>
      <div class="text-xs text-navy-400">{{ currentSession }}</div>
    </section>

    <section class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="rounded-xl border bg-white p-4" :class="stat.tone === 'gold' ? 'border-gold-200 bg-gold-50' : stat.tone === 'amber' ? 'border-amber-200 bg-amber-50' : stat.tone === 'green' ? 'border-emerald-200 bg-emerald-50' : 'border-navy-100'">
        <div class="text-2xl font-serif font-bold" :class="stat.tone === 'gold' ? 'text-gold-700' : stat.tone === 'amber' ? 'text-amber-700' : stat.tone === 'green' ? 'text-emerald-700' : 'text-navy-900'">{{ stat.value }}</div>
        <div class="mt-1 text-xs font-semibold text-navy-700">{{ stat.label }}</div>
        <div class="mt-1 text-[11px] text-navy-400">{{ stat.sub }}</div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="rounded-xl border border-navy-100 bg-white p-5 xl:col-span-2">
        <div class="mb-5 flex items-center justify-between"><div><h3 class="font-serif font-semibold text-navy-900">Grade Distribution</h3><p class="text-xs text-navy-400">All marks entries · {{ marksEntries.length }} records</p></div><span class="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-500">Live data</span></div>
        <div class="space-y-3"><div v-for="item in gradeDistribution" :key="item.grade" class="flex items-center gap-3"><span class="w-7 font-mono text-xs text-navy-500">{{ item.grade }}</span><div class="h-2 flex-1 overflow-hidden rounded-full bg-navy-100"><div class="h-full rounded-full bg-gold-400" :style="{ width: `${marksEntries.length ? item.count / marksEntries.length * 100 : 0}%` }" /></div><span class="w-7 text-right text-xs text-navy-500">{{ item.count }}</span></div></div>
      </div>
      <div class="rounded-xl border border-navy-100 bg-white p-5">
        <div class="mb-4"><h3 class="font-serif font-semibold text-navy-900">Recent Activity</h3><p class="text-xs text-navy-400">Latest recorded actions</p></div>
        <div v-if="recentActivity.length" class="space-y-4"><div v-for="activity in recentActivity" :key="activity.id" class="flex gap-3"><div class="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-400" /><div class="min-w-0"><div class="text-xs font-medium text-navy-800">{{ activity.action.replace(/_/g, ' ') }}</div><div class="truncate text-xs text-navy-500">{{ activity.details }}</div><div class="mt-1 text-[10px] text-navy-400">{{ new Date(activity.timestamp).toLocaleDateString('en-LR') }}</div></div></div></div>
        <div v-else class="py-6 text-center text-xs text-navy-400">No activity recorded yet.</div>
      </div>
    </section>

    <section class="rounded-xl border border-navy-100 bg-white p-5">
      <div class="mb-4"><h3 class="font-serif font-semibold text-navy-900">Programme Snapshot</h3><p class="text-xs text-navy-400">Students and courses by programme</p></div>
      <div class="overflow-x-auto"><table class="w-full min-w-155 text-sm"><thead><tr class="border-b border-navy-100 text-left text-xs uppercase tracking-wider text-navy-500"><th class="px-3 py-3">Programme</th><th class="px-3 py-3">Department</th><th class="px-3 py-3 text-center">Students</th><th class="px-3 py-3 text-center">Courses</th><th class="px-3 py-3 text-center">Status</th></tr></thead><tbody class="divide-y divide-navy-50"><tr v-for="programme in programmes" :key="programme.id"><td class="px-3 py-3 font-medium text-navy-800">{{ programme.name }}</td><td class="px-3 py-3 text-xs text-navy-500">{{ programme.department }}</td><td class="px-3 py-3 text-center font-mono">{{ students.filter(student => student.programmeId === programme.id && student.status === 'active').length }}</td><td class="px-3 py-3 text-center font-mono">{{ subjects.filter(subject => subject.programmeId === programme.id).length }}</td><td class="px-3 py-3 text-center"><span class="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{{ programme.status }}</span></td></tr></tbody></table></div>
    </section>
  </div>
</template>
