<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/appStore'

const { login, navigate, schoolSettings } = useAppStore()
const tab = ref<'staff' | 'student'>('staff')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const universityName = computed(() => schoolSettings.value.schoolName || 'BlueCrest University')
const universityLogo = computed(() => schoolSettings.value.schoolLogo || '/images/BlueCrest University.png')

async function handleStaffLogin() {
  error.value = ''
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 400))
  try {
    const user = await login(email.value, password.value)
    if (!user) error.value = 'Invalid email or password. Please try again.'
  } catch (loginError) {
    error.value = loginError instanceof Error && loginError.message.includes('Invalid email or password')
      ? loginError.message
      : 'Unable to connect to the backend. Make sure the Express server is running on port 3001.'
  }
  loading.value = false
}

function quickLogin(nextEmail: string, nextPassword: string) {
  email.value = nextEmail
  password.value = nextPassword
}
</script>

<template>
  <div class="min-h-screen bg-blue-950 flex">
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 30% 50%, #c9891a 0%, transparent 60%), radial-gradient(circle at 80% 20%, #2e70a1 0%, transparent 50%)"
      />
      <div class="relative">
        <div class="flex items-center gap-3 mb-2">
          <img :src="universityLogo" :alt="`${universityName} logo`" class="w-20 h-20 object-contain" />
          <div>
            <div class="text-white font-serif text-4x1 font-bold leading-tight">{{ universityName }}</div>
            <div class="text-black text-xs tracking-widest uppercase">Monrovia, Liberia</div>
          </div>
        </div>
      </div>
      <div class="relative">
        <div class="w-full max-w-md aspect-16/7 rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-8">
          <img src="/images/BlueCrest Campus.jpg" alt="BlueCrest University campus" class="w-full h-full object-cover" />
        </div>
        <h1 class="font-serif text-5xl font-bold text-white leading-tight mb-6">
          Examination &<br />Result<br />
          <span class="text-gold-600">Management</span><br />System
        </h1>
        <p class="text-navy-300 text-sm leading-relaxed max-w-xs">
          Centralized academic records, automated grade processing, GPA/CGPA calculation, and secure result publication for all programmes.
        </p>
      </div>
      <!-- <div class="relative grid grid-cols-3 gap-4">
        <div v-for="stat in [['Programmes', '3'], ['Students', '9+'], ['Published', '7']]" :key="stat[0]" class="bg-white/5 rounded-lg p-4 border border-white/10">
          <div class="text-gold-400 font-serif text-2xl font-bold">{{ stat[1] }}</div>
          <div class="text-navy-300 text-xs mt-1">{{ stat[0] }}</div>
        </div>
      </div> -->
    </div>

    <div class="flex-1 flex items-center justify-center bg-white p-8">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <img :src="universityLogo" :alt="`${universityName} logo`" class="w-24 h-24 object-contain" />
          <div>
            <div class="text-blue-900 font-serif text-3x1 font-bold">{{ universityName }}</div>
            <div class="text-blue-700 text-xs">Examination & Result ERP</div>
          </div>
        </div>

        <div class="flex mb-8 bg-blue-900 rounded-lg p-1">
          <button class="flex-1 py-2.5 text-sm font-medium rounded-md transition-all" :class="tab === 'staff' ? 'bg-gold-600 text-navy-950' : 'text-navy-300 hover:text-white'" @click="tab = 'staff'; error = ''">
            Admin / Staff Login
          </button>
          <button class="flex-1 py-2.5 text-sm font-medium rounded-md transition-all" :class="tab === 'student' ? 'bg-gold-600 text-navy-950' : 'text-navy-300 hover:text-white'" @click="tab = 'student'; error = ''">
            Student Result Check
          </button>
        </div>

        <form v-if="tab === 'staff'" class="bg-blue-900 border-blue-700 rounded-xl p-8 space-y-5" @submit.prevent="handleStaffLogin">
          <div>
            <label class="block text-navy-200 text-sm mb-2">Email Address</label>
            <input v-model="email" type="email" placeholder="your@bluecrest.edu.lr" required class="w-97 bg-gray-600 border border-gray-500 text-white placeholder-navy-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-600 transition-colors" />
          </div>
          <div>
            <label class="block text-navy-200 text-sm mb-2">Password</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="w-97 bg-gray-600 border border-gray-500 text-white placeholder-navy-500 rounded-lg px-4 pr-12 py-3 text-sm focus:outline-none focus:border-gold-600 transition-colors" />
              <button type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" :title="showPassword ? 'Hide password' : 'Show password'" class="absolute inset-y-0 right-0 px-4 text-navy-400 hover:text-gold-600 transition-colors" @click="showPassword = !showPassword">
                <span aria-hidden="true">👁</span>
              </button>
            </div>
          </div>
          <div v-if="error" class="bg-red-900/40 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">{{ error }}</div>
          <button type="submit" :disabled="loading" class="w-97 bg-gold-600 hover:bg-gold-500 text-blue-950 font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 text-sm">
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
          <div class="mt-6 border border-navy-700 rounded-lg p-4 space-y-2">
            <div class="text-navy-400 text-xs font-medium uppercase tracking-wider mb-3">Demo Credentials</div>
            <button v-for="credential in [
              { label: 'Administrator', email: 'sumo@bluecrest.edu.lr', password: 'Admin@2024', color: 'text-gold-400' },
              { label: 'Staff (Dr. Sivarkuma)', email: 'admin@bluecrest.edu.lr', password: 'Staff@2024', color: 'text-gold-400' },
              { label: 'Staff (Emmanuel Kollie)', email: 'ekollie@bluecrest.edu.lr', password: 'Staff@2024', color: 'text-navy-300' },
              { label: 'Staff (Abigail Saye)', email: 'amsaye@bluecrest.edu.lr', password: 'Staff@2024', color: 'text-navy-300' },
            ]" :key="credential.email" type="button" class="w-full text-left flex justify-between items-center py-1 hover:opacity-80 transition-opacity" @click="quickLogin(credential.email, credential.password)">
              <span class="text-xs" :class="credential.color">{{ credential.label }}</span>
              <span class="text-navy-500 text-xs font-mono">{{ credential.password }}</span>
            </button>
          </div>
        </form>

        <div v-else class="text-center space-y-4">
          <div class="bg-blue-900 border border-blue-700 rounded-xl p-8">
            <div class="text-4xl mb-4"> </div>
            <h2 class="text-white font-serif text-xl mb-2">Check Your Result</h2>
            <p class="text-navy-100 text-sm mb-6">Enter your registered Email ID and Roll Number to view your published semester results.</p>
            <button class="w-full bg-gold-400 hover:bg-gold-300 text-blue-900 font-semibold py-3 rounded-lg transition-colors text-sm" @click="navigate('student-verification')">
              Go to Result Verification →
            </button>
          </div>
          <p class="text-blue-700 text-xs">Only officially published results are available for verification.</p>
        </div>
      </div>
    </div>
  </div>
</template>
