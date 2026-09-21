<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import Login from './components/Login.vue'
import StudentVerification from './components/StudentVerification.vue'
import AppShell from './components/layout/AppShell.vue'
import AdminDashboard from './components/admin/Dashboard.vue'
import UserManagement from './components/admin/UserManagement.vue'
import AuditLog from './components/admin/AuditLog.vue'
import SystemSettings from './components/admin/SystemSettings.vue'
import AcademicSetup from './components/admin/AcademicSetup.vue'
import StudentManagement from './components/admin/StudentManagement.vue'
import MarksEntry from './components/admin/MarksEntry.vue'
import MarksReview from './components/admin/MarksReview.vue'
import ResultProcessing from './components/admin/ResultProcessing.vue'
import ResultApproval from './components/admin/ResultApproval.vue'
import ResultPublication from './components/admin/ResultPublication.vue'
import Reports from './components/admin/Reports.vue'
import Communication from './components/Communication.vue'
import StaffDashboard from './components/staff/StaffDashboard.vue'
import StaffStudents from './components/staff/StaffStudents.vue'
import StaffCourses from './components/staff/StaffCourses.vue'
import StaffResultVerification from './components/staff/StaffResultVerification.vue'
import StudentDashboard from './components/student/StudentDashboard.vue'
import StudentProfile from './components/student/StudentProfile.vue'
import { hydrateFromApi, useAppStore } from './stores/appStore'

const { currentUser, currentPage, navigate } = useAppStore()
const vuePages = ['admin-dashboard', 'staff-dashboard', 'staff-students', 'staff-courses', 'result-verification', 'student-dashboard', 'student-profile', 'student-courses', 'student-results', 'student-history', 'student-transcript', 'user-management', 'audit-log', 'system-settings', 'academic-setup', 'student-management', 'marks-entry', 'marks-review', 'result-processing', 'result-approval', 'result-publication', 'reports', 'communication']
const isVuePage = computed(() => vuePages.includes(currentPage.value))
const staffPages = ['staff-dashboard', 'staff-students', 'staff-courses', 'marks-entry', 'marks-review', 'result-processing', 'result-verification', 'reports', 'communication']
const staffPagePermissions: Record<string, string | undefined> = {
  'staff-students': 'view_students',
  'staff-courses': 'view_students',
  'marks-entry': 'marks_entry',
  'marks-review': 'marks_entry',
  'result-processing': 'result_processing',
  reports: 'reports',
}
const studentPages = ['student-dashboard', 'student-profile', 'student-courses', 'student-results', 'student-history', 'student-transcript']
const canAccessPage = computed(() => {
  const user = currentUser.value
  const permission = staffPagePermissions[currentPage.value]
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'student') return studentPages.includes(currentPage.value)
  return staffPages.includes(currentPage.value) && (!permission || user.permissions.includes(permission))
})
watch([currentUser, currentPage], ([user, page]) => {
  const permission = staffPagePermissions[page]
  if (user?.role === 'staff' && (!staffPages.includes(page) || (permission && !user.permissions.includes(permission)))) navigate('staff-dashboard')
  if (user?.role === 'student' && !studentPages.includes(page)) navigate('student-dashboard')
})
onMounted(async () => {
  try {
    await hydrateFromApi()
  } catch (error) { console.error('Backend unavailable. Start the Express API before using the application.', error) }
})

</script>

<template>
  <StudentVerification v-if="currentPage === 'student-verification'" />
  <Login v-else-if="!currentUser" />
  <AppShell v-else-if="isVuePage && canAccessPage">
    <AdminDashboard v-if="currentPage === 'admin-dashboard'" />
    <StaffDashboard v-else-if="currentPage === 'staff-dashboard'" />
    <StaffStudents v-else-if="currentPage === 'staff-students'" />
    <StaffCourses v-else-if="currentPage === 'staff-courses'" />
    <StaffResultVerification v-else-if="currentPage === 'result-verification'" />
    <StudentDashboard v-else-if="currentPage === 'student-dashboard'" />
    <StudentProfile v-else-if="currentPage === 'student-profile'" />
    <UserManagement v-else-if="currentPage === 'user-management'" />
    <AuditLog v-else-if="currentPage === 'audit-log'" />
    <SystemSettings v-else-if="currentPage === 'system-settings'" />
    <AcademicSetup v-else-if="currentPage === 'academic-setup'" />
    <StudentManagement v-else-if="currentPage === 'student-management'" />
    <MarksEntry v-else-if="currentPage === 'marks-entry'" />
    <MarksReview v-else-if="currentPage === 'marks-review'" />
    <ResultProcessing v-else-if="currentPage === 'result-processing'" />
    <ResultApproval v-else-if="currentPage === 'result-approval'" />
    <ResultPublication v-else-if="currentPage === 'result-publication'" />
    <Communication v-else-if="currentPage === 'communication'" />
    <Reports v-else />
  </AppShell>
  <Login v-else />
</template>
