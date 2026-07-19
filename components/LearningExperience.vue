<template>
  <div v-if="!course || !activeLesson" class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white font-sans">
    <h2 class="font-display text-xl font-bold">Module session initializing...</h2>
    <button @click="emitGoBack" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs uppercase font-bold cursor-pointer border-none">
      Return
    </button>
  </div>

  <div v-else class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans">
    
    <!-- Ambient background blur sync layer -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] pointer-events-none z-0">
      <div class="w-full h-full bg-gradient-to-r blur-[120px] transition-all duration-1000 rounded-3xl opacity-50" :class="ambientGlow" />
    </div>

    <!-- Primary Video Screen Area -->
    <div class="max-w-7xl mx-auto px-6 pt-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Video Player column - 8/12 layout -->
      <div class="lg:col-span-8 text-left space-y-6">
        
        <!-- Header row -->
        <div class="flex items-center justify-between">
          <button 
            @click="emitGoBack"
            class="text-xs font-mono font-bold tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          >
            ← RETURN TO LANDSCAPE
          </button>
          
          <div class="flex items-center space-x-3">
            <button
              @click="isFocusMode = !isFocusMode"
              class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer bg-transparent"
              :class="isFocusMode 
                ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 border-slate-200/20 text-slate-500 hover:text-slate-900'"
              title="Toggle focus mode hides comments and list"
            >
              <EyeOff v-if="isFocusMode" class="w-3.5 h-3.5" />
              <Eye v-else class="w-3.5 h-3.5" />
              <span>{{ isFocusMode ? 'FOCUS MODE ACTIVE' : 'FOCUS MODE' }}</span>
            </button>

            <button
              @click="showShortcutsInfo = !showShortcutsInfo"
              class="p-1.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-slate-400 hover:text-slate-900 cursor-pointer bg-transparent"
              title="Keyboard shortcuts info"
            >
              <Keyboard class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="showShortcutsInfo" class="p-4 bg-slate-900 text-white rounded-2xl border border-white/10 space-y-2 text-xs font-mono">
          <div class="flex items-center justify-between">
            <span class="font-bold text-cyan-400">KEYBOARD POWER ACTIONS</span>
            <button @click="showShortcutsInfo = false" class="text-slate-400 hover:text-white bg-transparent border-none">✕</button>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-2">
            <div><kbd class="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> Play / Pause</div>
            <div><kbd class="px-1.5 py-0.5 bg-slate-800 rounded">F</kbd> Focus Mode</div>
            <div><kbd class="px-1.5 py-0.5 bg-slate-800 rounded">N</kbd> Instant Note</div>
          </div>
        </div>

        <!-- Actual Video Element Container -->
        <div class="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/10 shadow-2xl group">
          
          <video
            ref="videoRef"
            :src="activeLesson.videoUrl"
            @timeupdate="handleTimeUpdate"
            @click="togglePlay"
            class="w-full h-full object-cover cursor-pointer"
          />

          <!-- Custom Interactive Floating overlay controls -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 space-y-4">
            
            <!-- Timeline progress line bar -->
            <div 
              class="w-full h-1 bg-white/20 rounded-full cursor-pointer relative"
              @click="seekVideo"
            >
              <div 
                class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                :style="{ width: `${(currentTime / duration) * 100}%` }"
              />
            </div>

            <div class="flex items-center justify-between text-white text-xs">
              <div class="flex items-center space-x-4">
                <button @click="togglePlay" class="p-1 hover:text-cyan-400 cursor-pointer bg-transparent border-none">
                  <Pause v-if="isPlaying" class="w-5 h-5 fill-current text-white" />
                  <Play v-else class="w-5 h-5 fill-current text-white" />
                </button>
                <span class="font-mono text-[10px] tracking-wider text-slate-300">
                  {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                </span>
              </div>

              <div class="flex items-center space-x-3 text-slate-300">
                <Volume2 class="w-4.5 h-4.5" />
                <span class="font-mono text-[10px] uppercase">{{ activeLesson.xp }} XP</span>
                <Maximize class="w-4.5 h-4.5 cursor-pointer" @click="requestFullscreen" />
              </div>
            </div>

          </div>
        </div>

        <!-- Lesson details & Completion Checkbox -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl shadow-sm text-left border-solid">
          <div class="space-y-1">
            <span class="text-[10px] font-mono text-slate-400 uppercase">ACTIVE CHAPTER MODULE</span>
            <h2 class="font-display font-bold text-lg">{{ activeLesson.title }}</h2>
            <p class="text-xs text-slate-500">Unlocks {{ activeLesson.xp }} XP points upon active session validation.</p>
          </div>

          <button
            @click="triggerCompletion"
            class="px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 cursor-pointer border-none"
            :class="activeLesson.isCompleted 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'"
            id="complete-lesson-btn"
          >
            <CheckCircle class="w-4 h-4" />
            <span>{{ activeLesson.isCompleted ? 'MODULE COMPLETED' : 'VALIDATE COMPLETION' }}</span>
          </button>
        </div>

        <!-- Tabs for Notes, Transcript and Comments -->
        <div v-if="!isFocusMode" class="space-y-6">
          
          <!-- Lab Attachments Box -->
          <div v-if="activeLesson.attachments && activeLesson.attachments.length > 0" class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-3 shadow-sm border-solid">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">ACADEMIC ATTACHMENTS</span>
            <div class="space-y-2">
              <div v-for="(att, i) in activeLesson.attachments" :key="i" class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-xs">
                <span class="font-semibold">{{ att.name }}</span>
                <a href="#" class="flex items-center space-x-1.5 text-blue-600 dark:text-cyan-400 font-mono text-[10px] font-bold">
                  <Download class="w-3.5 h-3.5" />
                  <span>{{ att.size }}</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Live transcript lines list -->
          <div v-if="activeLesson.transcript" class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm border-solid">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-mono text-slate-400 uppercase">INTELLIGENT SCROLL TRANSCRIPT</span>
              <span class="text-[9px] font-mono text-blue-600 dark:text-cyan-400 font-bold">● ACTIVE SYNC</span>
            </div>

            <div class="space-y-3 max-h-48 overflow-y-auto pr-2">
              <button
                v-for="(line, idx) in activeLesson.transcript"
                :key="idx"
                @click="seekToTime(line.time)"
                class="w-full flex items-start space-x-4 text-left p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg text-xs leading-relaxed text-slate-600 dark:text-slate-400 cursor-pointer border-none bg-transparent"
              >
                <span class="font-mono text-[10px] text-blue-600 dark:text-cyan-400 font-bold mt-0.5 shrink-0">{{ line.time }}</span>
                <span class="font-light">{{ line.text }}</span>
              </button>
            </div>
          </div>

          <!-- Notes pad area -->
          <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl text-left space-y-4 shadow-sm border-solid">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">STUDY SCRATCHPAD</span>
            <div class="flex space-x-2">
              <input
                type="text"
                v-model="notesText"
                placeholder="Type notes and anchor them to timestamp..."
                class="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/20 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                id="note-input"
              />
              <button
                @click="addManualNote"
                class="p-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs cursor-pointer border-none"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <div v-if="notesList.length > 0" class="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800/40 border-solid">
              <div v-for="nt in notesList" :key="nt.id" class="flex justify-between items-start text-xs p-2 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
                <div class="space-x-2">
                  <span class="font-mono text-[9px] text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">{{ nt.timestamp }}</span>
                  <span class="text-slate-700 dark:text-slate-300 font-light">{{ nt.text }}</span>
                </div>
                <button 
                  @click="deleteNote(nt.id)"
                  class="text-slate-400 hover:text-slate-600 bg-transparent border-none"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Timestamped Comments and feedback section -->
          <div class="space-y-4">
            <h3 class="font-display font-bold text-base">Lecture Discussion Room</h3>
            
            <form @submit.prevent="handleAddComment" class="flex space-x-3 bg-white dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800/60 rounded-2xl shadow-sm border-solid">
              <input
                type="text"
                v-model="newComment"
                placeholder="Contribute ideas to current timestamp..."
                class="flex-1 px-3 py-2 bg-transparent text-xs focus:outline-none placeholder:text-slate-500"
                id="comment-input"
              />
              <button type="submit" class="p-2 bg-blue-600 text-white rounded-xl cursor-pointer border-none">
                <Send class="w-3.5 h-3.5 animate-pulse" />
              </button>
            </form>

            <div class="space-y-4">
              <div v-for="cm in comments" :key="cm.id" class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-left space-y-3 shadow-sm border-solid">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2.5">
                    <img :src="cm.authorAvatar" :alt="cm.authorName" class="w-7 h-7 rounded-full object-cover" />
                    <div class="text-left">
                      <span class="block text-xs font-semibold">{{ cm.authorName }}</span>
                      <span class="block text-[9px] font-mono text-slate-400">{{ cm.timestamp }}</span>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  {{ cm.content }}
                </p>

                <div class="flex space-x-2 pt-1">
                  <button
                    v-for="(re, rIdx) in cm.reactions"
                    :key="rIdx"
                    @click="toggleReaction(cm.id, re.emoji)"
                    class="flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none"
                    :class="re.userReacted 
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/10 border-solid' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500'"
                  >
                    <span>{{ re.emoji }}</span>
                    <span>{{ re.count }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Right Floating Chapter Lesson navigation panel - 4/12 layout -->
      <div v-if="!isFocusMode" class="lg:col-span-4 text-left space-y-6">
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-xl sticky top-24 border-solid">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 border-solid">
            <span class="font-display font-bold text-sm">Syllabus Index</span>
            <span class="text-[10px] font-mono text-slate-400">{{ (course.lessons || []).length }} LESSONS</span>
          </div>

          <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
            <button
              v-for="(lesson, idx) in course.lessons"
              :key="lesson.id"
              :disabled="lesson.isLocked"
              @click="selectNewLesson(lesson)"
              class="w-full flex items-start justify-between p-3 rounded-xl transition-all border text-left cursor-pointer border-solid"
              :class="activeLesson.id === lesson.id 
                ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-cyan-400 font-bold' 
                : lesson.isLocked 
                  ? 'opacity-40 border-transparent bg-transparent cursor-not-allowed' 
                  : 'border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-start space-x-2.5 text-xs">
                <span class="font-mono text-[9px] text-slate-400 mt-0.5">{{ String(idx + 1).padStart(2, '0') }}</span>
                <div>
                  <span class="block truncate max-w-56">{{ lesson.title }}</span>
                  <span class="block text-[9px] font-mono text-slate-400 mt-0.5">{{ lesson.duration }} • {{ lesson.xp }} XP</span>
                </div>
              </div>

              <Lock v-if="lesson.isLocked" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <CheckCircle v-else-if="lesson.isCompleted" class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Modern Completion Celebration Modal -->
    <div v-if="showCelebration" class="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
      <div class="relative w-full max-w-md p-8 bg-slate-900 border border-white/10 rounded-3xl text-center space-y-6 shadow-2xl text-white border-solid">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-3xl p-[1px] flex items-center justify-center shadow-xl">
          <div class="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Award class="w-10 h-10 text-cyan-400" />
          </div>
        </div>

        <div class="pt-8 space-y-2">
          <span class="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">ACADEMIC DECISION MINTED</span>
          <h3 class="font-display text-2xl font-bold tracking-tight">Active Module Decrypted</h3>
          <p class="text-xs text-slate-400 leading-relaxed font-light">
            Congratulations Mercer! You have acquired <span class="font-bold text-white">+{{ activeLesson.xp }} XP</span> and successfully registered completion of:
          </p>
          <span class="block text-xs font-semibold bg-slate-950 p-2.5 rounded-xl border border-white/5 border-solid">{{ activeLesson.title }}</span>
        </div>

        <div class="flex space-x-3 pt-2">
          <button
            @click="showCelebration = false"
            class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border-none"
          >
            Close Logs
          </button>
          <button
            @click="celebrationNext"
            class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer border-none"
          >
            Next Lesson
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Download, 
  Send, 
  Plus, 
  Eye, 
  EyeOff, 
  Keyboard, 
  Volume2, 
  Maximize, 
  Lock, 
  Award 
} from 'lucide-vue-next'
import confetti from 'canvas-confetti'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  },
  courses: {
    type: Array,
    required: true
  },
  activeLessonId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['complete-lesson', 'go-back'])

