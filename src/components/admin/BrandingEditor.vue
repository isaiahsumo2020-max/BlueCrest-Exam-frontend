<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { uploadImageRequest } from '../../services/api'

const { schoolSettings, saveSchoolSettings } = useAppStore()
const logoPath = ref(schoolSettings.value.schoolLogo)
const message = ref('')
const saving = ref(false)
const uploading = ref(false)

watch(() => schoolSettings.value.schoolLogo, value => {
  logoPath.value = value
})

async function saveLogo() {
  const path = logoPath.value.trim()
  if (!path) {
    message.value = 'Enter a logo URL or public asset path.'
    return
  }

  saving.value = true
  try {
    const slug = path.split('/').pop()?.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'university-logo'
    await saveSchoolSettings({ schoolLogo: path, schoolLogoSlug: slug })
    message.value = 'Platform logo updated.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to update the platform logo.'
  } finally {
    saving.value = false
  }
}

async function uploadLogo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    message.value = 'Choose an image smaller than 5 MB.'
    input.value = ''
    return
  }

  uploading.value = true
  message.value = ''
  try {
    const response = await uploadImageRequest(file, 'logo')
    logoPath.value = response.data.url
    message.value = 'Image uploaded. Save the logo to apply it across the platform.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to upload the logo image.'
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <section class="mb-5 rounded-xl border border-navy-100 bg-white p-5">
    <h3 class="font-serif font-semibold text-navy-900">Platform Branding</h3>
    <p class="mt-1 text-sm text-navy-500">Set the logo shown across section pages.</p>
    <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-navy-100 bg-navy-50 p-2">
        <img :src="logoPath || schoolSettings.schoolLogo" :alt="`${schoolSettings.schoolName} logo preview`" class="h-full w-full object-contain" @error="($event.target as HTMLImageElement).style.visibility = 'hidden'" />
      </div>
      <div class="min-w-0 flex-1">
        <label class="block text-sm text-navy-700" for="platform-logo-path">Logo URL or public asset path</label>
        <input id="platform-logo-path" v-model="logoPath" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm" placeholder="/images/university-logo.png" />
        <label class="mt-3 block text-sm text-navy-700" for="platform-logo-file">Choose a logo image from this device</label>
        <input id="platform-logo-file" type="file" accept="image/png,image/jpeg,image/webp" class="mt-1 block w-full text-sm text-navy-600 file:mr-3 file:rounded-md file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy-800" :disabled="uploading" @change="uploadLogo" />
        <p v-if="uploading" class="mt-2 text-xs text-navy-500" role="status">Uploading image…</p>
        <p v-if="message" class="mt-2 text-xs text-navy-500" role="status">{{ message }}</p>
      </div>
      <button type="button" :disabled="saving || uploading" class="shrink-0 rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60" @click="saveLogo">
        {{ saving ? 'Saving…' : 'Save logo' }}
      </button>
    </div>
  </section>
</template>
