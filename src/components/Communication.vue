<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/appStore'

const { currentUser, users, auditLogs, messages, navigate, sendMessage, markMessageRead } = useAppStore()
const selectedMessageId = ref<string | null>(null)
const recipientId = ref('')
const subject = ref('')
const body = ref('')
const replyBody = ref('')
const message = ref('')
const readNotificationIds = ref<string[]>(JSON.parse(localStorage.getItem('erp-read-notifications') ?? '[]'))

const staffUsers = computed(() => users.value.filter(user => user.role === 'staff' && user.status === 'active'))
const inbox = computed(() => messages.value.filter(item => item.recipientId === currentUser.value?.id))
const sent = computed(() => messages.value.filter(item => item.senderId === currentUser.value?.id))
const selectedMessage = computed(() => messages.value.find(item => item.id === selectedMessageId.value))
const staffActions = computed(() => auditLogs.value.filter(log => users.value.find(user => user.id === log.userId)?.role === 'staff'))
const unreadNotifications = computed(() => staffActions.value.filter(log => !readNotificationIds.value.includes(log.id)))
const unreadMessages = computed(() => inbox.value.filter(item => !item.readAt))
const pageForAction: Record<string, string> = {
  MARKS_ENTRY: 'marks-entry',
  PROCESS_RESULTS: 'result-processing',
  SEND_MESSAGE: 'communication',
}

function openNotification(log: typeof auditLogs.value[number]) {
  if (!readNotificationIds.value.includes(log.id)) {
    readNotificationIds.value = [...readNotificationIds.value, log.id]
    localStorage.setItem('erp-read-notifications', JSON.stringify(readNotificationIds.value))
  }
  navigate(pageForAction[log.action] ?? (currentUser.value?.role === 'admin' ? 'audit-log' : 'communication'))
}

function openMessage(messageId: string) {
  selectedMessageId.value = messageId
  markMessageRead(messageId)
}

function clearForm() {
  subject.value = ''
  body.value = ''
  recipientId.value = ''
}

function submitMessage() {
  if (!recipientId.value || !subject.value.trim() || !body.value.trim()) {
    message.value = 'Select a recipient and complete the subject and message.'
    return
  }
  sendMessage(recipientId.value, subject.value, body.value)
  message.value = 'Message sent.'
  clearForm()
}

function reply() {
  if (!selectedMessage.value || !replyBody.value.trim()) return
  const recipient = selectedMessage.value.senderId === currentUser.value?.id ? selectedMessage.value.recipientId : selectedMessage.value.senderId
  sendMessage(recipient, `Re: ${selectedMessage.value.subject}`, replyBody.value, selectedMessage.value.id)
  replyBody.value = ''
  message.value = 'Reply sent.'
}
</script>

<template>
  <div class="space-y-5">
    <section class="rounded-xl border border-navy-100 bg-white p-5">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div><p class="text-xs font-medium uppercase tracking-wider text-gold-600">Communication Center</p><h2 class="font-serif text-2xl font-semibold text-navy-900">Notifications & Messages</h2><p class="text-sm text-navy-500">Review staff activity and communicate about examination issues.</p></div>
        <div class="flex gap-2 text-xs"><span class="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{{ unreadNotifications.length }} unread actions</span><span class="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{{ unreadMessages.length }} unread messages</span></div>
      </div>
    </section>

    <section v-if="currentUser?.role === 'admin'" class="rounded-xl border border-navy-100 bg-white p-5">
      <div class="mb-4"><h3 class="font-serif font-semibold text-navy-900">Staff Action Notifications</h3><p class="text-xs text-navy-400">Click an action to open the related work area.</p></div>
      <div v-if="staffActions.length" class="divide-y divide-navy-50">
        <button v-for="item in staffActions" :key="item.id" class="flex w-full items-start gap-3 py-3 text-left hover:bg-navy-50/50" @click="openNotification(item)"><span class="mt-1 h-2 w-2 shrink-0 rounded-full" :class="readNotificationIds.includes(item.id) ? 'bg-navy-200' : 'bg-gold-400'" /><span class="min-w-0 flex-1"><span class="block text-sm font-medium text-navy-800">{{ item.action.replace(/_/g, ' ') }}</span><span class="block text-xs text-navy-500">{{ item.userName }} · {{ item.details }}</span><span class="mt-1 block text-[10px] text-navy-400">{{ new Date(item.timestamp).toLocaleString('en-LR') }} · Open related page</span></span></button>
      </div>
      <div v-else class="py-8 text-center text-sm text-navy-400">No staff activity has been recorded yet.</div>
    </section>

    <section class="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div class="rounded-xl border border-navy-100 bg-white p-5">
        <div class="mb-4"><h3 class="font-serif font-semibold text-navy-900">New Message</h3><p class="text-xs text-navy-400">Send an issue or instruction to a specific staff member.</p></div>
        <div v-if="currentUser?.role === 'admin'" class="space-y-3">
          <select v-model="recipientId" class="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm"><option value="">Select staff member</option><option v-for="user in staffUsers" :key="user.id" :value="user.id">{{ user.name }}</option></select>
          <input v-model="subject" class="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" placeholder="Issue subject" />
          <textarea v-model="body" rows="5" class="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" placeholder="Write your message" />
          <button class="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white" @click="submitMessage">Send Message</button>
        </div>
        <div v-else class="rounded-lg bg-navy-50 p-4 text-sm text-navy-600">Open a message from the inbox to respond to an administrator.</div>
        <div v-if="message" class="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ message }}</div>
      </div>

      <div class="rounded-xl border border-navy-100 bg-white p-5">
        <div class="mb-4 flex items-center justify-between"><div><h3 class="font-serif font-semibold text-navy-900">{{ currentUser?.role === 'admin' ? 'Staff Replies & Messages' : 'Messages from Administration' }}</h3><p class="text-xs text-navy-400">Select a message to read and respond.</p></div><span class="text-xs text-navy-400">{{ inbox.length }} received · {{ sent.length }} sent</span></div>
        <div v-if="inbox.length" class="space-y-2"><button v-for="item in inbox" :key="item.id" class="w-full rounded-lg border p-3 text-left" :class="item.readAt ? 'border-navy-100 bg-white' : 'border-gold-200 bg-gold-50/40'" @click="openMessage(item.id)"><div class="flex items-center justify-between gap-3"><span class="text-sm font-medium text-navy-800">{{ item.subject }}</span><span class="text-[10px] text-navy-400">{{ new Date(item.createdAt).toLocaleDateString('en-LR') }}</span></div><div class="mt-1 text-xs text-navy-500">From {{ item.senderName }} · {{ item.body }}</div></button></div>
        <div v-else class="py-8 text-center text-sm text-navy-400">No messages received yet.</div>
      </div>
    </section>

    <div v-if="selectedMessage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div class="w-full max-w-lg rounded-xl bg-white shadow-xl"><div class="flex items-center justify-between border-b border-navy-100 p-5"><div><h3 class="font-serif font-semibold text-navy-900">{{ selectedMessage.subject }}</h3><p class="text-xs text-navy-400">{{ selectedMessage.senderName }} to {{ selectedMessage.recipientName }}</p></div><button class="text-xl text-navy-400" @click="selectedMessageId = null">×</button></div><div class="space-y-4 p-5"><p class="whitespace-pre-wrap text-sm text-navy-700">{{ selectedMessage.body }}</p><textarea v-model="replyBody" rows="4" class="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" placeholder="Write a reply" /><button class="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white" @click="reply">Send Reply</button></div></div></div>
  </div>
</template>