const course = computed(() => {
  return props.courses.find(c => c.id === props.courseId) || props.courses[0]
})

const activeLesson = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(120)
const ambientGlow = ref('from-blue-600/20 to-purple-600/20')
const isFocusMode = ref(false)
const notesText = ref('')
const notesList = ref([])
const comments = ref([])
const newComment = ref('')
const showCelebration = ref(false)
const showShortcutsInfo = ref(false)

const videoRef = ref(null)

// Sync selected lesson
watch([course, () => props.activeLessonId], () => {
  if (course.value && course.value.lessons) {
    const selected = course.value.lessons.find(l => l.id === props.activeLessonId) || course.value.lessons[0]
    activeLesson.value = selected
  }
}, { immediate: true })

// Sync ambient glowing effects
watch(activeLesson, (newLesson) => {
  if (!newLesson) return
  if (newLesson.id.endsWith('l1')) {
    ambientGlow.value = 'from-blue-600/30 to-purple-600/30'
  } else if (newLesson.id.endsWith('l2')) {
    ambientGlow.value = 'from-purple-600/30 to-rose-600/30'
  } else {
    ambientGlow.value = 'from-cyan-400/30 to-indigo-600/30'
  }
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    currentTime.value = 0
  }
})

const handleKeyPress = (e) => {
  if (
    document.activeElement?.tagName === 'INPUT' || 
    document.activeElement?.tagName === 'TEXTAREA'
  ) {
    return
  }

  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  } else if (e.key.toLowerCase() === 'f') {
    e.preventDefault()
    isFocusMode.value = !isFocusMode.value
  } else if (e.key.toLowerCase() === 'n') {
    e.preventDefault()
    const currentSecs = Math.floor(videoRef.value?.currentTime || currentTime.value)
    addInstantNote(currentSecs)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play().catch(() => {})
    }
    isPlaying.value = !isPlaying.value
  }
}

