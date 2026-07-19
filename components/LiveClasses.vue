<template>
  <div class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-12 font-sans w-full">
    
    <div v-if="inWaitingRoom" class="max-w-4xl mx-auto px-6 pt-16 text-center space-y-8">
      <div class="space-y-2">
        <span class="text-xs font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">● VIRTUAL LOBBY ACTIVE</span>
        <h1 class="font-display text-3xl font-bold tracking-tight">Design Systems Seminar</h1>
        <p class="text-xs text-slate-500">Configure your parameters before decanting into the active session with {{ speakerName }}.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto">
        
        <!-- Camera Preview Mock Box -->
        <div class="relative aspect-video rounded-3xl bg-slate-900 border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center">
          <div v-if="cameraOn" class="absolute inset-0 flex flex-col justify-between p-4">
            <div class="flex justify-between items-center text-white text-[10px] font-mono">
              <span class="bg-emerald-500/85 px-2 py-0.5 rounded font-bold">1080P PRO</span>
              <span>SECURE_FEED</span>
            </div>
            
            <!-- Mock vector face avatar container represent camera capture -->
            <div class="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
              <Camera class="w-8 h-8" />
            </div>

            <span class="block text-[8px] font-mono text-slate-400">FPS REFRESH LOCK: 60HZ</span>
          </div>

          <div v-else class="space-y-2 text-slate-400 text-center">
            <VideoOff class="w-10 h-10 mx-auto text-slate-500" />
            <span class="block text-xs font-mono">Camera Shield Active</span>
          </div>
        </div>

        <!-- Config controls column -->
        <div class="space-y-6 text-left">
          <h3 class="font-display font-semibold text-sm">Hardware Setup</h3>
          
          <div class="space-y-3">
            <button
              @click="cameraOn = !cameraOn"
              class="w-full p-4 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer border-solid bg-transparent"
              :class="cameraOn 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                : 'bg-rose-500/10 border-rose-500 text-rose-500'"
            >
              <div class="flex items-center space-x-2">
                <Video v-if="cameraOn" class="w-4 h-4" />
                <VideoOff v-else class="w-4 h-4" />
                <span>{{ cameraOn ? 'CAMERA ENABLED' : 'CAMERA MUTED' }}</span>
              </div>
              <span class="text-[10px] font-mono">TOGGLE</span>
            </button>

            <button
              @click="micOn = !micOn"
              class="w-full p-4 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer border-solid bg-transparent"
              :class="micOn 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                : 'bg-rose-500/10 border-rose-500 text-rose-500'"
            >
              <div class="flex items-center space-x-2">
                <Mic v-if="micOn" class="w-4 h-4" />
                <MicOff v-else class="w-4 h-4" />
                <span>{{ micOn ? 'MICROPHONE ACTIVE' : 'MICROPHONE MUTED' }}</span>
              </div>
              <span class="text-[10px] font-mono">TOGGLE</span>
            </button>
          </div>

          <div class="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/10 rounded-2xl text-[10px] font-mono text-slate-400">
            HOST LATENCY: 12MS • BANDWIDTH: HIGH
          </div>
        </div>

      </div>

      <div class="flex justify-center space-x-3 pt-4">
        <button
          @click="emitGoBack"
          class="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs cursor-pointer border-none"
        >
          Abort Entry
        </button>
        <button
          @click="inWaitingRoom = false"
          class="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer border-none"
          id="join-seminar-btn"
        >
          Enter Interactive Room
        </button>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-6 pt-6">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="text-left">
          <span class="inline-block px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] font-mono font-bold uppercase tracking-wider animate-pulse">● LIVE WORKSHOP</span>
          <h2 class="font-display font-bold text-lg mt-1">Design Systems at Scale ({{ speakerName }} Live)</h2>
        </div>

        <button 
          @click="inWaitingRoom = true"
          class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer border-none"
          id="exit-seminar-btn"
        >
          <PhoneOff class="w-3.5 h-3.5" />
          <span>Leave Session</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- Left Primary Speaker Stream details - 8/12 layout -->
        <div class="lg:col-span-8 flex flex-col space-y-4">
          
          <div class="relative aspect-video rounded-3xl bg-slate-950 border border-slate-200/10 shadow-2xl overflow-hidden flex items-center justify-center">
            <!-- Simulated Speaker Presentation feed -->
            <div class="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" 
                alt="Presentation Slide" 
                class="w-full h-full object-cover filter brightness-50" 
              />
              <div class="absolute inset-0 bg-slate-950/20" />
            </div>

            <!-- Speaker PIP layout overlay -->
            <div class="absolute bottom-4 right-4 w-28 h-20 rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-lg flex items-center justify-center font-bold text-white text-xs">
              {{ speakerName.charAt(0) }}
            </div>

            <div class="absolute top-4 left-4 p-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/5 text-left text-white max-w-xs space-y-1">
              <span class="block text-[8px] font-mono text-cyan-400 font-bold uppercase">PRESENTATION FEED</span>
              <span class="block text-xs font-semibold leading-tight">Deconstructing system variables & interaction layouts</span>
            </div>

            <!-- Waiting indicator overlay -->
            <div class="absolute bottom-4 left-4 text-[9px] font-mono text-white bg-slate-950/80 backdrop-blur px-3 py-1 rounded-xl">
              <span v-if="isHandRaised" class="text-cyan-400 font-bold">✋ HAND RAISED IN ACTIVE STACK</span>
            </div>
          </div>

          <!-- Floating conference participant layout triggers -->
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-center space-x-3 shadow-sm border-solid">
            <button
              @click="micOn = !micOn"
              class="p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent"
              :class="micOn ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white' : 'bg-rose-500 text-white'"
              title="Toggle Mic"
            >
              <Mic v-if="micOn" class="w-4.5 h-4.5" />
              <MicOff v-else class="w-4.5 h-4.5" />
            </button>

            <button
              @click="cameraOn = !cameraOn"
              class="p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent"
              :class="cameraOn ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white' : 'bg-rose-500 text-white'"
              title="Toggle Video"
            >
              <Video v-if="cameraOn" class="w-4.5 h-4.5" />
              <VideoOff v-else class="w-4.5 h-4.5" />
            </button>

            <button
              @click="isHandRaised = !isHandRaised"
              class="p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent"
              :class="isHandRaised ? 'bg-cyan-500 text-slate-950 font-bold animate-bounce' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'"
              title="Raise Hand"
              id="raise-hand-btn"
            >
              <Hand class="w-4.5 h-4.5" />
            </button>

            <div class="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <button
              @click="activePanel = 'chat'"
              class="p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent"
              :class="activePanel === 'chat' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'"
              title="Show Chat"
            >
              <MessageSquare class="w-4.5 h-4.5" />
            </button>

            <button
              @click="activePanel = 'polls'"
              class="p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent"
              :class="activePanel === 'polls' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'"
              title="Show Polls"
            >
              <BarChart class="w-4.5 h-4.5" />
            </button>

            <button
              @click="activePanel = 'whiteboard'"
              class="p-3 rounded-2xl border border-solid transition-colors cursor-pointer bg-transparent"
              :class="activePanel === 'whiteboard' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white'"
              title="Show Whiteboard"
              id="whiteboard-toggle-btn"
            >
              <Edit3 class="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

        <!-- Right Interactive Sidebar - 4/12 layout -->
        <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between min-h-[400px] border-solid">
          
          <!-- Sidebar Header tabs -->
          <div class="space-y-4 flex-1 flex flex-col justify-between">
            <div class="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/80 mb-2 border-solid">
              <span class="font-display font-bold text-sm uppercase">
                <span v-if="activePanel === 'chat'">CHAT STREAM</span>
                <span v-else-if="activePanel === 'polls'">ACTIVE SURVEYS</span>
                <span v-else-if="activePanel === 'whiteboard'">SANDBOX DRAWING</span>
              </span>
              
              <span class="text-[10px] font-mono text-slate-400">SESSION V3</span>
            </div>

            <!-- Panels Area -->
            <div class="flex-1 overflow-y-auto max-h-96">
              
              <div v-if="activePanel === 'chat'" class="space-y-3">
                <div v-for="msg in chatMessages" :key="msg.id" class="text-xs p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ msg.sender }}</span>
                    <span class="text-[9px] font-mono text-slate-400">{{ msg.time }}</span>
                  </div>
                  <p class="text-slate-600 dark:text-slate-400 leading-normal font-light">{{ msg.message }}</p>
                </div>
              </div>

              <div v-else-if="activePanel === 'polls'" class="space-y-4">
                <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl text-xs border border-indigo-500/10 border-solid font-medium">
                  SURVEY QUESTION: Which damping configsettle is ideal for search boxes layout grids?
                </div>

                <div class="space-y-2.5">
                  <button
                    v-for="(opt, idx) in pollOptions"
                    :key="idx"
                    :disabled="pollVoted !== null"
                    @click="handleVote(idx)"
                    class="w-full p-3.5 rounded-xl border border-solid text-left text-xs transition-all relative overflow-hidden flex flex-col cursor-pointer bg-transparent"
                    :class="pollVoted === idx 
                      ? 'bg-blue-500/10 border-blue-500 font-bold text-blue-600' 
                      : 'bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:text-white'"
                  >
                    <div class="flex justify-between items-center z-10 w-full mb-1">
                      <span class="truncate pr-4 font-light">{{ opt.text }}</span>
                      <span class="font-mono text-[10px] font-semibold">{{ getPollPercentage(opt) }}%</span>
                    </div>
                    
                    <!-- Background percent progress filler -->
                    <div 
                      v-if="pollVoted !== null"
                      class="absolute left-0 top-0 bottom-0 bg-blue-500/5 z-0"
                      :style="{ width: `${getPollPercentage(opt)}%` }"
                    />
                  </button>
                </div>
                <span class="block text-center text-[9px] font-mono text-slate-400">{{ totalVotes }} VOTES TOTAL</span>
              </div>

              <div v-else-if="activePanel === 'whiteboard'" class="space-y-3">
                <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2">
                  <span>INTERACTIVE SKETCHPAD</span>
                  <div class="flex space-x-1.5">
                    <button @click="color = '#3b82f6'" class="w-3 h-3 rounded-full bg-blue-500 border-none cursor-pointer" title="Blue" />
                    <button @click="color = '#ec4899'" class="w-3 h-3 rounded-full bg-pink-500 border-none cursor-pointer" title="Pink" />
                    <button @click="color = '#22d3ee'" class="w-3 h-3 rounded-full bg-cyan-400 border-none cursor-pointer" title="Cyan" />
                    <button @click="color = '#10b981'" class="w-3 h-3 rounded-full bg-emerald-500 border-none cursor-pointer" title="Green" />
                  </div>
                </div>

                <!-- Whiteboard HTML5 Canvas drawing element -->
                <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden aspect-video bg-slate-950 border-solid">
                  <canvas
                    ref="canvasRef"
                    width="280"
                    height="160"
                    @mousedown="startDrawing"
                    @mouseup="stopDrawing"
                    @mouseleave="stopDrawing"
                    @mousemove="draw"
                    class="w-full h-full cursor-crosshair block"
                  />
                </div>

                <button
                  @click="clearWhiteboard"
                  class="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer border-none"
                >
                  <Eraser class="w-4.5 h-4.5" />
                  <span>Reset Workspace Sketch</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Chat Send Form -->
          <form v-if="activePanel === 'chat'" @submit.prevent="handleSendChat" class="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 border-solid">
            <input
              type="text"
              v-model="chatInput"
              placeholder="Contribute text..."
              class="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/20 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              id="chat-send-input"
            />
            <button type="submit" class="p-2.5 bg-blue-600 text-white rounded-xl cursor-pointer border-none">
              <Send class="w-4 h-4 text-white" />
            </button>
          </form>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Hand, 
  BarChart, 
  Edit3, 
  PhoneOff, 
  Send, 
  Camera, 
  Eraser 
} from 'lucide-vue-next'

