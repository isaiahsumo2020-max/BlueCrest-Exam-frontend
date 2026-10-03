<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { uploadImageRequest } from '../../services/api'

const { schoolSettings, saveSchoolSettings, addAuditLog } = useAppStore()
const form = reactive({
  headExamSignature: schoolSettings.value.headExamSignature,
  headExamSignatureEnabled: schoolSettings.value.headExamSignatureEnabled,
  authorizedSignature: schoolSettings.value.authorizedSignature,
  authorizedSignatureEnabled: schoolSettings.value.authorizedSignatureEnabled,
  authorizedSignatureLabel: schoolSettings.value.authorizedSignatureLabel,
  officialStamp: schoolSettings.value.officialStamp,
  officialStampEnabled: schoolSettings.value.officialStampEnabled,
})
const message = ref('')
const saving = ref(false)
const uploading = ref<string | null>(null)

watch(schoolSettings, settings => {
  Object.assign(form, {
    headExamSignature: settings.headExamSignature,
    headExamSignatureEnabled: settings.headExamSignatureEnabled,
    authorizedSignature: settings.authorizedSignature,
    authorizedSignatureEnabled: settings.authorizedSignatureEnabled,
    authorizedSignatureLabel: settings.authorizedSignatureLabel,
    officialStamp: settings.officialStamp,
    officialStampEnabled: settings.officialStampEnabled,
  })
})

const assets = [
  { key: 'headExamSignature', title: 'Head of Examination signature', kind: 'head-exam-signature' },
  { key: 'authorizedSignature', title: 'Authorized signature', kind: 'authorized-signature' },
  { key: 'officialStamp', title: 'Official school / university stamp', kind: 'official-stamp' },
] as const

async function uploadAsset(event: Event, key: typeof assets[number]['key'], kind: typeof assets[number]['kind']) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    message.value = 'Choose an image smaller than 5 MB.'
    input.value = ''
    return
  }

  uploading.value = key
  message.value = ''
  try {
    const response = await uploadImageRequest(file, kind)
    form[key] = response.data.url
    message.value = 'Image uploaded. Save to apply it to official results.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to upload this image.'
  } finally {
    uploading.value = null
    input.value = ''
  }
}

async function saveAssets() {
  if (form.authorizedSignatureEnabled && !form.authorizedSignatureLabel.trim()) {
    message.value = 'Enter a title for the authorized signature.'
    return
  }

  saving.value = true
  message.value = ''
  try {
    await saveSchoolSettings({
      headExamSignature: form.headExamSignature,
      headExamSignatureEnabled: form.headExamSignatureEnabled,
      authorizedSignature: form.authorizedSignature,
      authorizedSignatureEnabled: form.authorizedSignatureEnabled,
      authorizedSignatureLabel: form.authorizedSignatureLabel.trim() || 'Authorized Signatory',
      officialStamp: form.officialStamp,
      officialStampEnabled: form.officialStampEnabled,
    })
    addAuditLog('UPDATE_RESULT_SIGNATURES', 'SchoolSettings', 'Updated result signatures and stamp')
    message.value = 'Result signatures and stamp saved.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to save result signatures.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mb-5 rounded-xl border border-navy-100 bg-white p-5">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 class="font-serif font-semibold text-navy-900">Result Signatures &amp; Stamp</h3>
        <p class="mt-1 text-sm text-navy-500">Manage the official marks shown at the foot of student result printouts.</p>
      </div>
      <button type="button" :disabled="saving || uploading !== null" class="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60" @click="saveAssets">
        {{ saving ? 'Saving…' : 'Save result assets' }}
      </button>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-3">
      <article v-for="asset in assets" :key="asset.key" class="min-w-0 border-t border-navy-100 pt-4">
        <div class="flex items-center justify-between gap-3">
          <h4 class="text-sm font-medium text-navy-800">{{ asset.title }}</h4>
          <label class="flex shrink-0 items-center gap-2 text-xs text-navy-600">
            <input v-model="form[`${asset.key}Enabled` as 'headExamSignatureEnabled' | 'authorizedSignatureEnabled' | 'officialStampEnabled']" type="checkbox" class="accent-navy-800" />
            Enabled
          </label>
        </div>
        <div class="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-md border border-dashed border-navy-200 bg-navy-50 p-3">
          <img v-if="form[asset.key]" :src="form[asset.key]" :alt="`${asset.title} preview`" class="max-h-full max-w-full object-contain" />
          <span v-else class="text-xs text-navy-400">No image uploaded</span>
        </div>
        <label class="mt-3 block text-xs font-medium text-navy-600">Upload PNG, JPEG, or WebP
          <input type="file" accept="image/png,image/jpeg,image/webp" class="mt-1 block w-full text-xs text-navy-600 file:mr-2 file:rounded-md file:border-0 file:bg-navy-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-navy-800" :disabled="uploading !== null" @change="uploadAsset($event, asset.key, asset.kind)" />
        </label>
        <p v-if="uploading === asset.key" class="mt-1 text-xs text-navy-500" role="status">Uploading…</p>
      </article>
    </div>

    <label class="mt-4 block max-w-md text-sm text-navy-700">Authorized signature title
      <input v-model="form.authorizedSignatureLabel" maxlength="100" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" placeholder="President / Authorized Signatory" />
    </label>
    <p v-if="message" class="mt-3 text-sm text-navy-600" role="status">{{ message }}</p>
  </section>
</template>