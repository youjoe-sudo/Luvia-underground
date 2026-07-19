<template>
  <div class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans text-left w-full">
    
    <!-- Background glow effects -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] pointer-events-none z-0">
      <div class="w-full h-full bg-gradient-to-r from-amber-500/10 to-indigo-600/10 blur-[120px] rounded-full opacity-40 animate-pulse-glow" />
    </div>

    <div class="max-w-7xl mx-auto px-6 pt-12 relative z-10 space-y-10">
      
      <!-- Header navigation -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            @click="emitGoBack"
            class="text-xs font-mono font-bold text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer border-none bg-transparent"
          >
            ← Back to Dashboard
          </button>
          <h1 class="font-display text-2xl md:text-3xl font-bold mt-1">Verified Accreditations</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-light">Preview, download, and share your verified cryptographic digital credentials.</p>
        </div>

        <div class="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/10 border-solid rounded-xl font-mono text-xs font-bold shadow-sm">
          <Award class="w-4 h-4 text-amber-500" />
          <span>{{ certificates.length }} ACCREDITATIONS MINTED</span>
        </div>
      </div>

      <!-- Primary Layout Grid: Gallery list (Left) + High Resolution preview (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Gallery List - 5/12 layout -->
        <div class="lg:col-span-5 space-y-4">
          <span class="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">SELECT CERTIFICATE TO PREVIEW</span>
          
          <div class="space-y-3">
            <button
              v-for="cert in certificates"
              :key="cert.id"
              @click="selectCertificate(cert)"
              class="w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between cursor-pointer shadow-sm hover:shadow border-solid dark:text-white"
              :class="selectedCert.id === cert.id 
                ? 'bg-amber-500/5 border-amber-500 font-bold' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'"
              :id="`cert-item-${cert.id}`"
            >
              <div class="space-y-1 max-w-xs">
                <h3 class="font-display text-sm truncate">{{ cert.title }}</h3>
                <p class="text-[10px] text-slate-400 truncate">{{ cert.courseTitle }}</p>
                <span class="block font-mono text-[9px] text-slate-400">Minted: {{ cert.dateEarned }}</span>
              </div>

              <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="selectedCert.id === cert.id ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'">
                <Award class="w-4.5 h-4.5" />
              </div>
            </button>
          </div>
        </div>

        <!-- Right High-End previews - 7/12 layout -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- The Golden-Gilded Certificate Frame UI -->
          <div class="p-[2px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-indigo-600 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            
            <!-- Inner container -->
            <div class="bg-slate-900 text-white rounded-[1.9rem] p-8 md:p-12 relative overflow-hidden space-y-8 min-h-[350px] flex flex-col justify-between">
              
              <!-- Background watermarks -->
              <div class="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <!-- Header credentials seal -->
              <div class="flex justify-between items-start relative z-10">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-display font-bold text-slate-950 text-xs">L</div>
                  <span class="font-display font-bold tracking-tight text-slate-200 text-xs">LUVIA ACADEMY MINT</span>
                </div>

                <span class="font-mono text-[9px] tracking-widest text-slate-500 uppercase">OFFICIAL DOCUMENT</span>
              </div>

              <!-- Recipient context details -->
              <div class="space-y-4 text-center relative z-10 py-4">
                <span class="block font-serif text-sm italic text-amber-400">This is officially certified to</span>
                
                <h2 class="font-serif text-3xl md:text-4xl font-light tracking-wide text-white drop-shadow">
                  {{ selectedCert.recipientName }}
                </h2>
                
                <p class="text-[11px] text-slate-400 leading-relaxed font-light max-w-md mx-auto">
                  for demonstrating complete proficiency and validating all micro-interaction and spring physics calculus parameters for:
                </p>

                <h3 class="font-display font-semibold text-lg text-slate-100 uppercase tracking-tight">
                  {{ selectedCert.courseTitle }}
                </h3>
              </div>

              <!-- Footer validation layout -->
              <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5 border-solid relative z-10 font-mono text-[9px] text-slate-500">
                <div class="text-center sm:text-left space-y-1">
                  <span>MINT AUTHOR: SARAH JENKINS</span>
                  <span class="block text-slate-400 font-bold uppercase">VERIFICATION HASH: {{ selectedCert.hash }}</span>
                </div>

                <div class="text-center sm:text-right">
                  <span>DATE MINTED: {{ selectedCert.dateEarned.toUpperCase() }}</span>
                  <span class="block text-amber-500 font-bold">STATUS: VERIFIED cryptographically</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Validation tools card (QR code, share tools) -->
          <div class="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-sm border-solid">
            
            <!-- QR column -->
            <div class="md:col-span-4 flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/20 border-solid">
              <img 
                v-if="!qrError"
                :src="selectedCert.qrUrl" 
                alt="Verification QR" 
                class="w-28 h-28 object-contain" 
                @error="qrError = true"
              />
              <div v-else class="w-28 h-28 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <QrCode class="w-10 h-10" />
                <span class="text-[8px] font-mono">QR GATEWAY</span>
              </div>
              <span class="block text-[8px] font-mono text-slate-400 mt-2 tracking-widest uppercase">SCAN TO AUDIT AUTH</span>
            </div>

            <!-- Share actions column -->
            <div class="md:col-span-8 text-left space-y-4">
              <div class="space-y-1">
                <div class="flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <ShieldCheck class="w-4.5 h-4.5 text-emerald-500" />
                  <span>Cryptographic Security Verified</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  This digital certification is backed by Luvia Security protocols. It can be shared directly onto professional channels or printed on custom templates.
                </p>
              </div>

              <div v-if="downloadSuccess" class="p-2.5 bg-emerald-500/10 border border-emerald-500/25 border-solid rounded-xl text-emerald-500 text-xs font-semibold">
                ✓ Mock Certificate PDF downloaded to local storage successfully.
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  @click="handleDownload"
                  :disabled="isDownloading"
                  class="flex-1 min-w-36 py-3 bg-slate-950 dark:bg-slate-850 hover:bg-slate-850 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center space-x-2 border-none"
                >
                  <div v-if="isDownloading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <template v-else>
                    <Download class="w-4 h-4" />
                    <span>Download PDF</span>
                  </template>
                </button>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 min-w-36 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center space-x-2 text-center text-white"
                >
                  <Linkedin class="w-4 h-4" />
                  <span>Share on LinkedIn</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Award, 
  Download, 
  Linkedin, 
  QrCode, 
  ShieldCheck 
} from 'lucide-vue-next'

