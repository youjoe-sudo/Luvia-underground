<template>
  <div class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden font-sans">
    
    <!-- Immersive Animated Gradient Background Blobs -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-30">
      <div class="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/30 blur-[100px]" />
      <div class="absolute top-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[120px]" />
      <div class="absolute top-[30%] left-[25%] w-[300px] h-[300px] rounded-full bg-cyan-400/20 blur-[80px]" />
    </div>

    <!-- Hero Section -->
    <section class="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      
      <!-- Left Text details -->
      <div class="lg:col-span-7 space-y-8 text-left">
        <div class="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 rounded-full text-xs font-mono font-bold text-blue-700 dark:text-cyan-400 tracking-wide animate-pulse">
          <Sparkles class="w-3.5 h-3.5" />
          <span>A NEW ERA OF DESIGN ACCREDITATION</span>
        </div>

        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
          {{ platformSettings?.heroTitle || 'Where Code meets Visual Mastery.' }}
        </h1>

        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-xl font-light leading-relaxed">
          {{ platformSettings?.heroSubtitle || 'Forget ordinary templates. Imprint Apple-grade interactions, advanced spring physics, spatial layout grids, and pristine micro-interactions directly into your muscle memory.' }}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            @click="emitStartLearning"
            class="group relative flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border-none"
            id="hero-start-btn"
          >
            <span>Start Learning</span>
            <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#courses-showcase"
            class="flex items-center justify-center space-x-2 px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 hover:dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl font-semibold border border-slate-200 dark:border-slate-800 transition-all duration-300 cursor-pointer"
            id="hero-browse-btn"
          >
            <Play class="w-4 h-4 text-blue-600" />
            <span>Browse Courses</span>
          </a>
        </div>

        <!-- KPI Dashboard Stats Panel -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-200/50 dark:border-slate-800/40">
          <div v-for="(st, i) in stats" :key="i" class="text-left">
            <span class="block font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{{ st.value }}</span>
            <span class="block text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 uppercase tracking-wide">{{ st.label }}</span>
          </div>
        </div>
      </div>

      <!-- Right 3D Floating Logo Panel -->
      <div class="lg:col-span-5 flex justify-center items-center relative py-12">
        <div class="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-[80px] opacity-40 animate-pulse" />
        
        <div class="relative w-80 h-80 flex items-center justify-center bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-800/80 shadow-2xl overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-cyan-500/10" />

          <!-- Simulated 3D rotating visual -->
          <div class="relative flex flex-col items-center justify-center w-48 h-48 rounded-[2rem] bg-gradient-to-tr from-white/20 via-white/40 to-white/10 dark:from-slate-950/30 dark:to-slate-900/50 p-1 border border-white/30 dark:border-slate-800/60 shadow-inner transform transition-transform duration-700 hover:scale-105 group-hover:rotate-6">
            <div class="flex items-center justify-center w-full h-full bg-white dark:bg-slate-950 rounded-[1.8rem] relative shadow-lg">
              <span class="font-display font-extrabold text-9xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                {{ (platformSettings?.platformName || 'Luvia').charAt(0) }}
              </span>
              
              <div class="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <div class="absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
            </div>
          </div>

          <div class="absolute bottom-4 left-4 right-4 p-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-900 text-center">
            <span class="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase font-bold block">PLATFORM RECONSTRUCTED V2.16</span>
            <span class="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-0.5 block">100% Secure Client Node</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Infinite Logo Carousel -->
    <section class="py-12 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900 overflow-hidden relative">
      <div class="max-w-7xl mx-auto px-6">
        <p class="text-center text-xs font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-8">
          TRUSTED BY PRODUCT BUILDERS FROM LEADING SAAS COMPANIES
        </p>
        
        <div class="relative flex items-center justify-center">
          <div class="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
          <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
          
          <div class="flex space-x-12 overflow-hidden whitespace-nowrap">
            <div 
              v-for="(brand, idx) in carouselLogos" 
              :key="idx" 
              class="inline-flex items-center space-x-2 font-display text-lg font-bold text-slate-400 hover:text-slate-800 dark:text-slate-600 dark:hover:text-slate-200 transition-colors duration-300"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{{ brand }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Course Categories Grid -->
    <section class="py-20 max-w-7xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span class="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">EXPERTISE SECTORS</span>
        <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Structured Knowledge Landscapes</h2>
        <p class="text-slate-500 dark:text-slate-400 font-light">Break free from fragmented tutorials. Transition through architectural modules developed by veteran designers.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(cat, idx) in categories" 
          :key="idx" 
          class="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/40 hover:border-blue-500/50 dark:hover:border-cyan-400/50 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
        >
          <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
            <component :is="cat.icon" class="w-6 h-6" />
          </div>
          <h3 class="font-display font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">{{ cat.title }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{{ cat.desc }}</p>
          <span class="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">{{ cat.count }}</span>
        </div>
      </div>
    </section>

    <!-- Featured Courses Segment -->
    <section id="courses-showcase" class="py-20 bg-white/40 dark:bg-slate-900/10 border-y border-slate-100 dark:border-slate-900/40">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div class="text-left space-y-3">
            <span class="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">CURATED EXPERIENCES</span>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Active Learning Blueprints</h2>
            <p class="text-slate-500 dark:text-slate-400 font-light max-w-xl">Deep, immersive certification modules featuring high-resolution interactive screens and direct evaluation.</p>
          </div>
          
          <button 
            @click="emitStartLearning" 
            class="self-start md:self-auto flex items-center space-x-2 text-sm font-semibold text-blue-600 dark:text-cyan-400 group cursor-pointer font-bold border-none bg-transparent"
          >
            <span>Explore full syllabus</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            v-for="course in courses"
            :key="course.id"
            @click="emitSelectCourse(course.id)"
            class="group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-500/20 dark:hover:border-cyan-400/20 transition-all duration-500 cursor-pointer text-left"
            :id="`featured-course-card-${course.id}`"
          >
            <!-- Cover Image -->
            <div class="relative h-64 overflow-hidden">
              <img 
                :src="course.coverImage" 
                :alt="course.title" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <!-- Floating badges on image -->
              <div class="absolute top-4 left-4 flex space-x-2">
                <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  {{ course.category }}
                </span>
                <span class="px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider"
                  :class="course.difficulty === 'Advanced' ? 'bg-red-500/30' : 'bg-amber-500/30'">
                  {{ course.difficulty }}
                </span>
              </div>

              <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div class="flex items-center space-x-2 text-white">
                  <div class="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-white text-[10px] uppercase">
                    {{ course.instructor?.name?.charAt(0) || 'L' }}
                  </div>
                  <div>
                    <span class="block text-xs font-semibold">{{ course.instructor?.name || 'Lead Architect' }}</span>
                    <span class="block text-[9px] text-slate-300 font-mono uppercase">INSTRUCTOR</span>
                  </div>
                </div>
                <div class="bg-white/25 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-white">
                  {{ course.duration }}
                </div>
              </div>
            </div>

            <!-- Card Body Details -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center space-x-2 text-amber-500 font-mono text-xs font-bold mb-2">
                  <Star class="w-4 h-4 fill-current" />
                  <span>4.95 FEEDBACK RATING</span>
                </div>
                <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {{ course.title }}
                </h3>
                <p class="text-slate-500 dark:text-slate-400 text-xs mt-2 font-light line-clamp-2">
                  {{ course.subtitle }}
                </p>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span class="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">TUITION COST</span>
                  <span class="block font-display text-2xl font-bold text-slate-900 dark:text-white">${{ course.price }}</span>
                </div>

                <button
                  class="flex items-center space-x-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-cyan-500 hover:text-white dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all duration-300 group-hover:translate-x-1 cursor-pointer border-none"
                >
                  <span>Syllabus details</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Coupon validation drawer -->
    <section class="py-16 max-w-3xl mx-auto px-6 text-left">
      <div class="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl space-y-4">
        <div class="flex items-center space-x-2 text-blue-600 dark:text-cyan-400">
          <Tag class="w-5 h-5 animate-bounce" />
          <span class="font-mono text-xs font-bold uppercase tracking-wider">SECURE PROMO VALIDATION GATEWAY</span>
        </div>
        <h3 class="font-display font-bold text-lg">Verify Dynamic Vouchers</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-light">
          Got an invitation code or discount from our newsletter or support network? Run it here to lock in your tuition discount.
        </p>

        <form @submit.prevent="handleVerifyCoupon" class="flex gap-2">
          <input 
            type="text" 
            v-model="vCode"
            placeholder="e.g. LUVIA20"
            class="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/10 rounded-xl text-xs font-mono uppercase"
          />
          <button class="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer border-none">
            Verify
          </button>
        </form>
        <p v-if="couponFeedback" class="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
          {{ couponFeedback }}
        </p>
      </div>
    </section>

    <!-- Frequently Asked Questions -->
    <section class="py-20 bg-white/40 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-900/50">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-16 space-y-4">
          <span class="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">SYSTEM CLEARING</span>
          <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Queries</h2>
          <p class="text-slate-500 dark:text-slate-400 font-light">Everything you need to know about our visual and pedagogical layout.</p>
        </div>

        <div class="space-y-4">
          <div 
            v-for="faq in faqs" 
            :key="faq.id" 
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden transition-all text-left"
          >
            <button
              @click="toggleFaq(faq.id)"
              class="w-full flex items-center justify-between p-6 text-left font-display font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span>{{ faq.question }}</span>
              <ChevronUp v-if="activeFaq === faq.id" class="w-5 h-5 text-slate-400" />
              <ChevronDown v-else class="w-5 h-5 text-slate-400" />
            </button>
            
            <div v-if="activeFaq === faq.id" class="px-6 pb-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light border-t border-slate-50 dark:border-slate-800/40 pt-4 animate-in fade-in slide-in-from-top-1">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Direct Contact Floating Call to action -->
    <section v-if="platformSettings?.whatsappNumber" class="py-12 bg-blue-600/10 border-y border-blue-600/10 max-w-5xl mx-auto rounded-3xl my-10 px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
      <div class="space-y-1">
        <span class="block text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold uppercase tracking-widest">LIVE WORKSPACE COUNSELING</span>
        <h4 class="font-display text-lg font-bold">Have individual tuition or syllabus questions?</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-light">Connect directly with our Lead Architect via secure WhatsApp pipeline.</p>
      </div>
      <a 
        :href="`https://wa.me/${platformSettings.whatsappNumber.replace(/[^0-9]/g, '')}`"
        target="_blank"
        rel="noreferrer"
        class="flex items-center space-x-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm text-center"
      >
        <PhoneCall class="w-4 h-4 shrink-0" />
        <span>Chat via WhatsApp {{ platformSettings.whatsappNumber }}</span>
      </a>
    </section>

    <!-- High-End Bottom CTA -->
    <section class="py-20 relative overflow-hidden text-center bg-slate-950 text-white border-t border-slate-900">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div class="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
        <span class="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">IMMEDIATE COGNITIVE LAUNCH</span>
        <h2 class="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Stop Consuming. <br />
          <span class="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Start Crafting.</span>
        </h2>
        <p class="text-slate-400 font-light max-w-xl mx-auto leading-relaxed text-sm">
          Unlock the engineering visual guidelines of Linear, Apple, and Stripe. Join thousands of design engineers today.
        </p>

        <div class="flex justify-center pt-2">
          <button
            @click="emitStartLearning"
            class="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white rounded-2xl font-semibold shadow-2xl transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center space-x-2 border-none"
            id="bottom-cta-btn"
          >
            <span>Initialize My Access</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>

    <!-- Premium Footer -->
    <footer class="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 text-slate-400 text-xs">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-display font-bold text-white text-xs">L</div>
          <span class="font-display font-bold text-slate-900 dark:text-white tracking-tight">{{ platformSettings?.platformName || 'Luvia' }} Platforms</span>
        </div>

        <div class="flex space-x-6 text-slate-500 dark:text-slate-400">
          <span class="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer">Syllabus Guidelines</span>
          <span class="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer">Cryptographic Security</span>
          <span class="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer">Whiteboard Specs</span>
        </div>

        <div class="font-mono text-[10px] text-slate-400">
          © 2026 {{ platformSettings?.platformName || 'LUVIA' }} INC. ALL RIGHTS RESERVED. SECURED VIA DESKTOP PROTOCOL.
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Cpu, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Star, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall 
} from 'lucide-vue-next'
import { dbService } from '@/lib/db'

const emit = defineEmits(['select-course', 'start-learning'])

const courses = ref([])
const faqs = ref([])
const testimonials = ref([])
const platformSettings = ref(null)

const activeFaq = ref(null)
const vCode = ref('')
const couponFeedback = ref('')
const discountPercent = ref(null)

const loadLandingData = async () => {
  try {
    const [liveCourses, liveFaqs, liveTestimonials, liveSettings] = await Promise.all([
      dbService.getCourses(),
      dbService.getFaqs(),
      dbService.getTestimonials(),
      dbService.getSettings()
    ])

    courses.value = liveCourses
    faqs.value = liveFaqs
    testimonials.value = liveTestimonials
    platformSettings.value = liveSettings
  } catch (err) {
    console.error('Error loading dynamic landing assets:', err)
  }
}

onMounted(() => {
  loadLandingData()
  window.addEventListener('platformSettingsUpdated', loadLandingData)
})

onUnmounted(() => {
  window.removeEventListener('platformSettingsUpdated', loadLandingData)
})

const handleVerifyCoupon = async () => {
  if (!vCode.value.trim()) return
  try {
    const v = await dbService.verifyVoucher(vCode.value.toUpperCase())
    if (v) {
      discountPercent.value = v.discountPercent
      couponFeedback.value = `🎉 Code verified! ${v.discountPercent}% discount is active in your checkout drawer.`
    } else {
      discountPercent.value = null
      couponFeedback.value = '❌ Invalid or expired coupon code.'
    }
  } catch (err) {
    discountPercent.value = null
    couponFeedback.value = '❌ Verification exception.'
  }
}

const toggleFaq = (id) => {
  activeFaq.value = activeFaq.value === id ? null : id
}

const emitSelectCourse = (id) => {
  emit('select-course', id)
}

const emitStartLearning = () => {
  emit('start-learning')
}

const stats = [
  { value: '14,000+', label: 'Active Thinkers' },
  { value: '99.8%', label: 'Completion Rate' },
  { value: '4.95 ★', label: 'Average Feedback' },
  { value: '120+', label: 'Digital Credentials' }
]

const trustedBrands = [
  'Apple', 'Stripe', 'Linear', 'Notion', 'Framer', 'Arc', 'Raycast', 'Coursera', 'Superhuman'
]

const carouselLogos = computed(() => {
  return [...trustedBrands, ...trustedBrands, ...trustedBrands]
})

const categories = computed(() => [
  { 
    title: 'Design Engineering', 
    count: `${courses.value.filter(c => c.category.toLowerCase().includes('design') || c.category.toLowerCase().includes('engine')).length} Blueprint(s)`, 
    icon: Cpu, 
    desc: 'Spring physics, hardware acceleration, gesture mechanics.' 
  },
  { 
    title: 'Interactive Code', 
    count: `${courses.value.filter(c => c.category.toLowerCase().includes('code') || c.category.toLowerCase().includes('react') || c.category.toLowerCase().includes('vue')).length} Blueprint(s)`, 
    icon: Terminal, 
    desc: 'Translating visual motion formulas into production layouts.' 
  },
  { 
    title: 'Systems Architecting', 
    count: `${courses.value.filter(c => c.category.toLowerCase().includes('system')).length} Blueprint(s)`, 
    icon: ShieldCheck, 
    desc: 'Establishing unified guidelines, variables, and specs.' 
  },
  { 
    title: 'Product Design', 
    count: '1 Available', 
    icon: Layers, 
    desc: 'Spatial grids, advanced typography hierarchy, negative space.' 
  }
])
</script>
