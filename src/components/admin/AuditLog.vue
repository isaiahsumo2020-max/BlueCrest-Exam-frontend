<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/appStore'
const { auditLogs } = useAppStore()
const search = ref(''); const actionFilter = ref(''); const selectedLog = ref<typeof auditLogs.value[number] | null>(null)
const actions = computed(() => [...new Set(auditLogs.value.map(log => log.action))].sort())
const filteredLogs = computed(() => auditLogs.value.filter(log => (!search.value || `${log.userName} ${log.details} ${log.action}`.toLowerCase().includes(search.value.toLowerCase())) && (!actionFilter.value || log.action === actionFilter.value)))
const actionColor: Record<string, string> = {
  PUBLISH_RESULT: 'bg-gold-50 text-gold-700 border-gold-200',
  APPROVE_RESULT: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESS_RESULTS: 'bg-purple-50 text-purple-700 border-purple-200',
  MARKS_ENTRY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CREATE_STUDENT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  UPDATE_STUDENT: 'bg-teal-50 text-teal-700 border-teal-200',
}
</script>
<template>
  <div class="space-y-5">
    <div class="bg-white border border-navy-100 rounded-xl p-5"><div class="flex flex-col gap-3 md:flex-row"><input v-model="search" class="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm" placeholder="Search user, action, or description" /><select v-model="actionFilter" class="rounded-lg border border-navy-200 px-3 py-2 text-sm"><option value="">All actions</option><option v-for="action in actions" :key="action" :value="action">{{ action.replace(/_/g, ' ') }}</option></select></div><p class="mt-3 text-xs text-navy-400">{{ filteredLogs.length }} historical record{{ filteredLogs.length === 1 ? '' : 's' }} shown. Audit records cannot be edited from this interface.</p></div>
    <div class="bg-white border border-navy-100 rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-navy-500 uppercase tracking-wider border-b border-navy-100 text-left bg-navy-50/50"><th class="px-5 py-3">Timestamp</th><th class="px-5 py-3">User</th><th class="px-5 py-3">Action</th><th class="px-5 py-3">Module</th><th class="px-5 py-3">Description</th><th /></tr></thead><tbody class="divide-y divide-navy-50"><tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-navy-50/40"><td class="px-5 py-3.5 text-navy-400 text-xs font-mono whitespace-nowrap">{{ new Date(log.timestamp).toLocaleString('en-LR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</td><td class="px-5 py-3.5 text-navy-800 text-xs font-medium">{{ log.userName }}</td><td class="px-5 py-3.5"><span class="text-xs px-2 py-0.5 rounded-full border font-mono" :class="actionColor[log.action] ?? 'bg-gray-50 text-gray-600 border-gray-200'">{{ log.action }}</span></td><td class="px-5 py-3.5 text-xs text-navy-500">{{ log.entity }}</td><td class="px-5 py-3.5 text-navy-600 text-xs">{{ log.details }}</td><td class="px-5 py-3.5"><button class="text-xs text-navy-600" @click="selectedLog = log">View</button></td></tr><tr v-if="filteredLogs.length === 0"><td colspan="6" class="px-5 py-12 text-center text-navy-400">No audit records found.</td></tr></tbody></table></div></div>
    <div v-if="selectedLog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div class="w-full max-w-lg rounded-xl bg-white shadow-xl"><div class="flex items-center justify-between border-b border-navy-100 p-5"><h3 class="font-serif font-semibold text-navy-900">Audit Record Detail</h3><button class="text-xl text-navy-400" @click="selectedLog = null">×</button></div><div class="grid grid-cols-2 gap-4 p-5 text-sm"><div><div class="text-xs text-navy-400">User</div><div class="font-medium">{{ selectedLog.userName }}</div></div><div><div class="text-xs text-navy-400">Action</div><div class="font-medium">{{ selectedLog.action }}</div></div><div><div class="text-xs text-navy-400">Module</div><div class="font-medium">{{ selectedLog.entity }}</div></div><div><div class="text-xs text-navy-400">Date/Time</div><div class="font-medium">{{ new Date(selectedLog.timestamp).toLocaleString('en-LR') }}</div></div><div class="col-span-2"><div class="text-xs text-navy-400">Description</div><div class="mt-1 rounded-lg bg-navy-50 p-3 text-navy-700">{{ selectedLog.details }}</div></div></div></div></div>
  </div>
</template>
