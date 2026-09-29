<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { uploadImageRequest } from '../../services/api'
import { useAppStore } from '../../stores/appStore'

const { users, updateUserProfilePicture } = useAppStore()
const staffUsers = computed(() => users.value.filter(user => user.role === 'staff'))
const selectedId = ref(staffUsers.value[0]?.id ?? '')
const selectedUser = computed(() => staffUsers.value.find(user => user.id === selectedId.value))
const photoPath = ref('')
const message = ref('')
const saving = ref(false)
const uploading = ref(false)

watch(selectedUser, user => {
  photoPath.value = user?.profilePicture ?? ''
}, { immediate: true })

async function savePhoto() {
  const user = selectedUser.value
  if (!user) return

  saving.value = true
  message.value = ''
  try {
    await updateUserProfilePicture(user.id, photoPath.value.trim())
    message.value = 'Staff profile picture updated.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to save the profile picture.'
  } finally {
    saving.value = false
  }
}

async function uploadPhoto(event: Event) {
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
    const response = await uploadImageRequest(file, 'profile')
    photoPath.value = response.data.url
    message.value = 'Image uploaded. Save the photo to assign it to this staff member.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to upload the profile image.'
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <section class="rounded-xl border border-navy-100 bg-white p-5">
    <div>
      <h3 class="font-serif font-semibold text-navy-900">Staff Profile Pictures</h3>
      <p class="mt-1 text-sm text-navy-500">Set the photo shown beside a staff member’s name in section pages.</p>
    </div>
    <div v-if="staffUsers.length" class="mt-4 grid gap-4 sm:grid-cols-[minmax(12rem,0.7fr)_1fr_auto] sm:items-end">
      <label class="block text-sm text-navy-700">Staff member
        <select v-model="selectedId" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm">
          <option v-for="user in staffUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
      </label>
      <label class="block text-sm text-navy-700">Image URL or public asset path
        <input v-model="photoPath" class="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm" placeholder="/images/staff-photo.png" />
      </label>
      <button type="button" :disabled="saving || uploading" class="rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60" @click="savePhoto">
        {{ saving ? 'Saving…' : 'Save photo' }}
      </button>
    </div>
    <label v-if="staffUsers.length" class="mt-4 block text-sm text-navy-700" for="staff-profile-file">Choose a profile picture from this device</label>
    <input v-if="staffUsers.length" id="staff-profile-file" type="file" accept="image/png,image/jpeg,image/webp" class="mt-1 block w-full text-sm text-navy-600 file:mr-3 file:rounded-md file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy-800" :disabled="uploading" @change="uploadPhoto" />
    <p v-if="uploading" class="mt-2 text-sm text-navy-500" role="status">Uploading image…</p>
    <div v-if="selectedUser && photoPath" class="mt-4 flex items-center gap-3">
      <img :src="photoPath" :alt="`${selectedUser.name} profile preview`" class="h-12 w-12 rounded-full border border-navy-100 object-cover" />
      <span class="text-sm text-navy-600">{{ selectedUser.name }}</span>
    </div>
    <p v-if="!staffUsers.length" class="mt-4 text-sm text-navy-500">No staff accounts are available.</p>
    <p v-if="message" class="mt-3 text-sm text-navy-600" role="status">{{ message }}</p>
  </section>
</template>
