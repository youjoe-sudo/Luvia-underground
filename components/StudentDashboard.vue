<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans w-full">
    
    <!-- Collapsible Left Side Panel -->
    <aside :class="`hidden md:flex flex-col border-r border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md transition-all duration-300 shrink-0 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`">
      <div class="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900">
        <span v-if="!sidebarCollapsed" class="text-xs font-mono font-bold tracking-wider text-slate-400">STUDENT TERMINAL</span>
        <button 
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white mx-auto cursor-pointer border-none bg-transparent"
          title="Collapse sidebar"
        >
          <ChevronRight :class="`w-4 h-4 transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`" />
        </button>
      </div>

      <div class="p-3 flex-1 space-y-2">
        <button 
          v-for="(c, i) in enrolledCourses.slice(0, 3)"
          :key="c.id"
          @click="emitSelectCourse(c.id)"
          class="flex items-center space-x-3 w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer border-none bg-transparent dark:text-white"
        >
          <BookOpen :class="`w-4 h-4 shrink-0 ${i % 2 === 0 ? 'text-blue-600' : 'text-purple-600'}`" />
          <span v-if="!sidebarCollapsed" class="truncate">{{ c.title }}</span>
        </button>

        <button 
          @click="emitGoToLive"
          class="flex items-center space-x-3 w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer border-none bg-transparent"
        >
          <Video class="w-4 h-4 text-red-500 shrink-0" />
          <span v-if="!sidebarCollapsed" class="truncate text-red-500 font-bold">Live Seminar</span>
        </button>

        <button 
          @click="emitGoToCertificates"
          class="flex items-center space-x-3 w-full p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer border-none bg-transparent dark:text-white"
        >
          <Award class="w-4 h-4 text-amber-500 shrink-0" />
          <span v-if="!sidebarCollapsed" class="truncate">My Accreditations</span>
        </button>
      </div>

      <div v-if="!sidebarCollapsed" class="p-4 m-4 bg-slate-100 dark:bg-slate-900 rounded-2xl space-y-2 text-left">
        <span class="block text-[9px] font-mono text-slate-400">YOUR WORKSPACE LEVEL</span>
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-xl text-blue-600 dark:text-cyan-400">LVL {{ Math.max(1, Math.floor(currentUser.totalXp / 1000)) }}</span>
          <span class="text-[10px] font-mono font-bold text-slate-500">ACTIVE ACCOUNT</span>
        </div>
      </div>
    </aside>

    <!-- Main Dynamic View Content -->
    <main class="flex-1 max-w-7xl mx-auto px-6 py-8 space-y-8 overflow-y-auto">
      
      <!-- Top Header Greetings -->
      <section class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="text-left">
          <h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {{ currentUser.name }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze your telemetry and continue your interactive study tracks below.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <span class="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/20 uppercase font-bold">
            ROLE: {{ currentUser.role }} PRIVILEGED NODE
          </span>
        </div>
      </section>

      <!-- Dynamic Telemetry KPI summary grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Card 1: Streak -->
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">ACTIVE STREAK</span>
            <span class="block font-display text-2xl font-bold text-amber-500">{{ currentUser.currentStreak }} Days</span>
            <span class="block text-[9px] text-slate-500 font-mono">STREAK MULTIPLIER ACTIVE</span>
          </div>
          <div class="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Flame class="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        <!-- Card 2: Accumulated XP -->
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">ACCUMULATED EXPERIENCE</span>
            <span class="block font-display text-2xl font-bold text-indigo-500">{{ currentUser.totalXp }} XP</span>
            <span class="block text-[9px] text-slate-500 font-mono">100% DYNAMIC SYNCHRONIZATION</span>
          </div>
          <div class="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <Zap class="w-6 h-6 fill-indigo-500" />
          </div>
        </div>

        <!-- Card 3: Courses Enrolled -->
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">ACTIVE MODULES</span>
            <span class="block font-display text-2xl font-bold text-emerald-500">{{ enrolledCourses.length }} Registered</span>
            <span class="block text-[9px] text-slate-500 font-mono">COURSES IN TRAINING REPOSITORY</span>
          </div>
          <div class="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Award class="w-6 h-6" />
          </div>
        </div>

        <!-- Card 4: Next Milestone progress wheel -->
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden text-left flex items-center justify-between group hover:shadow-lg transition-all">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">LEVEL PROGRESS</span>
            <span class="block font-display text-2xl font-bold text-blue-600 dark:text-cyan-400">{{ levelProgress }}%</span>
            <span class="block text-[9px] text-slate-500 font-mono">TO NEXT EDUCATION MULTIPLIER</span>
          </div>
          
          <div class="relative w-12 h-12">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="18" fill="transparent" stroke="rgba(156,163,175,0.15)" strokeWidth="4" />
              <circle cx="24" cy="24" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" :stroke-dasharray="113" :stroke-dashoffset="113 - (113 * levelProgress) / 100" class="text-blue-600 dark:text-cyan-400" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono">{{ levelProgress }}%</div>
          </div>
        </div>

      </section>

      <!-- Main Columns: Left (Activity & Resume), Right (Analytics & Seminars) -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: 7/12 layout -->
        <div class="lg:col-span-7 space-y-8">
          
          <!-- Continue Learning interactive capsule -->
          <div v-if="continueCourse" class="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 rounded-3xl text-white text-left relative overflow-hidden group shadow-xl">
            <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-blue-600 to-purple-600 blur-3xl opacity-20 pointer-events-none" />
            
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-3 flex-1">
                <div class="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider">
                  <Clock class="w-3 h-3" />
                  <span>CURATED SYLLABUS RESUME</span>
                </div>
                
                <h3 class="font-display font-bold text-xl text-white">{{ continueCourse.title }}</h3>
                <p class="text-xs text-slate-400 font-light leading-relaxed">
                  Next lesson: <span class="text-white font-semibold">{{ resumeLesson?.title || 'No lessons published' }}</span>
                </p>

                <div class="pt-2">
                  <div class="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span>MODULES PASSED</span>
                    <span>{{ continueCourse.lessons ? continueCourse.lessons.length : 0 }} LESSONS TOTAL</span>
                  </div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[16%]" />
                  </div>
                </div>
              </div>

              <button
                v-if="resumeLesson"
                @click="emitResumeLesson"
                class="px-6 py-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-2xl text-xs transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer border-none"
                id="resume-video-btn"
              >
                <Play class="w-4 h-4 fill-slate-950" />
                <span>Resume Player</span>
              </button>
            </div>
          </div>

          <div v-else class="p-8 bg-slate-900 border border-white/5 rounded-3xl text-center space-y-4">
            <BookOpen class="w-12 h-12 mx-auto text-slate-500" />
            <h3 class="font-display text-lg font-bold">No active enrollments detected</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">Explore our syllabus grid to initialize high-fidelity modules directly on your profile.</p>
          </div>

          <!-- Weekly Analytics Section with SVG graph -->
          <div class="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-display font-bold text-lg">Weekly Experience Telemetry</h3>
                <p class="text-xs text-slate-400 font-light">Interactive tracking of learning points accrued in the current session cycle.</p>
              </div>
              <div class="flex items-center space-x-1 text-xs text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                <TrendingUp class="w-3.5 h-3.5" />
                <span>+45% AVG</span>
              </div>
            </div>

            <!-- High-Fidelity SVG Curve Chart with hover nodes -->
            <div class="relative w-full overflow-x-auto">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-auto overflow-visible select-none">
                <!-- Grid Lines -->
                <line
                  v-for="g in [0, 1, 2, 3]"
                  :key="g"
                  :x1="padding"
                  :y1="padding + (g * (chartHeight - padding * 2)) / 3"
                  :x2="chartWidth - padding"
                  :y2="padding + (g * (chartHeight - padding * 2)) / 3"
                  stroke="rgba(148, 163, 184, 0.08)"
                  stroke-width="1"
                />

                <!-- Gradient area beneath path -->
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="50%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#22d3ee" />
                  </linearGradient>
                </defs>
                
                <path
                  :d="`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`"
                  fill="url(#chartGlow)"
                />

                <!-- Main animated path -->
                <path
                  :d="pathD"
                  fill="none"
                  stroke="url(#lineGradient)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Hover interactive coordinate nodes -->
                <g 
                  v-for="(p, idx) in points"
                  :key="idx" 
                  class="cursor-pointer"
                  @mouseenter="hoveredMetric = idx"
                  @mouseleave="hoveredMetric = null"
                >
                  <circle
                    :cx="p.x"
                    :cy="p.y"
                    :r="hoveredMetric === idx ? '6' : '4'"
                    :fill="hoveredMetric === idx ? '#3b82f6' : 'currentColor'"
                    class="text-white dark:text-slate-900 stroke-blue-500 stroke-2 transition-all"
                  />
                  
                  <!-- Active coordinates value popovers -->
                  <g v-if="hoveredMetric === idx" :transform="`translate(${p.x - 30}, ${p.y - 30})`">
                    <rect width="60" height="22" rx="6" fill="#0f172a" />
                    <text x="30" y="14" fill="#fff" font-size="9" font-weight="bold" font-family="monospace" text-anchor="middle">
                      {{ p.xp }} XP
                    </text>
                  </g>
                </g>

                <!-- X Axis labels -->
                <text
                  v-for="(p, idx) in points"
                  :key="idx"
                  :x="p.x"
                  :y="chartHeight - 6"
                  fill="rgba(148, 163, 184, 0.6)"
                  font-size="9"
                  font-family="monospace"
                  text-anchor="middle"
                >
                  {{ p.day }}
                </text>
              </svg>
            </div>
          </div>

          <!-- Quick action buttons list -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              @click="emitGoToQuiz"
              class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-blue-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow border-solid bg-transparent dark:text-white"
            >
              <Terminal class="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
              <span class="block text-xs font-bold truncate">Practice Quiz</span>
            </button>
            <button 
              @click="emitGoToLive"
              class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-red-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow border-solid bg-transparent dark:text-white"
            >
              <Video class="w-5 h-5 mx-auto text-red-500 group-hover:scale-110 transition-transform" />
              <span class="block text-xs font-bold truncate">Join Seminar</span>
            </button>
            <button 
              @click="emitGoToCertificates"
              class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-amber-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow border-solid bg-transparent dark:text-white"
            >
              <Award class="w-5 h-5 mx-auto text-amber-500 group-hover:scale-110 transition-transform" />
              <span class="block text-xs font-bold truncate">My Certificates</span>
            </button>
            <button 
              @click="emitSelectCourse(courses[0]?.id || '')"
              class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-purple-500/40 text-center space-y-2 cursor-pointer group shadow-sm hover:shadow border-solid bg-transparent dark:text-white"
            >
              <Compass class="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
              <span class="block text-xs font-bold truncate">Audit Grids</span>
            </button>
          </div>

        </div>

        <!-- Right Column: 5/12 layout -->
        <div class="lg:col-span-5 space-y-8 text-left">
          
          <!-- Live Class Waiting Room Indicator -->
          <div 
            v-for="lc in liveClasses"
            :key="lc.id"
            class="p-5 rounded-3xl border text-left space-y-3 transition-all relative overflow-hidden group shadow-sm border-solid"
            :class="lc.isLive ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="lc.isLive ? 'bg-red-500 animate-ping' : 'bg-slate-400'" />
                <span class="text-[10px] font-mono font-bold uppercase tracking-wide">
                  {{ lc.isLive ? 'ACTIVE LIVE NOW' : 'UPCOMING SEMINAR' }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">{{ lc.participantsCount }} WATCHING</span>
            </div>

            <h4 class="font-display font-bold text-sm leading-snug">{{ lc.title }}</h4>
            <p class="text-[11px] text-slate-500 leading-relaxed font-light">{{ lc.description }}</p>
            
            <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/40 border-solid">
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 font-bold">Guide: {{ lc.speaker }}</span>
              <button
                @click="emitGoToLive"
                class="px-4 py-2 bg-slate-950 dark:bg-slate-850 hover:bg-red-600 dark:hover:bg-red-600 text-white font-bold rounded-xl text-[10px] uppercase transition-colors cursor-pointer border-none"
              >
                Enter Room
              </button>
            </div>
          </div>

          <!-- Calendar widget module -->
          <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm border-solid">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Calendar class="w-4.5 h-4.5 text-blue-600" />
                <span class="font-display font-bold text-sm">Study Calendar</span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">JULY 2026</span>
            </div>

            <div class="grid grid-cols-7 gap-1.5 text-center font-mono text-[9px] font-semibold text-slate-400">
              <span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span><span>SU</span>
            </div>
            <div class="grid grid-cols-7 gap-1.5 text-center text-xs font-mono">
              <span v-for="i in 12" :key="`prev-${i}`" class="text-slate-300 dark:text-slate-700 py-1">{{ 20 + i }}</span>
              <span class="bg-blue-600 text-white rounded-lg py-1 font-bold">12</span>
              <span class="bg-purple-600 text-white rounded-lg py-1 font-bold">13</span>
              <span class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg py-1 font-bold border border-blue-500 border-solid">14</span>
              <span v-for="i in 15" :key="`next-${i}`" class="text-slate-600 dark:text-slate-400 py-1">{{ 15 + i }}</span>
            </div>
          </div>

          <!-- Activity feed logs list -->
          <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm border-solid">
            <h4 class="font-display font-bold text-sm">Workspace Activity Logs</h4>
            <div class="space-y-4">
              <div v-for="(act, idx) in recentActivities" :key="idx" class="flex items-start space-x-3 text-xs leading-normal">
                <CheckCircle class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div class="flex-1">
                  <p class="text-slate-800 dark:text-slate-300 font-light">{{ act.text }}</p>
                  <span class="text-[10px] font-mono text-slate-400">{{ act.time }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Play, 
  Award, 
  Flame, 
  Zap, 
  BookOpen, 
  Video, 
  ChevronRight, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  Compass, 
  Terminal 
} from 'lucide-vue-next'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  },
  courses: {
    type: Array,
    required: true
  },
  liveClasses: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'resume-lesson',
  'select-course',
  'go-to-live',
  'go-to-certificates',
  'go-to-quiz'
])

