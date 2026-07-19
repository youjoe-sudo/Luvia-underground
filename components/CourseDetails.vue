<template>
  <div v-if="!course" class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white font-sans">
    <h2 class="font-display text-xl font-bold">Course Blueprint not found</h2>
    <button @click="emitGoBack" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs uppercase font-bold cursor-pointer border-none">
      Return to Explore
    </button>
  </div>

  <div v-else class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans">
    
    <!-- Visual Header Banner -->
    <div class="relative h-[300px] md:h-[400px] w-full overflow-hidden">
      <img 
        :src="course.coverImage" 
        :alt="course.title" 
        class="w-full h-full object-cover brightness-50" 
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-950/40 to-transparent" />
      
      <div class="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto z-10 text-left space-y-3">
        <button 
          @click="emitGoBack"
          class="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-semibold text-white tracking-wide cursor-pointer transition-colors border-none"
        >
          ← Back to Explorations
        </button>
        
        <div class="flex space-x-2">
          <span class="px-3 py-1 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-full text-[9px] font-mono font-bold text-white uppercase">
            {{ course.category }}
          </span>
          <span class="px-3 py-1 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-full text-[9px] font-mono font-bold text-white uppercase">
            {{ course.difficulty }} LEVEL
          </span>
        </div>

        <h1 class="font-display text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-4xl">
          {{ course.title }}
        </h1>
        
        <p class="text-xs md:text-sm text-slate-300 max-w-2xl font-light">
          {{ course.subtitle }}
        </p>
      </div>
    </div>

    <!-- Main Grid: Description (Left) + Floating Purchase Sidebar (Right) -->
    <div class="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Elements (Syllabus details) - 7/12 layout -->
      <div class="lg:col-span-7 text-left space-y-10">
        
        <!-- Main commentary -->
        <div class="space-y-4">
          <h2 class="font-display text-xl md:text-2xl font-bold">Curator Commentary</h2>
          <div class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light whitespace-pre-line">
            {{ course.description }}
          </div>
        </div>

        <!-- Outcomes list -->
        <div v-if="course.outcomes && course.outcomes.length > 0" class="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl space-y-4 shadow-sm">
          <h3 class="font-display font-bold text-base">Key Skillset Outcomes</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(out, i) in course.outcomes" :key="i" class="flex items-start space-x-2.5 text-xs">
              <div class="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                <Check class="w-3 h-3" />
              </div>
              <span class="text-slate-600 dark:text-slate-400 leading-relaxed font-light">{{ out }}</span>
            </div>
          </div>
        </div>

        <!-- Requirements list -->
        <div v-if="course.requirements && course.requirements.length > 0" class="space-y-4">
          <h3 class="font-display font-bold text-base">Prerequisites & Baseline Setup</h3>
          <ul class="space-y-2.5 list-none p-0">
            <li v-for="(req, i) in course.requirements" :key="i" class="flex items-center space-x-3 text-xs">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span class="text-slate-600 dark:text-slate-400 font-light">{{ req }}</span>
            </li>
          </ul>
        </div>

        <!-- Accordion Chapter Syllabus list -->
        <div class="space-y-4">
          <h3 class="font-display font-bold text-base">Interactive Lecture Timeline</h3>
          <p class="text-xs text-slate-400 font-light">Click modules to expand lecture scopes, available transcripts, and physical code assets.</p>

          <div class="space-y-3">
            <div 
              v-for="lesson in course.lessons" 
              :key="lesson.id" 
              class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              <button
                @click="toggleLesson(lesson.id)"
                class="w-full p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent dark:text-white"
              >
                <div class="flex items-center space-x-3 text-xs font-semibold">
                  <Lock v-if="lesson.isLocked" class="w-4 h-4 text-slate-400" />
                  <Unlock v-else class="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>{{ lesson.title }}</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-mono text-slate-400">{{ lesson.duration }}</span>
                  <ChevronUp v-if="expandedLessons[lesson.id]" class="w-4 h-4 text-slate-400" />
                  <ChevronDown v-else class="w-4 h-4 text-slate-400" />
                </div>
              </button>

              <div v-if="expandedLessons[lesson.id]" class="px-4 pb-4 pt-1 border-t border-slate-50 dark:border-slate-800/40 space-y-3 text-left">
                <div class="text-xs text-slate-500 dark:text-slate-400 font-light">
                  <span v-if="lesson.isLocked" class="text-amber-600 dark:text-amber-400 flex items-center space-x-1 font-mono text-[10px]">
                    <span>🔒 SECURE SHIELD ACTIVE. COMPLETE PRECEDING CHALLENGES TO DECRYPT.</span>
                  </span>
                  <span v-else>This active workspace sandbox focuses on spring configurations, variables, and interaction mechanics.</span>
                </div>

                <div v-if="!lesson.isLocked && lesson.attachments && lesson.attachments.length" class="space-y-2 pt-2">
                  <span class="block text-[9px] font-mono text-slate-400 uppercase">INCLUDED LAB ASSETS:</span>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(att, idx) in lesson.attachments" :key="idx" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 rounded-lg text-[10px] text-slate-700 dark:text-slate-300">
                      {{ att.name }} ({{ att.size }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructor Bio Profile Card -->
        <div v-if="course.instructor" class="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-3xl uppercase shrink-0">
            {{ course.instructor.name.charAt(0) }}
          </div>
          <div class="flex-1 space-y-2 text-center md:text-left">
            <span class="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold uppercase">SYLLABUS DEVELOPER</span>
            <h4 class="font-display font-bold text-lg text-slate-900 dark:text-white">{{ course.instructor.name }}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Expert educator guiding spatial systems and enterprise interface designs.
            </p>
          </div>
        </div>

      </div>

      <!-- Right Sidebar (Pricing & Vouchers) - 5/12 layout -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Main Floating Pricing Card -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-xl space-y-6 text-left sticky top-24">
          
          <div class="space-y-1">
            <span class="text-[10px] font-mono text-slate-400 uppercase">TUITION FEE SUMMARY</span>
            <div class="flex items-baseline space-x-2">
              <span class="font-display text-4xl font-extrabold text-slate-900 dark:text-white">${{ finalPrice.toFixed(2) }}</span>
              <span v-if="discountPercent > 0" class="text-sm text-slate-400 line-through">${{ originalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <button
              @click="emitStartCourse"
              class="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border-none"
              id="buy-course-btn"
            >
              <span>Initialize Module Decryption</span>
              <ArrowRight class="w-4.5 h-4.5" />
            </button>
            <span class="block text-[9px] text-slate-400 text-center font-mono uppercase">14-DAY MONEY-BACK QUALITY ACCORD</span>
          </div>

          <!-- Voucher Redemption panel -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">COUPON REDEMPTION TOKEN</span>
            
            <form @submit.prevent="handleApplyVoucher" class="flex space-x-2">
              <input 
                type="text" 
                v-model="voucherCode"
                placeholder="e.g. SYSTEM50"
                class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/20 dark:border-slate-800 rounded-xl text-xs uppercase font-mono text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none"
                id="voucher-input"
              />
              <button
                type="submit"
                class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-xs font-semibold cursor-pointer border-none"
              >
                Apply
              </button>
            </form>

            <span v-if="voucherError" class="block text-[10px] font-mono text-rose-500">{{ voucherError }}</span>
            <span v-if="voucherSuccess" class="block text-[10px] font-mono text-emerald-500">{{ voucherSuccess }}</span>
          </div>

          <!-- Structured specifications of tuition -->
          <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-400">
            <div class="flex items-center justify-between">
              <span>LECTURE PACKS</span>
              <span class="text-slate-700 dark:text-slate-200 font-bold">{{ course.lessons?.length || 0 }} Modules</span>
            </div>
            <div class="flex items-center justify-between">
              <span>XP REWARD MULTIPLIER</span>
              <span class="text-slate-700 dark:text-slate-200 font-bold">+{{ course.xpReward }} XP</span>
            </div>
            <div class="flex items-center justify-between">
              <span>DIGITAL CERTIFICATE</span>
              <span class="text-slate-700 dark:text-slate-200 font-bold">Verified QR Showcase</span>
            </div>
          </div>

          <!-- WhatsApp Contact Action -->
          <a 
            v-if="platformSettings?.whatsappNumber"
            :href="`https://wa.me/${platformSettings.whatsappNumber.replace(/[^0-9]/g, '')}`"
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center justify-center space-x-2 w-full p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold transition-colors border border-emerald-500/10 text-center"
            id="whatsapp-cta-link"
          >
            <MessageCircle class="w-4 h-4 fill-emerald-500 text-emerald-500" />
            <span>Consult Syllabus on WhatsApp</span>
          </a>

        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { 
  Check, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle 
} from 'lucide-vue-next'
import { dbService } from '@/lib/db'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  },
  courses: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['start-course', 'go-back'])

const expandedLessons = ref({})
const voucherCode = ref('')
const discountPercent = ref(0)
const voucherError = ref('')
const voucherSuccess = ref('')
const platformSettings = ref(null)

const course = computed(() => {
  return props.courses.find(c => c.id === props.courseId) || props.courses[0]
})

const originalPrice = computed(() => {
  return course.value ? course.value.price : 0
})

const finalPrice = computed(() => {
  return originalPrice.value - (originalPrice.value * discountPercent.value) / 100
})

watch(course, async (newCourse) => {
  if (newCourse && newCourse.lessons && newCourse.lessons.length > 0) {
    expandedLessons.value = { [newCourse.lessons[0].id]: true }
  }
  const s = await dbService.getSettings()
  platformSettings.value = s
}, { immediate: true })

const toggleLesson = (id) => {
  expandedLessons.value[id] = !expandedLessons.value[id]
}

const handleApplyVoucher = async () => {
  voucherError.value = ''
  voucherSuccess.value = ''

  if (!voucherCode.value.trim()) return

  try {
    const matched = await dbService.verifyVoucher(voucherCode.value.trim().toUpperCase())
    if (matched) {
      discountPercent.value = matched.discountPercent
      voucherSuccess.value = `Promo code verified successfully! Saved ${matched.discountPercent}% off.`
    } else {
      voucherError.value = 'Invalid, inactive, or expired coupon code.'
      discountPercent.value = 0
    }
  } catch (err) {
    voucherError.value = 'Validation system exception.'
    discountPercent.value = 0
  }
}

const emitGoBack = () => {
  emit('go-back')
}

const emitStartCourse = () => {
  if (course.value) {
    emit('start-course', course.value.id)
  }
}
</script>
