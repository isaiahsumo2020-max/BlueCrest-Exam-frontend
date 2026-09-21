<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/appStore'
import { gradeColor } from '../utils/calculations'
import type { MarksEntry, Semester, SemesterResult, Student } from '../types'

type ResultData = { student: Student; results: { result: SemesterResult; semester: Semester; entries: MarksEntry[] }[] }
const { getStudentResult, subjects, navigate } = useAppStore()
const email = ref('')
const roll = ref('')
const accessCode = ref('')
const loading = ref(false)
const data = ref<ResultData | null>(null)
const error = ref('')

async function handleSearch() {
  error.value = ''
  data.value = null
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  const result = getStudentResult(email.value, roll.value, accessCode.value)
  if (!result.student) error.value = 'No published results found for the provided details and access code. Please verify your details.'
  else if (result.results.length === 0) error.value = 'Your results have not been published yet. Please check back later or contact the examination office.'
  else data.value = { student: result.student, results: result.results }
  loading.value = false
}
const latestResult = computed(() => data.value?.results[data.value.results.length - 1])
const gradeScale = [
  ['A', '80–100', '4.0'], ['B+', '75–79', '3.5'], ['B', '70–74', '3.0'], ['C+', '65–69', '2.5'],
  ['C', '60–64', '2.0'], ['D+', '55–59', '1.5'], ['D', '50–54', '1.0'], ['F', '0–49', '0.0'],
]
</script>

