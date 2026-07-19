<template>
  <div class="relative min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 overflow-hidden font-sans">
    
    <!-- Background aesthetic blobs -->
    <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse" />
    <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none animate-pulse" style="animation-delay: 3s" />

    <div class="relative z-10 w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl space-y-8">
      
      <!-- Header Indicator -->
      <div class="flex items-center justify-between border-b border-white/5 pb-6">
        <div class="flex items-center space-x-3 text-left">
          <div class="p-2 bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 rounded-xl">
            <Sparkles class="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span class="block text-[10px] font-mono tracking-widest text-cyan-400 font-bold">LUVIA PROTOCOL INITIALIZATION</span>
            <h1 class="font-display text-xl font-bold tracking-tight">Enterprise Setup Wizard</h1>
          </div>
        </div>
        
        <div class="flex items-center space-x-1.5 font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
          <span :class="step === 1 ? 'text-white font-bold' : ''">01</span>
          <span>/</span>
          <span :class="step === 2 ? 'text-white font-bold' : ''">02</span>
          <span>/</span>
          <span :class="step === 3 ? 'text-white font-bold' : ''">03</span>
        </div>
      </div>

      <div v-if="error" class="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-left">
        {{ error }}
      </div>

      <!-- Step 1: Create Super Admin -->
      <div v-if="step === 1" class="space-y-6 text-left">
        <div>
          <h2 class="font-display text-lg font-bold">Establish Administrator Identity</h2>
          <p class="text-xs text-slate-400 mt-1 font-light">As the first user on this Luvia deployment, your account is automatically provisioned with the highest Super Admin security clearance.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">SUPER ADMIN NAME</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User class="w-4 h-4" />
              </span>
              <input 
                type="text"
                v-model="adminName"
                placeholder="e.g. Alex Mercer"
                class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">SECURE ADMINISTRATIVE EMAIL</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail class="w-4 h-4" />
              </span>
              <input 
                type="email"
                v-model="adminEmail"
                placeholder="admin@luviaclass.com"
                class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          @click="handleNextStep"
          class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer border-none"
        >
          <span>Next: Customize Branding</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Step 2: Platform Settings -->
      <div v-if="step === 2" class="space-y-6 text-left">
        <div>
          <h2 class="font-display text-lg font-bold">Customize Platform Persona</h2>
          <p class="text-xs text-slate-400 mt-1 font-light">Set up details that will populate the dynamic landing page and navigation headers.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">PLATFORM PUBLIC NAME</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Globe class="w-4 h-4" />
              </span>
              <input 
                type="text"
                v-model="platformName"
                class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">WHATSAPP SUPPORT NUMBER</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <MessageSquare class="w-4 h-4" />
              </span>
              <input 
                type="text"
                v-model="whatsappNumber"
                class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div class="md:col-span-2 space-y-1">
            <label class="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">LANDING HERO HEADING</label>
            <input 
              type="text"
              v-model="heroTitle"
              class="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          <div class="md:col-span-2 space-y-1">
            <label class="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">LANDING HERO SUBTITLE / MISSION</label>
            <textarea 
              rows="2"
              v-model="heroSubtitle"
              class="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all resize-none"
            />
          </div>
        </div>

        <div class="flex space-x-4">
          <button
            @click="step = 1"
            class="px-6 py-3.5 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold uppercase transition-all hover:bg-slate-800 cursor-pointer border-none"
          >
            Back
          </button>
          <button
            @click="handleNextStep"
            class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer border-none"
          >
            <span>Next: Instantiate Syllabus</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 3: Instantiate Syllabus -->
      <div v-if="step === 3" class="space-y-6 text-left">
        <div>
          <h2 class="font-display text-lg font-bold">Instantiate First Course Blueprint</h2>
          <p class="text-xs text-slate-400 mt-1 font-light">To guarantee immediate visual feedback, initialize Luvia with your first high-end education course. All content stays fully editable.</p>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">COURSE TITLE</label>
              <input 
                type="text"
                v-model="courseTitle"
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">TUITION FEE ($)</label>
              <input 
                type="number"
                v-model="coursePrice"
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">DIFFICULTY</label>
              <select 
                v-model="courseDifficulty"
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">CATEGORY</label>
              <input 
                type="text"
                v-model="courseCategory"
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">DURATION</label>
              <input 
                type="text"
                v-model="courseDuration"
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          <!-- Outcomes CMS list -->
          <div class="space-y-2">
            <label class="block text-[9px] font-mono text-slate-400 uppercase">LEARNING OUTCOMES</label>
            <div class="flex space-x-2">
              <input 
                type="text"
                v-model="newOutcome"
                placeholder="Add specific mastery point..."
                class="flex-1 px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
              <button 
                @click="addOutcome"
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border-none text-white"
              >
                Add
              </button>
            </div>
            <div class="flex flex-wrap gap-1.5 pt-1">
              <div v-for="(out, i) in outcomes" :key="i" class="flex items-center space-x-1 px-2.5 py-1 bg-slate-950 border border-white/5 text-[10px] rounded-lg">
                <span class="text-slate-300">{{ out }}</span>
                <button @click="removeOutcome(i)" class="text-slate-500 hover:text-white cursor-pointer bg-transparent border-none">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-4 pt-4">
          <button
            :disabled="isLoading"
            @click="step = 2"
            class="px-6 py-3.5 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold uppercase transition-all hover:bg-slate-800 cursor-pointer border-none"
          >
            Back
          </button>
          <button
            :disabled="isLoading"
            @click="handleFinalizeSetup"
            class="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-opacity disabled:opacity-50 cursor-pointer border-none"
          >
            <div v-if="isLoading" class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <template v-else>
              <span>Initialize Enterprise Workspace</span>
              <CheckCircle class="w-4 h-4" />
            </template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Mail, 
  Globe, 
  MessageSquare,
  CheckCircle
} from 'lucide-vue-next'
import { dbService } from '@/lib/db'

