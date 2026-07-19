<template>
  <div class="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
    
    <!-- Absolute background visual glows -->
    <div class="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
    <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

    <!-- Main Glassmorphism Auth Card -->
    <div class="relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white">
      
      <!-- Cancel button -->
      <button 
        @click="emitCancel"
        class="absolute top-6 right-6 text-xs font-mono tracking-widest text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
      >
        ESC
      </button>

      <!-- Dynamic header logic -->
      <div class="text-center space-y-3 mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1.5px] mx-auto">
          <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-cyan-400">
            {{ brandChar }}
          </div>
        </div>
        
        <template v-if="mode === 'signin'">
          <h2 class="font-display text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p class="text-xs text-slate-400 font-light">Re-enter your credentials to stream your active modules.</p>
        </template>

        <template v-else-if="mode === 'signup'">
          <h2 class="font-display text-2xl font-bold tracking-tight text-white">Initiate New Blueprint</h2>
          <p class="text-xs text-slate-400 font-light">Gain direct access to advanced motion and typographic systems.</p>
        </template>

        <template v-else-if="mode === 'verify'">
          <h2 class="font-display text-2xl font-bold tracking-tight text-white">Confirm Your Identity</h2>
          <p class="text-xs text-slate-400 font-light">Enter standard 6-digit confirmation key to decrypt access.</p>
        </template>
      </div>

      <div v-if="error" class="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start space-x-2">
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <span class="text-left">{{ error }}</span>
      </div>

      <!-- Input/form areas -->
      <form v-if="mode !== 'verify'" @submit.prevent="handleSubmit" class="space-y-4">
        
        <template v-if="mode === 'signup'">
          <div class="space-y-1 text-left">
            <label class="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">FULL NAME</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User class="w-4 h-4" />
              </span>
              <input 
                type="text" 
                v-model="name"
                placeholder="Alex Mercer"
                class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                id="auth-name-input"
              />
            </div>
          </div>

          <div class="space-y-1 text-left">
            <label class="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">CHOOSE ROLE</label>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                @click="role = 'student'"
                class="py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer border-none"
                :class="role === 'student' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 border-solid' : 'border-white/5 hover:bg-slate-800/40 border-solid'"
              >
                Student Account
              </button>
              <button
                type="button"
                @click="role = 'instructor'"
                class="py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer border-none"
                :class="role === 'instructor' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 border-solid' : 'border-white/5 hover:bg-slate-800/40 border-solid'"
              >
                Instructor Role
              </button>
            </div>
          </div>
        </template>

        <div class="space-y-1 text-left">
          <label class="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">SECURE EMAIL</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Mail class="w-4 h-4" />
            </span>
            <input 
              type="email" 
              v-model="email"
              placeholder="alex@mercer-design.com"
              class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
              id="auth-email-input"
            />
          </div>
        </div>

        <div class="space-y-1 text-left">
          <label class="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">PASSWORD</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Lock class="w-4 h-4" />
            </span>
            <input 
              type="password" 
              v-model="password"
              placeholder="••••••••••••"
              class="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
              id="auth-password-input"
            />
          </div>

          <!-- Password strength visualizer -->
          <div v-if="mode === 'signup' && password" class="space-y-2 mt-2 pt-1 text-left">
            <div class="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>SECURITY STANDARDS</span>
              <span class="font-bold text-cyan-400 uppercase">{{ passwordStrength.label }}</span>
            </div>
            <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-500"
                :class="passwordStrength.color"
                :style="{ width: `${(passwordStrength.score / 4) * 100}%` }"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border-none"
          id="auth-submit-btn"
        >
          <div v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <template v-else>
            <span>{{ mode === 'signin' ? 'Verify Credentials' : 'Request Security Code' }}</span>
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>
      </form>

      <!-- Email Verification Step Container -->
      <div v-else class="space-y-6">
        <div class="flex justify-between space-x-2">
          <input
            v-for="(digit, idx) in pin"
            :key="idx"
            :id="`pin-${idx}`"
            type="text"
            maxLength="1"
            v-model="pin[idx]"
            @input="handlePinChange($event.target.value, idx)"
            class="w-12 h-14 bg-slate-950/80 border border-white/10 rounded-xl text-center text-xl font-display font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div class="text-center">
          <span class="block text-[10px] font-mono text-slate-500 uppercase">DIDNT RECEIVE THE PACKET CODE?</span>
          <button 
            @click="resetPin"
            class="text-xs font-semibold text-cyan-400 hover:underline mt-1 cursor-pointer border-none bg-transparent"
          >
            Re-dispatch secure packet
          </button>
        </div>

        <button
          @click="handleVerify"
          :disabled="isLoading"
          class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-opacity cursor-pointer border-none flex items-center justify-center space-x-2"
          id="auth-verify-pin-btn"
        >
          <div v-if="isLoading" class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          <template v-else>
            <span>Decrypt Access Room</span>
            <Sparkles class="w-4 h-4" />
          </template>
        </button>
      </div>

      <!-- Footer options -->
      <div class="mt-8 pt-6 border-t border-white/5 space-y-4 text-center">
        <span class="block text-[10px] font-mono tracking-widest text-slate-500 uppercase">FEDERATED SIGN-IN OPTIONS</span>
        
        <div class="grid grid-cols-3 gap-3">
          <button 
            @click="federatedPrompt"
            class="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer border-none"
            title="GitHub"
          >
            <Github class="w-4 h-4 text-slate-300" />
          </button>
          <button 
            @click="federatedPrompt"
            class="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer border-none"
            title="Google"
          >
            <Chrome class="w-4 h-4 text-slate-300" />
          </button>
          <button 
            @click="federatedPrompt"
            class="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer border-none"
            title="Twitter"
          >
            <Twitter class="w-4 h-4 text-slate-300" />
          </button>
        </div>

        <div class="text-center pt-2">
          <template v-if="mode === 'signin'">
            <span class="text-xs text-slate-500">
              New architect?{' '}
              <button 
                @click="mode = 'signup'"
                class="font-bold text-white hover:underline cursor-pointer border-none bg-transparent"
              >
                Create credentials
              </button>
            </span>
          </template>
          <template v-else>
            <span class="text-xs text-slate-500">
              Active resident?{' '}
              <button 
                @click="mode = 'signin'"
                class="font-bold text-white hover:underline cursor-pointer border-none bg-transparent"
              >
                Enter workspace
              </button>
            </span>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Github, 
  Twitter, 
  Chrome, 
  Sparkles, 
  AlertCircle 
} from 'lucide-vue-next'
import { dbService } from '@/lib/db'