const props = defineProps({
  speakerName: {
    type: String,
    default: 'Marcus Vance'
  }
})

const emit = defineEmits(['go-back'])

const inWaitingRoom = ref(true)
const cameraOn = ref(true)
const micOn = ref(true)
const activePanel = ref('chat')
const isHandRaised = ref(false)

const chatInput = ref('')
const chatMessages = ref([
  { id: 1, sender: 'Sarah Jenkins', message: 'Welcome everyone! We are launching in 2 minutes.', time: '13:10' },
  { id: 2, sender: 'Eleanor', message: 'Super excited for the spring physics math!', time: '13:11' }
])

const pollVoted = ref(null)
const pollOptions = ref([
  { text: 'Underdamped (Elastic spring bounce)', votes: 84 },
  { text: 'Overdamped (Smooth, no overshoot)', votes: 21 },
  { text: 'Critically damped (Fastest settle)', votes: 55 }
])

const totalVotes = computed(() => {
  return pollOptions.value.reduce((acc, curr) => acc + curr.votes, 0)
})

const getPollPercentage = (opt) => {
  return totalVotes.value > 0 ? Math.round((opt.votes / totalVotes.value) * 100) : 0
}

const canvasRef = ref(null)
const isDrawing = ref(false)
const color = ref('#3b82f6')

const initializeWhiteboard = () => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      for (let i = 20; i < canvas.width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 20; i < canvas.height; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }
    }
  }
}

watch([activePanel, inWaitingRoom], () => {
  if (activePanel.value === 'whiteboard' && !inWaitingRoom.value) {
    // Wait for the next tick to draw
    setTimeout(initializeWhiteboard, 100)
  }
})

const startDrawing = (e) => {
  isDrawing.value = true
  draw(e)
}

const stopDrawing = () => {
  isDrawing.value = false
}

const draw = (e) => {
  if (!isDrawing.value || !canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.strokeStyle = color.value
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const clearWhiteboard = () => {
  initializeWhiteboard()
}

const handleSendChat = () => {
  if (!chatInput.value.trim()) return

  const msg = {
    id: Date.now(),
    sender: 'Alex Mercer',
    message: chatInput.value,
    time: '13:12'
  }
  chatMessages.value.push(msg)
  chatInput.value = ''
}

const handleVote = (idx) => {
  if (pollVoted.value !== null) return
  pollVoted.value = idx
  pollOptions.value[idx].votes++
}

const emitGoBack = () => {
  emit('go-back')
}
</script>