const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    if (videoRef.value.duration) {
      duration.value = videoRef.value.duration
    }
  }
}

const seekVideo = (e) => {
  if (videoRef.value) {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    videoRef.value.currentTime = percent * duration.value
  }
}

const seekToTime = (timeStr) => {
  const [m, s] = timeStr.split(':').map(Number)
  if (videoRef.value) {
    videoRef.value.currentTime = m * 60 + s
    currentTime.value = m * 60 + s
    isPlaying.value = true
    videoRef.value.play().catch(() => {})
  }
}

const addInstantNote = (secs) => {
  const timestampStr = formatTime(secs)
  const newNote = {
    id: Date.now(),
    timestamp: timestampStr,
    text: `Draft note at ${timestampStr} - Enter thoughts here...`
  }
  notesList.value.unshift(newNote)
}

const addManualNote = () => {
  if (!notesText.value.trim()) return
  const timestampStr = formatTime(currentTime.value)
  const newNote = {
    id: Date.now(),
    timestamp: timestampStr,
    text: notesText.value
  }
  notesList.value.unshift(newNote)
  notesText.value = ''
}

const deleteNote = (id) => {
  notesList.value = notesList.value.filter(n => n.id !== id)
}

const handleAddComment = () => {
  if (!newComment.value.trim()) return

  const added = {
    id: `comment-${Date.now()}`,
    authorName: 'Alex Mercer',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    content: newComment.value,
    timestamp: 'Just now',
    reactions: [
      { emoji: '🔥', count: 0 }
    ]
  }

  comments.value.push(added)
  newComment.value = ''
}