const emit = defineEmits(['auth-success', 'cancel'])

const mode = ref('signin')
const email = ref('')
const password = ref('')
const name = ref('')
const pin = ref(['', '', '', '', '', ''])
const isLoading = ref(false)
const error = ref('')
const role = ref('student')

const brandChar = computed(() => 'L')

const passwordStrength = ref({ score: 0, label: 'Empty', color: 'bg-slate-200' })

watch(password, (newVal) => {
  if (!newVal) {
    passwordStrength.value = { score: 0, label: 'Empty', color: 'bg-slate-200' }
    return
  }

  let score = 0
  if (newVal.length >= 8) score += 1
  if (/[A-Z]/.test(newVal)) score += 1
  if (/[0-9]/.test(newVal)) score += 1
  if (/[^A-Za-z0-9]/.test(newVal)) score += 1

  let label = 'Weak'
  let color = 'bg-rose-500'

  if (score === 2) {
    label = 'Moderate'
    color = 'bg-amber-500'
  } else if (score === 3) {
    label = 'Strong'
    color = 'bg-emerald-500'
  } else if (score === 4) {
    label = 'Apple-Grade Enterprise'
    color = 'bg-cyan-500 shadow-md shadow-cyan-500/20'
  }

  passwordStrength.value = { score, label, color }
})

const handleSubmit = async () => {
  error.value = ''

  if (mode.value === 'signin') {
    if (!email.value || !password.value) {
      error.value = 'Please fill in all security credentials.'
      return
    }
    isLoading.value = true
    try {
      const profile = await dbService.signIn(email.value)
      isLoading.value = false
      emit('auth-success', profile)
    } catch (err) {
      isLoading.value = false
      error.value = err.message || 'Credentials match error. Try again.'
    }
  } else if (mode.value === 'signup') {
    if (!name.value || !email.value || !password.value) {
      error.value = 'Complete registration elements required.'
      return
    }
    if (password.value.length < 8) {
      error.value = 'Security standards require at least 8 characters.'
      return
    }
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      mode.value = 'verify'
    }, 1000)
  }
}

const handlePinChange = (value, idx) => {
  if (isNaN(Number(value))) return
  pin.value[idx] = value.substring(value.length - 1)

  // Auto focus next input
  if (value && idx < 5) {
    const nextInput = document.getElementById(`pin-${idx + 1}`)
    nextInput?.focus()
  }
}

const resetPin = () => {
  pin.value = ['', '', '', '', '', '']
}

const handleVerify = async () => {
  if (pin.value.includes('')) {
    error.value = 'Please input the entire 6-digit confirmation key.'
    return
  }
  isLoading.value = true
  try {
    const profile = await dbService.signUp(email.value, name.value, role.value)
    isLoading.value = false
    emit('auth-success', profile)
  } catch (err) {
    isLoading.value = false
    error.value = err.message || 'Error executing secure registration.'
  }
}

const emitCancel = () => {
  emit('cancel')
}

const federatedPrompt = () => {
  alert('Federated Auth is in secure-preview container mode. Please register/login with standard credentials.')
}
</script>
