<template>
  <div class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans text-left w-full">
    
    <!-- Visual Header -->
    <div class="max-w-4xl mx-auto px-6 pt-12 space-y-4">
      <div class="flex items-center justify-between">
        <button 
          @click="emitGoBack"
          class="text-xs font-mono font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer border-none bg-transparent"
        >
          ← Back to Dashboard
        </button>
        
        <div class="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl font-mono text-xs font-bold border border-solid border-rose-500/15">
          <Clock class="w-4 h-4 animate-pulse" />
          <span>TIME REMAINING: {{ formatTimer(secondsRemaining) }}</span>
        </div>
      </div>

      <div>
        <span class="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">ACTIVE CHALLENGE ASSIGNMENT</span>
        <h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1">UX/UI Cognitive Validation Exam</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-light">Validate your design engineering and spring calculus credentials.</p>
      </div>

      <!-- Progress bar -->
      <div class="space-y-1 pt-2">
        <div class="flex justify-between text-[10px] font-mono text-slate-400">
          <span>EXAM COMPLETION BAR</span>
          <span>QUESTION {{ currentIdx + 1 }} OF {{ quizQuestions.length }}</span>
        </div>
        <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
            :style="{ width: `${((currentIdx + (hasSubmitted ? 1 : 0)) / quizQuestions.length) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Main interactive segment -->
    <div class="max-w-4xl mx-auto px-6 mt-8">
      <div v-if="!isFinished" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl border-solid">
        
        <div class="space-y-4 text-left">
          <span class="px-2.5 py-1 bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-cyan-400 rounded-lg text-[10px] font-mono font-bold uppercase">
            COGNITIVE DILEMMA
          </span>
          <h2 class="font-display font-bold text-lg md:text-xl text-slate-900 dark:text-white leading-snug">
            {{ activeQuestion.question }}
          </h2>
        </div>

        <!-- Selection Options -->
        <div class="space-y-3 pt-2 text-left">
          <button
            v-for="(option, idx) in activeQuestion.options"
            :key="idx"
            :disabled="hasSubmitted"
            @click="handleSelectOption(idx)"
            class="w-full p-4.5 rounded-2xl border border-solid text-left text-xs md:text-sm transition-all flex items-start space-x-3 cursor-pointer"
            :class="getOptionClass(idx)"
          >
            <span class="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">
              {{ String.fromCharCode(65 + idx) }}.
            </span>
            <span class="flex-1 leading-relaxed font-light">{{ option }}</span>
            
            <Check v-if="hasSubmitted && idx === activeQuestion.correctAnswer" class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <X v-else-if="hasSubmitted && selectedAnswer === idx && idx !== activeQuestion.correctAnswer" class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          </button>
        </div>

        <!-- Explanation box -->
        <div v-if="hasSubmitted" class="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/20 border-solid space-y-2 animate-in fade-in duration-200 text-left">
          <div class="flex items-center space-x-1 text-[10px] font-mono font-bold text-slate-400">
            <HelpCircle class="w-4 h-4 text-blue-600" />
            <span>CURATOR EXPLANATION</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            {{ activeQuestion.explanation }}
          </p>
        </div>

        <!-- Control triggers -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 border-solid flex justify-between items-center">
          <span class="text-[10px] font-mono text-slate-400">SECURED LOCAL PACKET</span>
          
          <button
            v-if="!hasSubmitted"
            :disabled="selectedAnswer === null"
            @click="handleAnswerSubmit"
            class="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer border-none"
            id="quiz-submit-btn"
          >
            Submit Answer
          </button>
          <button
            v-else
            @click="handleNextQuestion"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center space-x-1.5 border-none"
            id="quiz-next-btn"
          >
            <span>{{ currentIdx < quizQuestions.length - 1 ? 'Next Challenge' : 'Complete Assignment' }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Finished score dashboard visualization -->
      <div v-else class="bg-slate-900 border border-white/10 border-solid rounded-3xl p-8 text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div class="max-w-md mx-auto space-y-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[1.5px] mx-auto">
            <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Award class="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">TELEMETRY RECEIVED</span>
            <h2 class="font-display text-3xl font-bold tracking-tight text-white">Assignment Concluded</h2>
            <p class="text-xs text-slate-400 font-light leading-relaxed">
              Excellent focus Mercer! Your evaluations have been integrated into our design system databases.
            </p>
          </div>

          <!-- Dynamic Score Ring -->
          <div class="py-4">
            <div class="relative w-28 h-28 mx-auto">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="6" />
                <circle cx="56" cy="56" r="48" fill="transparent" stroke="currentColor" stroke-width="6" :stroke-dasharray="301" :stroke-dashoffset="301 - (301 * scorePercentage) / 100" class="text-cyan-400" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-display text-2xl font-black">{{ scorePercentage }}%</span>
                <span class="text-[9px] font-mono text-slate-500 uppercase">{{ correctCount }} / {{ quizQuestions.length }} CORRECT</span>
              </div>
            </div>
          </div>

          <!-- Custom suggestions performance guidelines -->
          <div class="p-4 bg-slate-950 border border-white/5 border-solid rounded-2xl text-left space-y-3">
            <div class="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-slate-400">
              <ShieldCheck class="w-4 h-4 text-emerald-500" />
              <span>RECOMMENDED REINFORCEMENTS:</span>
            </div>
            
            <p v-if="scorePercentage >= 80" class="text-xs text-slate-400 leading-relaxed font-light">
              You have achieved elite proficiency. We recommend enrolling in <span class="text-white font-semibold">"SaaS Design Systems at Scale"</span> or exploring advanced layout morph guidelines.
            </p>
            <p v-else class="text-xs text-slate-400 leading-relaxed font-light">
              Good attempt. We suggest reviewing <span class="text-white font-semibold">"The Mathematics of Springs"</span> segment and trying the interactive quiz again to solidify parameters.
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="handleResetQuiz"
              class="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 border-none"
            >
              <RefreshCw class="w-4 h-4" />
              <span>Retry Exam</span>
            </button>
            
            <button
              @click="emitGoBack"
              class="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer border-none"
            >
              Return to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Check, 
  X, 
  HelpCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-vue-next'

const emit = defineEmits(['quiz-complete', 'go-back'])

const quizQuestions = ref([
  {
    id: 'q-1',
    question: 'Why does Apple recommend using spring animations over standard cubic-bezier curves for fluid interfaces?',
    options: [
      'Springs look slightly cooler on mobile devices.',
      'Springs dynamically calculate velocity, mass, and drag based on physical properties, ensuring organic tracking and continuous velocity.',
      'Springs consume less CPU power and reduce background battery drain.',
      'Springs force the browser to skip the compositing step of rendering.'
    ],
    correctAnswer: 1,
    explanation: 'Physical springs do not have a fixed time duration. Instead, they respond directly to mass, stiffness, and starting velocities, providing fluid continuity without sudden, artificial deceleration hooks.'
  },
  {
    id: 'q-2',
    question: 'In minimalist typography, what is the primary purpose of tight tracking (letter-spacing) on extra large display headings?',
    options: [
      'To squeeze more words onto a single line.',
      'To match old newspaper print styles.',
      'To increase typographical density and create a cohesive, authoritative block aesthetic that feels integrated.',
      'To satisfy search engine crawling algorithms.'
    ],
    correctAnswer: 2,
    explanation: 'Tight letter-spacing on display sizes (32px+) pulls the characters together, improving word shape recognition and providing a cohesive, premium, and structured visual lockup.'
  },
  {
    id: 'q-3',
    question: 'Which CSS property configuration is critical for hardware-accelerated, high-fidelity glassmorphism blurs?',
    options: [
      'filter: blur(10px) with transform: scale(0.9)',
      'background: rgba(...) combined with backdrop-filter: blur(...) and will-change: transform/backdrop-filter',
      'border-width: 4px with box-shadow: inset',
      'mix-blend-mode: color-burn and contrast: 150%'
    ],
    correctAnswer: 1,
    explanation: 'By pairing transparent alpha values in the background with backdrop-filter: blur(...) and marking key layers with will-change, the browser leverages the GPU for smooth real-time compositor blending during scrolling.'
  }
])

const currentIdx = ref(0)
const selectedAnswer = ref(null)
const hasSubmitted = ref(false)
const correctCount = ref(0)
const isFinished = ref(false)
const secondsRemaining = ref(180)
const userAnswers = ref({})

const activeQuestion = computed(() => {
  return quizQuestions.value[currentIdx.value]
})

let timerInterval = null

onMounted(() => {
  timerInterval = setInterval(() => {
    if (isFinished.value) return
    if (secondsRemaining.value <= 0) {
      isFinished.value = true
      return
    }
    secondsRemaining.value--
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const handleSelectOption = (idx) => {
  if (hasSubmitted.value) return
  selectedAnswer.value = idx
}

const handleAnswerSubmit = () => {
  if (selectedAnswer.value === null || hasSubmitted.value) return
  
  hasSubmitted.value = true
  userAnswers.value[currentIdx.value] = selectedAnswer.value

  if (selectedAnswer.value === activeQuestion.value.correctAnswer) {
    correctCount.value++
  }
}

const handleNextQuestion = () => {
  selectedAnswer.value = null
  hasSubmitted.value = false

  if (currentIdx.value < quizQuestions.value.length - 1) {
    currentIdx.value++
  } else {
    isFinished.value = true
    emit('quiz-complete', correctCount.value * 300)
  }
}

const handleResetQuiz = () => {
  currentIdx.value = 0
  selectedAnswer.value = null
  hasSubmitted.value = false
  correctCount.value = 0
  isFinished.value = false
  secondsRemaining.value = 180
  userAnswers.value = {}
}

const formatTimer = (secs) => {
  const mins = Math.floor(secs / 60)
  const remainingSecs = secs % 60
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`
}

const scorePercentage = computed(() => {
  return Math.round((correctCount.value / quizQuestions.value.length) * 100)
})

const getOptionClass = (idx) => {
  const isSelected = selectedAnswer.value === idx
  const isCorrectOption = idx === activeQuestion.value.correctAnswer
  
  if (!hasSubmitted.value) {
    return isSelected 
      ? 'bg-blue-500/5 border-blue-500 text-blue-600 dark:text-cyan-400 font-bold' 
      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-850 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
  }

  if (isCorrectOption) {
    return 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
  }
  
  if (isSelected) {
    return 'bg-rose-500/10 border-rose-500 text-rose-500'
  }

  return 'opacity-40 border-slate-200 dark:border-slate-800 bg-transparent text-slate-400'
}

const emitGoBack = () => {
  emit('go-back')
}
</script>
