<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { gradeColor } from '../../utils/calculations'
type ReportType = 'classwise' | 'individual' | 'subject' | 'passfail' | 'gpa' | 'pending' | 'published'
const { programmes, sessions, semesters, subjects, students, marksEntries, semesterResults, schoolSettings } = useAppStore()
const reportType = ref<ReportType>('classwise')
const selProg = ref(programmes.value[0]?.id ?? ''), selSession = ref('s2'), selSem = ref('sem1'), selStudent = ref(students.value[0]?.id ?? '')
const filteredSems = computed(() => semesters.value.filter(item => item.programmeId === selProg.value && item.sessionId === selSession.value))
const activeSem = computed(() => filteredSems.value.find(item => item.id === selSem.value) ?? filteredSems.value[0])
const semSubjects = computed(() => subjects.value.filter(item => item.programmeId === selProg.value && item.semesterNumber === (activeSem.value?.number ?? 0)))
const semStudents = computed(() => students.value.filter(item => item.programmeId === selProg.value && item.status === 'active'))
const reportStudents = computed(() => semStudents.value.filter(student => semesterResults.value.some(result => result.studentId === student.id && result.publicationStatus === 'published')))
const semResults = computed(() => semesterResults.value.filter(item => item.semesterId === activeSem.value?.id && item.sessionId === selSession.value))
const programme = computed(() => programmes.value.find(item => item.id === selProg.value)); const session = computed(() => sessions.value.find(item => item.id === selSession.value)); const selectedStudent = computed(() => students.value.find(item => item.id === selStudent.value)); const selectedResult = computed(() => semResults.value.find(item => item.studentId === selStudent.value))
const reportTypes = [{ id: 'classwise', label: 'Class Marksheet' }, { id: 'individual', label: 'Individual Marksheet' }, { id: 'subject', label: 'Subject-wise Marks' }, { id: 'passfail', label: 'Pass/Fail Summary' }, { id: 'gpa', label: 'GPA/CGPA Report' }, { id: 'pending', label: 'Pending Results' }, { id: 'published', label: 'Published Results' }] as { id: ReportType; label: string }[]
const universityName = computed(() => schoolSettings.value.schoolName || 'BlueCrest University')
const universityLogo = computed(() => schoolSettings.value.schoolLogo || '/images/BlueCrest University.png')
const resultAssets = computed(() => schoolSettings.value)
const printingOfficialResult = ref(false)
const officialResults = computed(() => {
  if (!selectedStudent.value) return []
  return semesterResults.value
    .filter(result => result.studentId === selectedStudent.value?.id && result.publicationStatus === 'published')
    .flatMap(result => {
      const semester = semesters.value.find(item => item.id === result.semesterId)
      if (!semester) return []
      const entries = marksEntries.value.filter(entry => entry.studentId === result.studentId && entry.semesterId === result.semesterId)
      return [{ result, semester, entries, subjects: subjects.value.filter(subject => entries.some(entry => entry.subjectId === subject.id)) }]
    })
    .sort((first, second) => first.semester.number - second.semester.number)
})
const latestOfficialResult = computed(() => officialResults.value[officialResults.value.length - 1])
const gradeScale = [
  ['A', '80–100', '4.0'], ['B+', '75–79', '3.5'], ['B', '70–74', '3.0'], ['C+', '65–69', '2.5'],
  ['C', '60–64', '2.0'], ['D+', '55–59', '1.5'], ['D', '50–54', '1.0'], ['F', '0–49', '0.0'],
]
function selectReportType(type: ReportType) {
  reportType.value = type
  if (type === 'individual' && !semStudents.value.some(student => student.id === selStudent.value)) {
    selStudent.value = reportStudents.value[0]?.id ?? semStudents.value[0]?.id ?? ''
  }
}
watch([selProg, selSession], () => {
  if (reportType.value === 'individual' && !semStudents.value.some(student => student.id === selStudent.value)) {
    selStudent.value = reportStudents.value[0]?.id ?? semStudents.value[0]?.id ?? ''
  }
})
function entryFor(studentId: string, subjectId: string) { return marksEntries.value.find(entry => entry.studentId === studentId && entry.subjectId === subjectId && entry.semesterId === activeSem.value?.id) }
function className(gpa: number) { return gpa >= 3.5 ? 'First Class' : gpa >= 3 ? 'Second Class Upper' : gpa >= 2.5 ? 'Second Class Lower' : gpa >= 2 ? 'Third Class' : 'Below Average' }
function printReport() {
  if (reportType.value !== 'individual' || !officialResults.value.length) {
    window.print()
    return
  }

  printingOfficialResult.value = true
  void nextTick(() => {
    const finishPrinting = () => { printingOfficialResult.value = false }
    window.addEventListener('afterprint', finishPrinting, { once: true })
    window.print()
  })
}
</script>
<template>
  <div class="space-y-5"><div class="bg-white border border-navy-100 rounded-xl p-5 no-print"><div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4"><label class="text-xs font-medium">Programme<select v-model="selProg" class="w-full border border-navy-200 rounded-lg px-3 py-2 mt-1"><option v-for="item in programmes" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium">Session<select v-model="selSession" class="w-full border border-navy-200 rounded-lg px-3 py-2 mt-1"><option v-for="item in sessions" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="text-xs font-medium">Semester<select v-model="selSem" class="w-full border border-navy-200 rounded-lg px-3 py-2 mt-1"><option v-for="item in filteredSems" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label v-if="reportType === 'individual'" class="text-xs font-medium">Student<select v-model="selStudent" class="w-full border border-navy-200 rounded-lg px-3 py-2 mt-1"><option v-for="item in (reportStudents.length ? reportStudents : semStudents)" :key="item.id" :value="item.id">{{ item.name }}</option></select></label></div><div class="flex flex-wrap gap-2 justify-between"><div class="flex gap-2 flex-wrap"><button v-for="item in reportTypes" :key="item.id" class="px-3 py-1.5 rounded-lg text-xs font-medium" :class="reportType === item.id ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-600'" @click="selectReportType(item.id)">{{ item.label }}</button></div><button class="bg-gold-400 text-navy-950 px-4 py-1.5 rounded-lg text-xs font-medium" @click="printReport">🖨 Print / PDF</button></div></div>
  <div v-if="!printingOfficialResult" class="bg-white border border-navy-100 rounded-xl overflow-hidden" id="report-area"><div class="px-6 py-5 bg-navy-900 text-white text-center"><img :src="universityLogo" :alt="`${universityName} logo`" class="w-18 h-18 object-contain mx-auto mb-3" /><div class="font-serif text-xl font-bold">{{ universityName }}, Monrovia</div><div class="text-navy-300 text-xs mt-1 uppercase">Examination & Result Management System</div><div class="mt-3 text-sm">{{ programme?.name }} · {{ session?.name }} · {{ activeSem?.name }}</div><div class="text-navy-400 text-xs mt-1">{{ reportTypes.find(item => item.id === reportType)?.label }}</div></div><div class="p-6 overflow-x-auto">
    <table v-if="reportType === 'classwise'" class="w-full text-sm border-collapse"><thead><tr class="bg-navy-50 text-xs uppercase"><th class="px-4 py-3 text-left border">Roll No.</th><th class="px-4 py-3 text-left border">Student Name</th><th v-for="subject in semSubjects" :key="subject.id" class="px-3 py-3 border">{{ subject.code }}</th><th class="px-3 py-3 border">GPA</th><th class="px-3 py-3 border">Result</th></tr></thead><tbody><tr v-for="student in semStudents" :key="student.id"><td class="px-4 py-3 border font-mono text-xs">{{ student.rollNumber }}</td><td class="px-4 py-3 border font-medium">{{ student.name }}</td><td v-for="subject in semSubjects" :key="subject.id" class="px-3 py-3 border text-center">{{ entryFor(student.id, subject.id)?.totalMarks ?? '—' }}<span v-if="entryFor(student.id, subject.id)" class="block text-xs" :class="gradeColor(entryFor(student.id, subject.id)!.grade)">{{ entryFor(student.id, subject.id)?.grade }}</span></td><td class="px-3 py-3 border text-center">{{ semResults.find(result => result.studentId === student.id)?.gpa.toFixed(2) ?? '—' }}</td><td class="px-3 py-3 border text-center">{{ semResults.find(result => result.studentId === student.id)?.overallStatus?.toUpperCase() ?? '—' }}</td></tr></tbody></table>
    <div v-else-if="reportType === 'individual' && selectedStudent" class="max-w-3xl mx-auto"><div class="bg-navy-50 p-5 grid grid-cols-2 gap-4 text-sm"><div><span class="text-navy-400">Student</span><b class="block">{{ selectedStudent.name }}</b></div><div><span class="text-navy-400">Roll Number</span><b class="block">{{ selectedStudent.rollNumber }}</b></div><div><span class="text-navy-400">Student ID</span><b class="block">{{ selectedStudent.studentId }}</b></div><div><span class="text-navy-400">Programme</span><b class="block">{{ programme?.name }}</b></div></div><table class="w-full text-sm"><thead><tr class="bg-navy-800 text-white text-xs"><th class="px-4 py-3 text-left">Subject</th><th class="px-3 py-3">Marks</th><th class="px-3 py-3">Grade</th><th class="px-3 py-3">Points</th><th class="px-3 py-3">Status</th></tr></thead><tbody><tr v-for="subject in semSubjects" :key="subject.id"><td class="px-4 py-3">{{ subject.title }}</td><td class="px-3 py-3 text-center">{{ entryFor(selectedStudent.id, subject.id)?.totalMarks ?? '—' }}</td><td class="px-3 py-3 text-center" :class="entryFor(selectedStudent.id, subject.id) ? gradeColor(entryFor(selectedStudent.id, subject.id)!.grade) : ''">{{ entryFor(selectedStudent.id, subject.id)?.grade ?? '—' }}</td><td class="px-3 py-3 text-center">{{ entryFor(selectedStudent.id, subject.id)?.gradePoint.toFixed(1) ?? '—' }}</td><td class="px-3 py-3 text-center">{{ entryFor(selectedStudent.id, subject.id)?.status?.toUpperCase() ?? '—' }}</td></tr></tbody><tfoot v-if="selectedResult"><tr class="bg-navy-900 text-white"><td colspan="3" class="px-4 py-3">Semester Result</td><td class="px-3 py-3">GPA {{ selectedResult.gpa.toFixed(2) }}</td><td class="px-3 py-3">{{ selectedResult.overallStatus.toUpperCase() }}</td></tr></tfoot></table></div>
    <div v-else-if="reportType === 'passfail'"><div class="grid grid-cols-3 gap-4 mb-6"><div v-for="item in [['Total Students', semStudents.length], ['Pass', semResults.filter(result => result.overallStatus === 'pass').length], ['Fail', semResults.filter(result => result.overallStatus === 'fail').length]]" :key="item[0]" class="bg-navy-50 rounded-lg p-4 text-center"><div class="text-3xl font-serif font-bold">{{ item[1] }}</div><div class="text-xs text-navy-500">{{ item[0] }}</div></div></div><table class="w-full text-sm"><thead><tr class="bg-navy-50 text-xs"><th class="p-3 text-left">Roll No.</th><th class="p-3 text-left">Student</th><th class="p-3">GPA</th><th class="p-3">Credits</th><th class="p-3">Result</th></tr></thead><tbody><tr v-for="student in semStudents" :key="student.id"><td class="p-3">{{ student.rollNumber }}</td><td class="p-3">{{ student.name }}</td><td class="p-3 text-center">{{ semResults.find(result => result.studentId === student.id)?.gpa.toFixed(2) ?? '—' }}</td><td class="p-3 text-center">{{ semResults.find(result => result.studentId === student.id)?.earnedCredits ?? '—' }}</td><td class="p-3 text-center">{{ semResults.find(result => result.studentId === student.id)?.overallStatus?.toUpperCase() ?? '—' }}</td></tr></tbody></table></div>
    <table v-else-if="reportType === 'pending' || reportType === 'published'" class="w-full text-sm"><thead><tr class="bg-navy-50 text-xs"><th class="p-3 text-left">Student</th><th class="p-3 text-left">Student ID</th><th class="p-3">GPA</th><th class="p-3">CGPA</th><th class="p-3">Result</th><th class="p-3">Status</th></tr></thead><tbody><tr v-for="result in semResults.filter(item => reportType === 'pending' ? item.publicationStatus !== 'published' : item.publicationStatus === 'published')" :key="result.id"><td class="p-3">{{ students.find(student => student.id === result.studentId)?.name }}</td><td class="p-3 font-mono text-xs">{{ students.find(student => student.id === result.studentId)?.studentId }}</td><td class="p-3 text-center font-mono">{{ result.gpa.toFixed(2) }}</td><td class="p-3 text-center font-mono">{{ result.cgpa.toFixed(2) }}</td><td class="p-3 text-center">{{ result.overallStatus.toUpperCase() }}</td><td class="p-3 text-center"><span class="rounded-full px-2 py-0.5 text-xs" :class="result.publicationStatus === 'published' ? 'bg-emerald-50 text-emerald-700' : result.publicationStatus === 'approved' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'">{{ result.publicationStatus }}</span></td></tr></tbody></table>
    <table v-else-if="reportType === 'gpa'" class="w-full text-sm"><thead><tr class="bg-navy-50 text-xs"><th class="p-3">Rank</th><th class="p-3 text-left">Student</th><th class="p-3 text-left">Roll No.</th><th class="p-3">GPA</th><th class="p-3">CGPA</th><th class="p-3">Class</th></tr></thead><tbody><tr v-for="(result, index) in [...semResults].sort((a, b) => b.gpa - a.gpa)" :key="result.id"><td class="p-3 text-center">{{ index + 1 }}</td><td class="p-3">{{ students.find(student => student.id === result.studentId)?.name }}</td><td class="p-3">{{ students.find(student => student.id === result.studentId)?.rollNumber }}</td><td class="p-3 text-center font-bold">{{ result.gpa.toFixed(2) }}</td><td class="p-3 text-center">{{ result.cgpa.toFixed(2) }}</td><td class="p-3 text-center">{{ className(result.gpa) }}</td></tr></tbody></table>
    <div v-else class="space-y-6"><div v-for="subject in semSubjects" :key="subject.id" class="border border-navy-100 rounded-lg overflow-hidden"><div class="bg-navy-800 text-white px-5 py-3"><span class="font-mono">{{ subject.code }}</span> · {{ subject.title }}</div><table class="w-full text-sm"><thead><tr class="bg-navy-50 text-xs"><th class="p-3 text-left">Student</th><th v-for="component in subject.components" :key="component.name" class="p-3">{{ component.name }}</th><th class="p-3">Total</th><th class="p-3">Grade</th></tr></thead><tbody><tr v-for="student in semStudents" :key="student.id"><td class="p-3">{{ student.name }}</td><td v-for="component in subject.components" :key="component.name" class="p-3 text-center">{{ entryFor(student.id, subject.id)?.components[component.name] ?? '—' }}</td><td class="p-3 text-center">{{ entryFor(student.id, subject.id)?.totalMarks ?? '—' }}</td><td class="p-3 text-center">{{ entryFor(student.id, subject.id)?.grade ?? '—' }}</td></tr></tbody></table></div></div>
  </div><div class="px-6 py-4 bg-navy-50 border-t text-xs text-navy-400 flex justify-between"><span>{{ universityName }} — Examination & Result Management System</span><span>Generated: {{ new Date().toLocaleDateString('en-LR') }}</span></div></div>
  </div>
  <div v-if="!printingOfficialResult" id="report-print-footer" class="report-print-only">
    <div class="report-grade-scale">
      <div v-for="scale in gradeScale" :key="scale[0]" class="report-grade-cell">
        <strong>{{ scale[0] }}</strong><span>{{ scale[1] }}</span><span>GP {{ scale[2] }}</span>
      </div>
    </div>
    <div v-if="(resultAssets.headExamSignatureEnabled && resultAssets.headExamSignature) || (resultAssets.authorizedSignatureEnabled && resultAssets.authorizedSignature) || (resultAssets.officialStampEnabled && resultAssets.officialStamp)" class="report-signature-footer">
      <div class="report-signature-block report-signature-left">
        <img v-if="resultAssets.headExamSignatureEnabled && resultAssets.headExamSignature" :src="resultAssets.headExamSignature" alt="Head of Examination signature" class="report-signature-image" />
        <div class="report-signature-line"></div>
        <div class="report-signature-label">Head of Examination</div>
      </div>
      <div v-if="resultAssets.officialStampEnabled && resultAssets.officialStamp" class="report-stamp-block">
        <img :src="resultAssets.officialStamp" alt="Official university stamp" class="report-stamp-image" />
      </div>
      <div class="report-signature-block report-signature-right">
        <img v-if="resultAssets.authorizedSignatureEnabled && resultAssets.authorizedSignature" :src="resultAssets.authorizedSignature" :alt="`${resultAssets.authorizedSignatureLabel} signature`" class="report-signature-image" />
        <div class="report-signature-line"></div>
        <div class="report-signature-label">{{ resultAssets.authorizedSignatureLabel }}</div>
      </div>
    </div>
  </div>
  <div v-if="printingOfficialResult && selectedStudent && officialResults.length" id="result-print" class="report-official-print space-y-6">
    <div id="result-card" class="overflow-hidden rounded-2xl bg-white">
      <img :src="universityLogo" alt="" aria-hidden="true" class="result-watermark" />
      <div class="bg-blue-950 px-6 py-5">
        <div class="flex items-center justify-center gap-5">
          <img :src="universityLogo" :alt="`${universityName} logo`" class="h-32 w-32 shrink-0 object-contain" />
          <div class="text-left">
            <div class="mb-2 text-3x6 font-bold uppercase tracking-widest text-blue-400">{{ universityName }} Monrovia, Liberia</div>
            <div class="font-serif text-xl font-bold text-white">Official Semester Result Statement</div>
            <div class="mt-1 text-xs text-navy-400">This result is published and verified by the Examination Office</div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 bg-navy-50 px-6 py-4 text-sm sm:grid-cols-4">
        <div v-for="item in [['Student Name', selectedStudent.name], ['Roll Number', selectedStudent.rollNumber], ['Student ID', selectedStudent.studentId], ['Email', selectedStudent.email]]" :key="item[0]">
          <div class="text-xs text-blue-700">{{ item[0] }}</div>
          <div class="text-sm font-medium text-blue-900">{{ item[1] }}</div>
        </div>
      </div>
      <div v-if="latestOfficialResult" class="flex items-center justify-between gap-4 bg-blue-950 px-6 py-4">
        <div class="flex gap-8">
          <div><div class="text-xs text-blue-200">Latest Semester GPA</div><div class="font-serif text-2xl font-bold text-white">{{ latestOfficialResult.result.gpa.toFixed(2) }}</div></div>
          <div><div class="text-xs text-blue-300">Cumulative CGPA</div><div class="font-serif text-2xl font-bold text-gold-400">{{ latestOfficialResult.result.cgpa.toFixed(2) }}</div></div>
          <div><div class="text-xs text-blue-300">Overall Status</div><div class="font-serif text-lg font-bold" :class="latestOfficialResult.result.overallStatus === 'pass' ? 'text-emerald-400' : 'text-red-400'">{{ latestOfficialResult.result.overallStatus.toUpperCase() }}</div></div>
        </div>
      </div>
      <div v-for="item in officialResults" :key="item.result.id" class="border-t border-navy-100">
        <div class="flex items-center justify-between bg-blue-50 px-6 py-3">
          <div class="font-serif font-semibold text-blue-900">{{ item.semester.name }}</div>
          <div class="flex gap-4 text-xs text-blue-500"><span>GPA: <b>{{ item.result.gpa.toFixed(2) }}</b></span><span>Credits: <b>{{ item.result.earnedCredits }}/{{ item.result.totalCredits }}</b></span><span class="rounded-full px-2 py-0.5 font-medium" :class="item.result.overallStatus === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">{{ item.result.overallStatus.toUpperCase() }}</span></div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-navy-100 text-left text-xs uppercase text-blue-500"><th class="px-6 py-2.5">Subject</th><th class="px-4 py-2.5">Code</th><th class="px-4 py-2.5 text-center">Marks</th><th class="px-4 py-2.5 text-center">%</th><th class="px-4 py-2.5 text-center">Grade</th><th class="px-4 py-2.5 text-center">Points</th><th class="px-4 py-2.5 text-center">Credits</th><th class="px-4 py-2.5 text-center">Status</th></tr></thead>
            <tbody class="divide-y divide-navy-50">
              <tr v-for="entry in item.entries" :key="entry.id" class="hover:bg-navy-50/50">
                <template v-if="item.subjects.find(subject => subject.id === entry.subjectId)">
                  <td class="px-6 py-3 text-blue-800">{{ item.subjects.find(subject => subject.id === entry.subjectId)?.title }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-blue-500">{{ item.subjects.find(subject => subject.id === entry.subjectId)?.code }}</td>
                  <td class="px-4 py-3 text-center font-mono">{{ entry.totalMarks }}/{{ item.subjects.find(subject => subject.id === entry.subjectId)?.components.reduce((sum, component) => sum + component.maxMarks, 0) }}</td>
                  <td class="px-4 py-3 text-center font-mono">{{ entry.percentage }}%</td>
                  <td class="px-4 py-3 text-center"><span class="inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold" :class="gradeColor(entry.grade)">{{ entry.grade }}</span></td>
                  <td class="px-4 py-3 text-center font-mono">{{ entry.gradePoint.toFixed(1) }}</td>
                  <td class="px-4 py-3 text-center font-mono">{{ item.subjects.find(subject => subject.id === entry.subjectId)?.credits }}</td>
                  <td class="px-4 py-3 text-center"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="entry.status === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">{{ entry.status.toUpperCase() }}</span></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex items-center justify-between border-t border-navy-100 bg-blue-50 px-6 py-4 text-xs text-blue-400"><span>Published by {{ universityName }} Examination Office</span><span>Verified: {{ latestOfficialResult?.result.publishedAt ? new Date(latestOfficialResult.result.publishedAt).toLocaleDateString('en-LR') : '—' }}</span></div>
      <div v-if="resultAssets.headExamSignatureEnabled || resultAssets.authorizedSignatureEnabled || resultAssets.officialStampEnabled" class="result-signatures border-t border-navy-100 px-6 py-5">
        <div class="signature-block head-signature-block">
          <img v-if="resultAssets.headExamSignatureEnabled && resultAssets.headExamSignature" :src="resultAssets.headExamSignature" alt="Head of Examination signature" class="signature-image" />
          <div class="signature-rule"></div><div class="signature-label">Head of Examination</div>
        </div>
        <div v-if="resultAssets.officialStampEnabled && resultAssets.officialStamp" class="stamp-block"><img :src="resultAssets.officialStamp" alt="Official university stamp" class="stamp-image" /></div>
        <div class="signature-block authorized-signature-block">
          <img v-if="resultAssets.authorizedSignatureEnabled && resultAssets.authorizedSignature" :src="resultAssets.authorizedSignature" :alt="`${resultAssets.authorizedSignatureLabel} signature`" class="signature-image" />
          <div class="signature-rule"></div><div class="signature-label">{{ resultAssets.authorizedSignatureLabel }}</div>
        </div>
      </div>
    </div>
    <div class="rounded-xl border border-blue-800 bg-blue-900 p-5">
      <div class="mb-3 text-xs font-medium uppercase tracking-wider text-white">Grading Scale</div>
      <div class="grid grid-cols-4 gap-2 text-center text-xs sm:grid-cols-8">
        <div v-for="scale in gradeScale" :key="scale[0]" class="rounded p-2" :class="scale[0] === 'F' ? 'bg-red-900/30' : 'bg-blue-900'">
          <div class="font-mono font-bold" :class="scale[0] === 'F' ? 'text-red-400' : 'text-gold-400'">{{ scale[0] }}</div><div class="mt-0.5 text-blue-200">{{ scale[1] }}</div><div class="text-white">GP {{ scale[2] }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
