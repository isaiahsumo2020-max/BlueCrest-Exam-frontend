<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/appStore'

const ADMIN_GROUPS = [
  { label: 'Overview', items: [['admin-dashboard', 'Dashboard', 'D']] },
  { label: 'Academic Setup', items: [['academic-setup', 'Academic Setup', 'A']] },
  { label: 'Student Management', items: [['student-management', 'Students', 'S']] },
  { label: 'Marks Management', items: [['marks-entry', 'Marks Entry', 'M'], ['marks-review', 'Marks Review', 'M']] },
  { label: 'Result Management', items: [['result-processing', 'Result Processing', 'R'], ['result-approval', 'Result Approval', '✓'], ['result-publication', 'Publication', 'P']] },
  { label: 'Reports', items: [['reports', 'Reports', 'R']] },
  { label: 'Administration', items: [['user-management', 'User Management', '👤'], ['audit-log', 'Audit Log', 'A'], ['communication', 'Messages & Notifications', '✉'], ['system-settings', 'System Settings', '⚙']] },
]
const STAFF_GROUPS = [
  { label: 'Workspace', items: [['staff-dashboard', 'Dashboard', 'D']] },
  { label: 'Academic Records', items: [['staff-students', 'Students', 'S'], ['staff-courses', 'Courses / Subjects', 'C']] },
  { label: 'Marks Management', items: [['marks-entry', 'Marks Entry', 'M'], ['marks-review', 'Marks Review', 'M']] },
  { label: 'Result Management', items: [['result-processing', 'Result Processing', 'R'], ['result-verification', 'Result Verification', 'V']] },
  { label: 'Reports', items: [['reports', 'Reports', 'R'], ['communication', 'Messages & Notifications', '✉']] },
]
const STUDENT_GROUPS = [
  { label: 'Dashboard', items: [['student-dashboard', 'Dashboard', 'D']] },
  { label: 'Academic', items: [['student-profile', 'My Profile', 'P'], ['student-courses', 'My Courses', 'C'], ['student-results', 'Semester Results', 'R'], ['student-history', 'Academic History', 'H']] },
  { label: 'Documents', items: [['student-transcript', 'Transcript / Download', 'T']] },
]
const { currentUser, currentPage, navigate, logout, auditLogs, messages } = useAppStore()
const sidebarOpen = ref(false)
const expandedGroups = ref<string[]>(['Overview', 'Academic Setup', 'Student Management', 'Marks Management', 'Result Management', 'Reports', 'Administration', 'Workspace', 'Academic Records', 'Documents', 'Dashboard', 'Academic', 'Communication', 'Account'])
const navGroups = computed(() => currentUser.value?.role === 'admin' ? ADMIN_GROUPS : currentUser.value?.role === 'student' ? STUDENT_GROUPS : STAFF_GROUPS)
const navItems = computed(() => navGroups.value.flatMap(group => group.items))
const staffPagePermissions: Record<string, string | undefined> = { 'staff-students': 'view_students', 'staff-courses': 'view_students', 'marks-entry': 'marks_entry', 'marks-review': 'marks_entry', 'result-processing': 'result_processing', reports: 'reports' }
const visibleNavGroups = computed(() => navGroups.value.map(group => ({ ...group, items: group.items.filter(item => { const permission = staffPagePermissions[item[0]]; const user = currentUser.value; return user?.role !== 'staff' || !permission || user.permissions.includes(permission) }) })).filter(group => group.items.length))
const initials = computed(() => currentUser.value?.name.split(' ').map(name => name[0]).slice(0, 2).join(''))
const unreadCount = computed(() => {
  if (currentUser.value?.role === 'admin') return auditLogs.value.filter(log => log.userId !== currentUser.value?.id && log.action !== 'SEND_MESSAGE').length + messages.value.filter(item => item.recipientId === currentUser.value?.id && !item.readAt).length
  return messages.value.filter(item => item.recipientId === currentUser.value?.id && !item.readAt).length
})
function toggleGroup(label: string) { expandedGroups.value = expandedGroups.value.includes(label) ? expandedGroups.value.filter(item => item !== label) : [...expandedGroups.value, label] }
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-navy-50">
    <aside class="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-950 flex flex-col transform transition-transform duration-200" :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      <div class="flex items-center gap-3 px-5 py-5 border-b border-[#1d2d4d]"><img src="/images/BlueCrest University.png" alt="BlueCrest University logo" class="w-11 h-11 object-contain" /><div class="min-w-0"><div class="text-white font-serif text-sm font-semibold truncate">BlueCrest University</div><div class="text-white/65 text-xs truncate">Examination ERP</div></div></div>
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-3"><div v-for="group in visibleNavGroups" :key="group.label"><button v-if="group.items.length > 1 || currentUser?.role === 'admin'" class="mb-1 flex w-full items-center justify-between px-3 text-[10px] font-semibold uppercase tracking-wider text-white/60" @click="toggleGroup(group.label)"><span>{{ group.label }}</span><span>{{ expandedGroups.includes(group.label) ? '−' : '+' }}</span></button><div v-if="expandedGroups.includes(group.label) || group.items.length === 1 && currentUser?.role !== 'admin'" class="space-y-0.5"><button v-for="item in group.items" v-show="expandedGroups.includes(group.label) || group.items.length === 1" :key="item[0]" class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white transition-all" :class="currentPage === item[0] ? 'bg-[#f28c00] text-white font-medium shadow-sm' : 'text-white/70 hover:bg-[#172846] hover:text-white'" @click="navigate(item[0]); sidebarOpen = false"><span class="w-5 text-center text-base">{{ item[2] }}</span><span class="truncate">{{ item[1] }}</span></button></div></div></nav>
      <div class="border-t border-[#1d2d4d] p-4"><div class="flex items-center gap-3 mb-3"><div class="w-8 h-8 rounded-full bg-[#20375c] flex items-center justify-center text-white text-xs font-semibold">{{ initials }}</div><div class="min-w-0"><div class="text-white text-xs font-medium truncate">{{ currentUser?.name }}</div><div class="text-white/60 text-xs capitalize">{{ currentUser?.role }}</div></div></div><button class="w-full text-left text-white/65 hover:text-white text-xs py-1 flex items-center gap-2" @click="logout"><span>→</span> Sign Out</button></div>
    </aside>
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false" />
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="bg-white border-b border-navy-100 px-6 py-3 flex items-center justify-between shrink-0 no-print"><div class="flex items-center gap-4"><button class="lg:hidden text-navy-600 hover:text-navy-900" @click="sidebarOpen = !sidebarOpen">☰</button><div><h1 class="text-navy-900 font-serif font-semibold text-base leading-tight">{{ navItems.find(item => item[0] === currentPage)?.[1] ?? 'Dashboard' }}</h1><p class="text-navy-400 text-xs">{{ new Date().toLocaleDateString('en-LR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p></div></div><div class="flex items-center gap-3"><button class="relative rounded-lg border border-navy-100 px-3 py-1.5 text-xs text-navy-600 hover:border-gold-300" title="Open notifications and messages" @click="navigate('communication')">Notifications<span v-if="unreadCount" class="ml-2 rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-navy-950">{{ unreadCount }}</span></button><span class="hidden sm:block text-xs text-navy-400 bg-navy-50 border border-navy-100 px-3 py-1 rounded-full">Session: 2024–2025</span><div class="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-white text-xs font-semibold">{{ initials }}</div></div></header>
      <main class="flex-1 overflow-y-auto p-6"><slot /></main>
    </div>
  </div>
</template>
