<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col font-sans">
    
    <!-- Loader Block when loading initial setup/data -->
    <div v-if="store.isLoading" class="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white font-sans">
      <div class="space-y-4 text-center">
        <div class="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <span class="block text-xs font-mono tracking-widest text-slate-500 uppercase animate-pulse">Initializing Luvia secure sandbox environment...</span>
      </div>
    </div>

    <!-- Platform Setup if system has no administrator config -->
    <PlatformSetup v-else-if="store.isSystemEmpty" @setup-complete="handleSetupComplete" />

    <!-- Core App Container -->
    <div v-else class="flex-1 flex flex-col">
      <!-- Floating Navigation Header -->
      <Navigation 
        v-if="store.currentView !== 'auth'" 
        :current-view="store.currentView"
        :progress="derivedProgress"
        :is-dark-mode="store.isDarkMode"
        :current-user="store.currentUser"
        @set-view="navigateWithAuth"
        @toggle-dark-mode="store.toggleDarkMode"
        @sign-out="store.handleSignOut"
      />

      <!-- Main Dynamic Content Wrapper -->
      <main class="flex-1 flex flex-col">
        <transition name="fade" mode="out-in">
          <component 
            :is="viewComponent" 
            :key="store.currentView"
            :current-user="store.currentUser || guestUser"
            :courses="store.courses"
            :live-classes="store.liveClasses"
            :course-id="store.selectedCourseId"
            :active-lesson-id="store.selectedLessonId"
            @select-course="handleSelectCourse"
            @start-course="handleStartCourse"
            @resume-lesson="handleResumeLesson"
            @complete-lesson="handleCompleteLesson"
            @go-to-live="store.currentView = 'live'"
            @go-to-certificates="store.currentView = 'certificates'"
            @go-to-quiz="store.currentView = 'assignments'"
            @quiz-complete="handleQuizComplete"
            @go-back="handleGoBack"
            @auth-success="handleAuthSuccess"
            @cancel="handleAuthCancel"
            @refresh-courses="store.refreshData"
          />
        </transition>
      </main>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, markRaw } from 'vue'
import { useMainStore } from '@/stores/main'

// Direct import of our high-fidelity Vue components
import Navigation from '@/components/Navigation.vue'
import LandingPage from '@/components/LandingPage.vue'
import AuthPage from '@/components/AuthPage.vue'
import StudentDashboard from '@/components/StudentDashboard.vue'
import CourseDetails from '@/components/CourseDetails.vue'
import LearningExperience from '@/components/LearningExperience.vue'
import AssignmentsPage from '@/components/AssignmentsPage.vue'
import CertificatesPage from '@/components/CertificatesPage.vue'
import LiveClasses from '@/components/LiveClasses.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import PlatformSetup from '@/components/PlatformSetup.vue'

const store = useMainStore()

onMounted(async () => {
  store.initializeTheme()
  await store.fetchInitialData()
})

// Guest fallback profile
const guestUser = {
  id: 'guest',
  email: 'guest@luvia.com',
  name: 'Guest Thinker',
  role: 'student',
  currentStreak: 1,
  totalXp: 0,
  currentLevel: 1
}

// Map views to markRaw components
const componentsMap = {
  landing: markRaw(LandingPage),
  auth: markRaw(AuthPage),
  dashboard: markRaw(StudentDashboard),
  coursedetails: markRaw(CourseDetails),
  learning: markRaw(LearningExperience),
  assignments: markRaw(AssignmentsPage),
  certificates: markRaw(CertificatesPage),
  live: markRaw(LiveClasses),
  admin: markRaw(AdminDashboard),
  setup: markRaw(PlatformSetup)
}

const viewComponent = computed(() => {
  return componentsMap[store.currentView] || markRaw(LandingPage)
})

// Intercept unauthorized view transitions
const navigateWithAuth = (view) => {
  const publicViews = ['landing', 'coursedetails']
  if (!store.isAuthenticated && !publicViews.includes(view)) {
    store.pendingView = view
    store.currentView = 'auth'
  } else {
    store.currentView = view
  }
}

// Event Handlers
const handleSetupComplete = async () => {
  store.isSystemEmpty = false
  await store.refreshData()
  store.currentView = 'landing'
}

const handleSelectCourse = (courseId) => {
  store.selectedCourseId = courseId
  store.currentView = 'coursedetails'
}

const handleStartCourse = (courseId) => {
  store.selectedCourseId = courseId
  navigateWithAuth('learning')
}

const handleResumeLesson = (courseId, lessonId) => {
  store.selectedCourseId = courseId
  store.selectedLessonId = lessonId
  store.currentView = 'learning'
}

const handleCompleteLesson = async (courseId, xpAwarded) => {
  if (store.currentUser) {
    await store.updateProfileProgress(xpAwarded)
    await store.refreshData()
  }
}

const handleQuizComplete = async (xpAwarded) => {
  if (store.currentUser) {
    await store.updateProfileProgress(xpAwarded)
    await store.refreshData()
  }
}

const handleGoBack = () => {
  if (store.currentView === 'coursedetails' || store.currentView === 'auth') {
    store.currentView = 'landing'
  } else {
    store.currentView = 'dashboard'
  }
}

const handleAuthSuccess = async (profile) => {
  store.currentUser = profile
  localStorage.setItem('luvia_active_user', JSON.stringify(profile))
  await store.refreshData()

  if (store.pendingView) {
    store.currentView = store.pendingView
    store.pendingView = null
  } else {
    store.currentView = 'dashboard'
  }
}

const handleAuthCancel = () => {
  store.currentView = 'landing'
  store.pendingView = null
}

const derivedProgress = computed(() => {
  if (!store.currentUser) {
    return {
      currentStreak: 1,
      totalXp: 0,
      coursesCompleted: 0,
      currentLevel: 1
    }
  }
  return {
    currentStreak: store.currentUser.currentStreak,
    totalXp: store.currentUser.totalXp,
    coursesCompleted: 0,
    currentLevel: store.currentUser.currentLevel
  }
})
</script>

<style>
/* Smooth View Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