const toggleReaction = (commentId, emoji) => {
  comments.value = comments.value.map(c => {
    if (c.id === commentId) {
      const reactions = c.reactions.map(r => {
        if (r.emoji === emoji) {
          const added = r.userReacted ? -1 : 1
          return { ...r, count: r.count + added, userReacted: !r.userReacted }
        }
        return r
      })
      return { ...c, reactions }
    }
    return c
  })
}

const formatTime = (timeInSecs) => {
  const mins = Math.floor(timeInSecs / 60)
  const secs = Math.floor(timeInSecs % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

const triggerCompletion = () => {
  if (!activeLesson.value) return
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  })

  showCelebration.value = true
  activeLesson.value.isCompleted = true
  emit('complete-lesson', activeLesson.value.id, activeLesson.value.xp)
}

const selectNewLesson = (lesson) => {
  if (lesson.isLocked) return
  activeLesson.value = lesson
}

const requestFullscreen = () => {
  videoRef.value?.requestFullscreen?.()
}

const celebrationNext = () => {
  showCelebration.value = false
  const lessons = course.value.lessons || []
  const nextIdx = lessons.findIndex(l => l.id === activeLesson.value.id) + 1
  if (nextIdx < lessons.length && !lessons[nextIdx].isLocked) {
    activeLesson.value = lessons[nextIdx]
  } else {
    emit('go-back')
  }
}

const emitGoBack = () => {
  emit('go-back')
}
</script>
