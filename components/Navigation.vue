<template>
  <nav class="sticky top-0 z-50 w-full px-4 py-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 transition-all duration-300">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      
      <!-- Logo and Brand -->
      <button 
        @click="handleBrandClick" 
        class="flex items-center space-x-3 group text-left cursor-pointer"
        id="nav-logo-btn"
      >
        <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 p-[2px] transition-transform duration-500 group-hover:rotate-12">
          <div class="flex items-center justify-center w-full h-full bg-white dark:bg-slate-950 rounded-[10px] transition-colors duration-300">
            <span class="font-display font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              {{ (platformSettings?.platformName || 'Luvia').charAt(0) }}
            </span>
          </div>
        </div>
        <div>
          <span class="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            {{ platformSettings?.platformName || 'Luvia' }}
          </span>
          <span class="block text-[9px] font-mono tracking-widest text-blue-600 dark:text-cyan-400 font-bold uppercase">PRO PLATFORM</span>
        </div>
      </button>

      <!-- Desktop Navigation Items -->
      <div class="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/20">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="handleNavItemClick(item)"
          class="relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
          :class="store.currentView === item.id || (item.id === 'learning' && store.currentView === 'coursedetails')
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white hover:bg-white/40 hover:dark:bg-slate-800/20'"
          :id="`nav-item-${item.id}`"
        >
          <component :is="item.icon" class="w-4 h-4" :class="store.currentView === item.id ? 'text-blue-600 dark:text-cyan-400' : ''" />
          <span>{{ item.label }}</span>
        </button>
      </div>

      <!-- Right Side Tools -->
      <div class="flex items-center space-x-3">
        
        <template v-if="store.currentUser">
          <!-- Streak Indicator -->
          <div class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/20 rounded-xl font-mono text-xs font-bold shadow-sm">
            <Flame class="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{{ store.currentUser.currentStreak }} DAY STREAK</span>
          </div>

          <!-- XP Badge -->
          <div class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/20 rounded-xl font-mono text-xs font-bold shadow-sm">
            <Zap class="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <span>{{ store.currentUser.totalXp }} XP</span>
          </div>
        </template>

        <!-- Theme Toggle Button -->
        <button
          @click="store.toggleDarkMode"
          class="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 hover:dark:bg-slate-800 rounded-xl border border-slate-200/10 transition-colors cursor-pointer"
          id="theme-toggle"
          title="Toggle theme"
        >
          <Sun v-if="store.isDarkMode" class="w-4.5 h-4.5 text-amber-400" />
          <Moon v-else class="w-4.5 h-4.5 text-blue-600" />
        </button>

        <!-- Notifications Panel Trigger -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 hover:dark:bg-slate-800 rounded-xl border border-slate-200/10 transition-colors cursor-pointer"
            id="notifications-toggle"
          >
            <Bell class="w-4.5 h-4.5" />
            <span v-if="unreadNotifications > 0" class="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          </button>

          <!-- Notification Drawer -->
          <div v-if="notificationOpen" class="absolute right-0 mt-3 w-80 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span class="font-display font-semibold text-sm text-slate-900 dark:text-white">Recent Updates</span>
              <button 
                @click="notificationOpen = false"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <div class="space-y-3 max-h-60 overflow-y-auto text-left">
              <div 
                v-for="n in notifications" 
                :key="n.id" 
                class="p-2.5 rounded-xl text-xs leading-relaxed border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 text-slate-700 dark:text-slate-300"
              >
                {{ n.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile / Auth Action -->
        <template v-if="store.currentUser">
          <div class="flex items-center space-x-2">
            <button 
              @click="handleProfileClick"
              class="flex items-center space-x-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/10 rounded-2xl hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors cursor-pointer"
              id="user-profile-btn"
            >
              <div class="w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                {{ store.currentUser.name.charAt(0) }}
              </div>
              <div class="hidden md:block text-left pr-2">
                <span class="block text-xs font-semibold text-slate-900 dark:text-white">{{ store.currentUser.name }}</span>
                <span class="block text-[9px] font-mono text-slate-400 uppercase">{{ store.currentUser.role }}</span>
              </div>
            </button>
            
            <button
              @click="handleSignOut"
              class="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-900 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
              id="signout-btn"
            >
              <LogOut class="w-4.5 h-4.5" />
            </button>
          </div>
        </template>
        <template v-else>
          <button
            @click="navigateToAuth"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
            id="nav-login-btn-public"
          >
            Sign In
          </button>
        </template>

        <!-- Mobile menu toggle -->
        <button
          @click="mobileOpen = !mobileOpen"
          class="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer"
          id="mobile-menu-toggle"
        >
          <X v-if="mobileOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Panel -->
    <div v-if="mobileOpen" class="lg:hidden mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg space-y-2 animate-in slide-in-from-top-4 duration-300">
      <div class="space-y-1 text-left">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="handleNavItemClick(item)"
          class="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          :class="store.currentView === item.id 
            ? 'bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-semibold' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'"
          :id="`mobile-nav-${item.id}`"
        >
          <component :is="item.icon" class="w-4.5 h-4.5" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  Compass, 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  Radio, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Bell, 
  Flame, 
  Zap, 
  Menu, 
  X,
  LogOut
} from 'lucide-vue-next'
import { useMainStore } from '@/stores/main'
import { dbService } from '@/lib/db'

const store = useMainStore()

const mobileOpen = ref(false)
const notificationOpen = ref(false)
const unreadNotifications = ref(1)
const platformSettings = ref(null)

const loadSettings = async () => {
  try {
    const s = await dbService.getSettings()
    platformSettings.value = s
  } catch (e) {
    // fallback
  }
}

onMounted(() => {
  loadSettings()
  window.addEventListener('platformSettingsUpdated', loadSettings)
})

onUnmounted(() => {
  window.removeEventListener('platformSettingsUpdated', loadSettings)
})

const isPrivileged = computed(() => {
  return store.currentUser && ['admin', 'instructor', 'ta'].includes(store.currentUser.role)
})

const baseNavItems = [
  { id: 'landing', label: 'Explore', icon: Compass, route: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { id: 'assignments', label: 'Assignments', icon: CheckSquare, route: '/assignments' },
  { id: 'certificates', label: 'Certificates', icon: Award, route: '/certificates' },
  { id: 'live', label: 'Live Seminar', icon: Radio, route: '/live' },
]

const navItems = computed(() => {
  return isPrivileged.value 
    ? [...baseNavItems, { id: 'admin', label: 'Admin Terminal', icon: ShieldAlert, route: '/admin' }]
    : baseNavItems
})

const notifications = computed(() => [
  { id: 1, text: `Welcome to ${platformSettings.value?.platformName || 'Luvia'}! Get started by exploring course syllabi.`, type: 'info' }
])

const toggleNotifications = () => {
  notificationOpen.value = !notificationOpen.value
  unreadNotifications.value = 0
}

const handleNavItemClick = (item) => {
  mobileOpen.value = false
  if (item.id === 'landing') {
    store.currentView = 'landing'
    navigateTo('/')
  } else {
    store.navigateWithAuth(item.id)
    if (store.isAuthenticated) {
      navigateTo(item.route)
    }
  }
}

const handleBrandClick = () => {
  store.currentView = 'landing'
  navigateTo('/')
}

const handleProfileClick = () => {
  store.currentView = 'dashboard'
  navigateTo('/dashboard')
}

const navigateToAuth = () => {
  store.currentView = 'auth'
  navigateTo('/auth')
}

const handleSignOut = () => {
  store.handleSignOut()
  navigateTo('/')
}
</script>