<template>
  <div class="min-h-screen bg-navy-950 py-8 px-4">
    <div class="max-w-4xl mx-auto mb-8 flex items-center justify-between">
      <div class="flex items-center gap-3"><img src="/images/BlueCrest University.png" alt="BlueCrest University logo" class="w-12 h-12 object-contain" /><div><div class="text-white font-serif font-semibold">BlueCrest University</div><div class="text-navy-400 text-xs">Student Result Verification</div></div></div>
      <button class="text-navy-400 hover:text-navy-200 text-xs transition-colors" @click="navigate('login')">← Staff Login</button>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="bg-navy-900 border border-navy-800 rounded-2xl p-6 mb-6">
        <h1 class="font-serif text-white text-xl font-semibold mb-1">Check Your Published Result</h1>
        <p class="text-navy-400 text-sm mb-5">Enter your Email ID, Roll Number, and private result access code.</p>
        <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="handleSearch">
          <input v-model="email" type="email" required placeholder="Email ID" class="flex-1 bg-navy-800 border border-navy-700 text-white placeholder-navy-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
          <input v-model="roll" type="text" required placeholder="Roll Number" class="w-full sm:w-48 bg-navy-800 border border-navy-700 text-white placeholder-navy-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
          <input v-model="accessCode" type="password" required placeholder="Access code" autocomplete="off" class="w-full sm:w-48 bg-navy-800 border border-navy-700 text-white placeholder-navy-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors" />
          <button type="submit" :disabled="loading" class="bg-gold-400 hover:bg-gold-300 text-navy-950 font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap">{{ loading ? 'Searching…' : 'View Result' }}</button>
        </form>
        <div class="mt-4 border-t border-navy-800 pt-4 text-xs text-navy-500">Try <button class="underline hover:text-navy-300 font-mono" @click="email = 'mtkollie@student.bluecrest.edu.lr'; roll = 'CS-2401'">mtkollie@student.bluecrest.edu.lr / CS-2401</button> or <button class="underline hover:text-navy-300 font-mono" @click="email = 'fkamara@student.bluecrest.edu.lr'; roll = 'CS-2404'">fkamara@student.bluecrest.edu.lr / CS-2404</button></div>
      </div>

      <div v-if="error" class="bg-red-900/40 border border-red-700/50 text-red-300 text-sm px-5 py-4 rounded-xl mb-6">⚠️ {{ error }}</div>
      <div v-if="data" id="result-print" class="space-y-6">
        <div class="bg-white rounded-2xl overflow-hidden" id="result-card">
          <div class="bg-navy-900 px-6 py-5"><div class="flex items-center justify-center gap-5"><img src="/images/BlueCrest University.png" alt="BlueCrest University logo" class="w-32 h-32 object-contain shrink-0" /><div class="text-left"><div class="text-navy-300 text-xs tracking-widest uppercase mb-2">BlueCrest University — Monrovia, Liberia</div><div class="font-serif text-white text-xl font-bold">Official Semester Result Statement</div><div class="text-navy-400 text-xs mt-1">This result is published and verified by the Examination Office</div></div></div></div>
          <div class="bg-navy-50 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div v-for="item in [['Student Name', data.student.name], ['Roll Number', data.student.rollNumber], ['Student ID', data.student.studentId], ['Email', data.student.email]]" :key="item[0]"><div class="text-navy-400 text-xs">{{ item[0] }}</div><div class="text-navy-900 font-medium text-sm">{{ item[1] }}</div></div>
          </div>
          <div v-if="latestResult" class="px-6 py-4 bg-navy-800 flex items-center justify-between gap-4"><div class="flex gap-8"><div><div class="text-navy-400 text-xs">Latest Semester GPA</div><div class="font-serif text-white text-2xl font-bold">{{ latestResult.result.gpa.toFixed(2) }}</div></div><div><div class="text-navy-400 text-xs">Cumulative CGPA</div><div class="font-serif text-gold-400 text-2xl font-bold">{{ latestResult.result.cgpa.toFixed(2) }}</div></div><div><div class="text-navy-400 text-xs">Overall Status</div><div class="text-lg font-bold font-serif" :class="latestResult.result.overallStatus === 'pass' ? 'text-emerald-400' : 'text-red-400'">{{ latestResult.result.overallStatus.toUpperCase() }}</div></div></div><button class="bg-gold-400 text-navy-950 px-4 py-2 rounded-lg text-xs font-semibold no-print" @click="window.print()">🖨 Print Result</button></div>

          <div v-for="item in data.results" :key="item.result.id" class="border-t border-navy-100">
            <div class="px-6 py-3 bg-navy-50 flex items-center justify-between"><div class="font-serif text-navy-900 font-semibold">{{ item.semester.name }}</div><div class="flex gap-4 text-xs text-navy-500"><span>GPA: <b>{{ item.result.gpa.toFixed(2) }}</b></span><span>Credits: <b>{{ item.result.earnedCredits }}/{{ item.result.totalCredits }}</b></span><span class="px-2 py-0.5 rounded-full font-medium" :class="item.result.overallStatus === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">{{ item.result.overallStatus.toUpperCase() }}</span></div></div>
            <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-navy-500 uppercase border-b border-navy-100 text-left"><th class="px-6 py-2.5">Subject</th><th class="px-4 py-2.5">Code</th><th class="px-4 py-2.5 text-center">Marks</th><th class="px-4 py-2.5 text-center">%</th><th class="px-4 py-2.5 text-center">Grade</th><th class="px-4 py-2.5 text-center">Points</th><th class="px-4 py-2.5 text-center">Credits</th><th class="px-4 py-2.5 text-center">Status</th></tr></thead><tbody class="divide-y divide-navy-50"><tr v-for="entry in item.entries" :key="entry.id" class="hover:bg-navy-50/50"><template v-if="subjects.find(subject => subject.id === entry.subjectId)"><td class="px-6 py-3 text-navy-800">{{ subjects.find(subject => subject.id === entry.subjectId)?.title }}</td><td class="px-4 py-3 font-mono text-xs text-navy-500">{{ subjects.find(subject => subject.id === entry.subjectId)?.code }}</td><td class="px-4 py-3 text-center font-mono">{{ entry.totalMarks }}/{{ subjects.find(subject => subject.id === entry.subjectId)?.components.reduce((sum, c) => sum + c.maxMarks, 0) }}</td><td class="px-4 py-3 text-center font-mono">{{ entry.percentage }}%</td><td class="px-4 py-3 text-center"><span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold" :class="gradeColor(entry.grade)">{{ entry.grade }}</span></td><td class="px-4 py-3 text-center font-mono">{{ entry.gradePoint.toFixed(1) }}</td><td class="px-4 py-3 text-center font-mono">{{ subjects.find(subject => subject.id === entry.subjectId)?.credits }}</td><td class="px-4 py-3 text-center"><span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="entry.status === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">{{ entry.status.toUpperCase() }}</span></td></template></tr></tbody></table></div>
          </div>
          <div class="px-6 py-4 bg-navy-50 border-t border-navy-100 text-xs text-navy-400 flex items-center justify-between"><span>Published by BlueCrest University Examination Office</span><span>Verified: {{ latestResult?.result.publishedAt ? new Date(latestResult.result.publishedAt).toLocaleDateString('en-LR') : '—' }}</span></div>
        </div>
        <div class="bg-navy-900 border border-navy-800 rounded-xl p-5"><div class="text-navy-300 text-xs font-medium uppercase tracking-wider mb-3">Grading Scale</div><div class="grid grid-cols-4 sm:grid-cols-8 gap-2 text-xs text-center"><div v-for="scale in gradeScale" :key="scale[0]" class="rounded p-2" :class="scale[0] === 'F' ? 'bg-red-900/30' : 'bg-navy-800'"><div class="font-mono font-bold" :class="scale[0] === 'F' ? 'text-red-400' : 'text-gold-400'">{{ scale[0] }}</div><div class="text-navy-400 mt-0.5">{{ scale[1] }}</div><div class="text-navy-500">GP {{ scale[2] }}</div></div></div></div>
      </div>
    </div>
  </div>
</template>
