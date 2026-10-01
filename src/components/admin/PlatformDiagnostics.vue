<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSystemDiagnosticsRequest, type SystemDiagnostics } from '../../services/api'

const diagnostics = ref<SystemDiagnostics | null>(null)
const checking = ref(false)
const error = ref('')
const siteOrigin = window.location.origin
const buildMode = import.meta.env.MODE

async function checkHealth() {
  if (checking.value) return
  checking.value = true
  error.value = ''
  try {
    const response = await getSystemDiagnosticsRequest()
    diagnostics.value = response.data
  } catch {
    error.value = 'Unable to complete the platform health check. Verify your admin session and API connection.'
  } finally {
    checking.value = false
  }
}

onMounted(() => { void checkHealth() })
</script>

<template>
  <section class="rounded-xl border border-navy-100 bg-white p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="font-serif font-semibold text-navy-900">Platform Health</h3>
        <p class="mt-1 text-xs text-navy-500">Live API and database connectivity, plus platform runtime details.</p>
      </div>
      <button type="button" class="rounded-lg border border-navy-200 px-3 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50 disabled:cursor-wait disabled:opacity-60" :disabled="checking" @click="checkHealth">
        {{ checking ? 'Checking…' : '↻ Refresh' }}
      </button>
    </div>

    <div v-if="error" role="status" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ error }}</div>

    <div v-if="diagnostics" class="mt-5 space-y-5">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-navy-100 p-4">
          <div class="text-xs text-navy-500">API</div>
          <div class="mt-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {{ diagnostics.apiStatus }}
          </div>
          <div class="mt-1 text-xs text-navy-500">{{ diagnostics.apiPlatform }}</div>
        </div>
        <div class="rounded-lg border border-navy-100 p-4">
          <div class="text-xs text-navy-500">Database</div>
          <div class="mt-2 flex items-center gap-2 text-sm font-semibold capitalize text-navy-900">
            <span class="h-2.5 w-2.5 rounded-full" :class="diagnostics.databaseStatus === 'operational' ? 'bg-emerald-500' : 'bg-red-500'" />
            {{ diagnostics.databaseStatus }}
          </div>
          <div class="mt-1 text-xs text-navy-500">{{ diagnostics.databasePlatform }} · {{ diagnostics.databaseLatencyMs }} ms</div>
        </div>
      </div>

      <div>
        <h4 class="mb-3 text-xs font-semibold uppercase text-navy-500">Platform Details</h4>
        <dl class="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
          <div class="flex justify-between gap-3"><dt class="text-navy-500">Frontend</dt><dd class="text-right font-medium text-navy-800">Vue 3 · Vite ({{ buildMode }})</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-navy-500">Edge runtime</dt><dd class="text-right font-medium text-navy-800">{{ diagnostics.edgeRuntime }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-navy-500">Database engine</dt><dd class="text-right font-medium text-navy-800">PostgreSQL</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-navy-500">Site origin</dt><dd class="max-w-[65%] truncate text-right font-medium text-navy-800" :title="siteOrigin">{{ siteOrigin }}</dd></div>
        </dl>
        <p class="mt-3 text-[11px] text-navy-400">Last checked {{ new Date(diagnostics.checkedAt).toLocaleString() }}</p>
      </div>
    </div>

    <div v-else-if="checking" class="mt-5 text-xs text-navy-500">Checking API and database connectivity…</div>
  </section>
</template>
