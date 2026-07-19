import { defineStore } from 'pinia'
import { dbService } from '@/lib/db'
import { Profile, Course, LiveClass, Voucher, PlatformSettings } from '@/types'

export const useMainStore = defineStore('main', {
  state: () => ({
    currentUser: null as Profile | null,
    currentView: 'landing' as string, // landing, auth, coursedetails, dashboard, learning, assignments, certificates, live, admin
    selectedCourseId: '' as string,
    selectedLessonId: '' as string,
    isSystemEmpty: null as boolean | null,
    isLoading: true as boolean,
    platformSettings: null as PlatformSettings | null,
    courses: [] as Course[],
    liveClasses: [] as LiveClass[],
    vouchers: [] as Voucher[],
    isDarkMode: false as boolean,
    pendingView: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isInstructor: (state) => state.currentUser?.role === 'instructor',
    isTA: (state) => state.currentUser?.role === 'ta',
    activeCourse: (state) => state.courses.find(c => c.id === state.selectedCourseId) || null
  },

  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('luvia_dark_mode', 'true')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('luvia_dark_mode', 'false')
      }
    },

    initializeTheme() {
      const saved = localStorage.getItem('luvia_dark_mode')
      if (saved === 'true') {
        this.isDarkMode = true
        document.documentElement.classList.add('dark')
      } else {
        this.isDarkMode = false
        document.documentElement.classList.remove('dark')
      }
    },

    async fetchInitialData() {
      this.isLoading = true
      try {
        const [settings, empty, courses, lives, vouchers] = await Promise.all([
          dbService.getSettings(),
          dbService.isSystemEmpty(),
          dbService.getCourses(),
          dbService.getLiveClasses(),
          dbService.getVouchers()
        ])

        this.platformSettings = settings
        this.isSystemEmpty = empty
        this.courses = courses
        this.liveClasses = lives
        this.vouchers = vouchers

        // Try load user from local state
        const savedUser = localStorage.getItem('luvia_active_user')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            const fresh = await dbService.getProfile(parsed.id)
            if (fresh) {
              this.currentUser = fresh
              this.currentView = 'dashboard'
            }
          } catch {
            localStorage.removeItem('luvia_active_user')
          }
        }
      } catch (err) {
        console.error('Error fetching initial data', err)
      } finally {
        this.isLoading = false
      }
    },

    async handleSignUp(email: string, name: string, role: 'admin' | 'instructor' | 'ta' | 'student' = 'student') {
      this.isLoading = true
      try {
        const profile = await dbService.signUp(email, name, role)
        this.currentUser = profile
        localStorage.setItem('luvia_active_user', JSON.stringify(profile))
        this.isSystemEmpty = false
        this.currentView = 'dashboard'
        return profile
      } finally {
        this.isLoading = false
      }
    },

    async handleSignIn(email: string) {
      this.isLoading = true
      try {
        const profile = await dbService.signIn(email)
        this.currentUser = profile
        localStorage.setItem('luvia_active_user', JSON.stringify(profile))
        this.currentView = 'dashboard'
        return profile
      } finally {
        this.isLoading = false
      }
    },

    handleSignOut() {
      this.currentUser = null
      localStorage.removeItem('luvia_active_user')
      this.currentView = 'landing'
    },

    navigateWithAuth(view: string) {
      if (this.isAuthenticated) {
        this.currentView = view
      } else {
        this.pendingView = view
        this.currentView = 'auth'
      }
    },

    async updateProfileProgress(xpAwarded: number) {
      if (!this.currentUser) return
      try {
        const fresh = await dbService.updateProfileProgress(this.currentUser.id, xpAwarded)
        this.currentUser = fresh
        localStorage.setItem('luvia_active_user', JSON.stringify(fresh))
      } catch (err) {
        console.error('Error updating XP progress', err)
      }
    },

    async refreshData() {
      try {
        const [courses, lives, vouchers, settings] = await Promise.all([
          dbService.getCourses(),
          dbService.getLiveClasses(),
          dbService.getVouchers(),
          dbService.getSettings()
        ])
        this.courses = courses
        this.liveClasses = lives
        this.vouchers = vouchers
        this.platformSettings = settings
      } catch (e) {
        console.error('Error refreshing platform data', e)
      }
    }
  }
})