const emit = defineEmits(['setup-complete'])

const step = ref(1)
const isLoading = ref(false)
const error = ref('')

// Step 1: Admin Credentials
const adminName = ref('')
const adminEmail = ref('')

// Step 2: Platform Settings
const platformName = ref('Luvia')
const platformDescription = ref('Minimalist Educational SaaS for elite software creatives.')
const whatsappNumber = ref('+1 (555) 019-2834')
const heroTitle = ref('Deconstruct High-End Interface Engineering')
const heroSubtitle = ref('Immersive, physics-based courses breaking down secret motion guidelines and spatial layout design systems.')

// Step 3: First Course creation
const courseTitle = ref('Advanced Interaction Design & Spring Physics')
const courseSubtitle = ref('Learn the secret animation rules used by Apple, Linear, and Stripe.')
const coursePrice = ref('199')
const courseDifficulty = ref('Advanced')
const courseCategory = ref('Design Engineering')
const courseDuration = ref('12h 45m')
const courseDescription = ref('Deconstruct Framer, Linear, and macOS custom spring dynamics, micro-interactions, and responsive sizing.')
const outcomes = ref([
  'Master spring stiffness and damping ratios',
  'Design hardware-accelerated fluid UI transitions'
])
const newOutcome = ref('')

const addOutcome = () => {
  if (newOutcome.value.trim() && !outcomes.value.includes(newOutcome.value.trim())) {
    outcomes.value.push(newOutcome.value.trim())
    newOutcome.value = ''
  }
}

const removeOutcome = (index) => {
  outcomes.value = outcomes.value.filter((_, i) => i !== index)
}

const handleNextStep = () => {
  error.value = ''
  if (step.value === 1) {
    if (!adminName.value.trim() || !adminEmail.value.trim()) {
      error.value = 'Super Admin name and secure email are strictly required.'
      return
    }
    if (!adminEmail.value.includes('@')) {
      error.value = 'Please input a valid administrative email.'
      return
    }
    step.value = 2
  } else if (step.value === 2) {
    if (!platformName.value.trim() || !heroTitle.value.trim() || !whatsappNumber.value.trim()) {
      error.value = 'Platform identity configuration requires all fields.'
      return
    }
    step.value = 3
  }
}

const handleFinalizeSetup = async () => {
  error.value = ''
  isLoading.value = true
  try {
    // 1. Create Super Admin Profile
    const adminProfile = await dbService.signUp(adminEmail.value, adminName.value, 'admin')

    // 2. Save Platform Settings
    const settings = {
      platformName: platformName.value,
      platformDescription: platformDescription.value,
      whatsappNumber: whatsappNumber.value,
      heroTitle: heroTitle.value,
      heroSubtitle: heroSubtitle.value,
      bannerMessage: `🎉 Welcome to ${platformName.value}! Custom enrollment is now live.`
    }
    await dbService.updateSettings(settings)

    // 3. Create First Curated Course
    if (courseTitle.value.trim()) {
      const createdCourse = await dbService.createCourse({
        title: courseTitle.value,
        subtitle: courseSubtitle.value,
        duration: courseDuration.value,
        xpReward: 1200,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
        category: courseCategory.value,
        description: courseDescription.value,
        outcomes: outcomes.value,
        requirements: ['Basic familiarity with React/Vue and Tailwind CSS', 'An appetite for pixel-perfection'],
        price: Number(coursePrice.value),
        difficulty: courseDifficulty.value,
        instructorId: adminProfile.id
      })

      // 4. Create first default lesson inside that course
      await dbService.createLesson(createdCourse.id, {
        title: 'Deconstructing Apple & Linear Motion Mechanics',
        duration: '14:20',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isLocked: false,
        xp: 150,
        attachments: [
          { name: 'Linear Animation Specs.pdf', size: '2.4 MB', url: '#' }
        ],
        transcript: [
          { time: '0:05', text: 'Welcome to your premium dashboard environment.' },
          { time: '1:12', text: 'Today, we deconstruct why physical springs feel faster than standard easing.' }
        ]
      })
    }

    isLoading.value = false
    emit('setup-complete')
  } catch (err) {
    isLoading.value = false
    error.value = err.message || 'An error occurred during system provisioning.'
  }
}
</script>