const hoveredMetric = ref(null)
const sidebarCollapsed = ref(false)

const enrolledCourses = computed(() => props.courses || [])
const continueCourse = computed(() => enrolledCourses.value[0])
const resumeLesson = computed(() => {
  if (!continueCourse.value || !continueCourse.value.lessons) return null
  return continueCourse.value.lessons.find(l => !l.isCompleted) || continueCourse.value.lessons[0]
})

const levelProgress = computed(() => {
  return Math.round((props.currentUser.totalXp % 1000) / 10)
})

// Analytics chart dimensions
const chartHeight = 140
const chartWidth = 460
const padding = 25

const chartData = computed(() => [
  { day: 'Mon', xp: Math.round(props.currentUser.totalXp * 0.1) },
  { day: 'Tue', xp: Math.round(props.currentUser.totalXp * 0.25) },
  { day: 'Wed', xp: Math.round(props.currentUser.totalXp * 0.4) },
  { day: 'Thu', xp: Math.round(props.currentUser.totalXp * 0.6) },
  { day: 'Fri', xp: Math.round(props.currentUser.totalXp * 0.75) },
  { day: 'Sat', xp: Math.round(props.currentUser.totalXp * 0.9) },
  { day: 'Sun', xp: props.currentUser.totalXp }
])

const maxXp = computed(() => Math.max(props.currentUser.totalXp, 1000))

const points = computed(() => {
  return chartData.value.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (chartData.value.length - 1)
    const y = chartHeight - padding - (d.xp / maxXp.value) * (chartHeight - padding * 2)
    return { x, y, ...d }
  })
})

const pathD = computed(() => {
  return `M ${points.value.map(p => `${p.x} ${p.y}`).join(' L ')}`
})

const recentActivities = computed(() => [
  { text: `Decrypted session token on Luvia Node`, time: '1 hour ago' },
  { text: `Unlocked ${props.currentUser.currentStreak} Day Learning Streak multiplier`, time: '12 hours ago' },
  { text: `Logged dynamic security session with role ${props.currentUser.role}`, time: 'Yesterday' }
])

const emitSelectCourse = (id) => {
  emit('select-course', id)
}

const emitGoToLive = () => {
  emit('go-to-live')
}

const emitGoToCertificates = () => {
  emit('go-to-certificates')
}

const emitGoToQuiz = () => {
  emit('go-to-quiz')
}

const emitResumeLesson = () => {
  if (continueCourse.value && resumeLesson.value) {
    emit('resume-lesson', continueCourse.value.id, resumeLesson.value.id)
  }
}
</script>