const emit = defineEmits(['go-back'])

const certificates = ref([
  {
    id: 'cert-1',
    userId: 'user-1',
    title: 'Interaction Design Architect',
    courseTitle: 'Advanced Interaction Design & Spring Physics',
    recipientName: 'Alex Mercer',
    dateEarned: 'July 12, 2026',
    hash: 'LUV-99812-7F3A',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://luvia.edu/verify/LUV-99812-7F3A'
  },
  {
    id: 'cert-2',
    userId: 'user-1',
    title: 'Minimalist Interface Master',
    courseTitle: 'Minimalist Interface Design & Spatial Typography',
    recipientName: 'Alex Mercer',
    dateEarned: 'June 30, 2026',
    hash: 'LUV-44312-9A8E',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://luvia.edu/verify/LUV-44312-9A8E'
  }
])

const selectedCert = ref(certificates.value[0])
const isDownloading = ref(false)
const downloadSuccess = ref(false)
const qrError = ref(false)

const selectCertificate = (cert) => {
  selectedCert.value = cert
  downloadSuccess.value = false
  qrError.value = false
}

const handleDownload = () => {
  isDownloading.value = true
  downloadSuccess.value = false
  setTimeout(() => {
    isDownloading.value = false
    downloadSuccess.value = true
    setTimeout(() => {
      downloadSuccess.value = false
    }, 3000)
  }, 2000)
}

const emitGoBack = () => {
  emit('go-back')
}
</script>
