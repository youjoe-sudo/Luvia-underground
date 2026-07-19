<template>
  <div v-if="!isSuperAdmin && !isInstructor && !isTA" class="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white font-sans w-full">
    <ShieldAlert class="w-16 h-16 text-rose-500 animate-bounce mb-6" />
    <h1 class="font-display text-2xl font-bold tracking-tight">Security Access Lockout</h1>
    <p class="text-xs text-slate-400 mt-2 max-w-sm">The SaaS Command Terminal is limited strictly to approved Instructors, TAs, and Super Administrators. Return to safety.</p>
    <button @click="emitGoBack" class="mt-8 px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer border-none">
      ← Esc System Dashboard
    </button>
  </div>

  <div v-else class="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans text-left w-full">
    
    <!-- visual atmospheric glows -->
    <div class="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
    <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

    <div class="max-w-7xl mx-auto px-6 pt-12 relative z-10 space-y-8">
      
      <!-- Header bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            @click="emitGoBack"
            class="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer uppercase tracking-wider border-none bg-transparent"
          >
            ← ESCAPE WORKSPACE
          </button>
          <h1 class="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1 flex flex-wrap items-center gap-2 text-slate-900 dark:text-white">
            <span>SaaS Command Executive Terminal</span>
            <span class="px-2.5 py-0.5 text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 rounded-full border border-blue-500/10 uppercase border-solid">
              {{ currentUser.role }} PRIVILEGE
            </span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-light">
            Administer role configurations, dynamic FAQs, course CMS, brand settings, and verify metrics.
          </p>
        </div>

        <div class="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/10 text-blue-600 dark:text-cyan-400 border border-blue-600/10 rounded-xl font-mono text-xs font-bold uppercase tracking-wide border-solid">
          <span>SECURE LINK OPERATIONAL</span>
        </div>
      </div>

      <!-- Executive Metrics HUD -->
      <section class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm border-solid">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">SYS REVENUE</span>
            <span class="block font-display text-2xl font-bold dark:text-white">${{ (courses.length * 12850).toLocaleString() }}</span>
            <span class="block text-[9px] text-emerald-500 font-mono font-bold">● ACTIVE NET ENROLLMENTS</span>
          </div>
          <div class="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>

        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm border-solid">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">THINKERS ROSTER</span>
            <span class="block font-display text-2xl font-bold dark:text-white">{{ profiles.length }}</span>
            <span class="block text-[9px] text-slate-500 font-mono font-bold">TOTAL REGISTERED USER PROFILES</span>
          </div>
          <div class="w-11 h-11 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <Users class="w-5 h-5" />
          </div>
        </div>

        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm border-solid">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">COURSES CMS</span>
            <span class="block font-display text-2xl font-bold dark:text-white">{{ courses.length }}</span>
            <span class="block text-[9px] text-slate-500 font-mono font-bold">LIVE BLUEPRINTS PUBLISHED</span>
          </div>
          <div class="w-11 h-11 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
            <BookOpen class="w-5 h-5" />
          </div>
        </div>

        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl flex items-center justify-between shadow-sm border-solid">
          <div class="space-y-1">
            <span class="block text-[10px] font-mono text-slate-400 uppercase">VOUCHERS DISPATCHED</span>
            <span class="block font-display text-2xl font-bold dark:text-white">{{ vouchers.length }}</span>
            <span class="block text-[9px] text-slate-500 font-mono font-bold">COUPON SYSTEMS SECURE</span>
          </div>
          <div class="w-11 h-11 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
            <Tag class="w-5 h-5" />
          </div>
        </div>
      </section>

      <!-- Dynamic Tab Navigation depending on roles -->
      <section class="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/10 rounded-2xl max-w-4xl border-solid">
        <button
          @click="activeTab = 'overview'"
          class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
          :class="activeTab === 'overview' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          Metrics
        </button>
        
        <button
          @click="activeTab = 'courses'"
          class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
          :class="activeTab === 'courses' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          Syllabus CMS
        </button>

        <button
          v-if="isSuperAdmin"
          @click="activeTab = 'staff'"
          class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
          :class="activeTab === 'staff' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          Instructor & TA Control
        </button>

        <button
          @click="activeTab = 'announcements'"
          class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
          :class="activeTab === 'announcements' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          Announcements
        </button>

        <template v-if="isSuperAdmin">
          <button
            @click="activeTab = 'vouchers'"
            class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
            :class="activeTab === 'vouchers' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            Coupons
          </button>

          <button
            @click="activeTab = 'branding'"
            class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
            :class="activeTab === 'branding' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            Settings CMS
          </button>

          <button
            @click="activeTab = 'faqs'"
            class="px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all border-none bg-transparent"
            :class="activeTab === 'faqs' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            FAQs
          </button>
        </template>
      </section>

      <!-- CMS Container -->
      <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm min-h-[400px] border-solid">
        
        <!-- Tab 1: Overview and Charts -->
        <div v-if="activeTab === 'overview'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div class="space-y-4">
              <div>
                <h3 class="font-display font-bold text-sm uppercase dark:text-white">Weekly Load Matrix</h3>
                <p class="text-[11px] text-slate-400 font-light">Interactive tracking of session interval densities.</p>
              </div>

              <div class="grid grid-cols-7 gap-1.5 p-3 bg-slate-50 dark:bg-slate-950/25 border border-slate-200/10 rounded-2xl border-solid">
                <div 
                  v-for="idx in 35" 
                  :key="idx" 
                  class="aspect-square rounded-lg bg-blue-500/70 shadow hover:scale-110 cursor-pointer transition-transform"
                  :style="{ opacity: 0.2 + (idx % 6) * 0.15 }"
                />
              </div>
            </div>

            <div class="space-y-4 text-left">
              <div>
                <h3 class="font-display font-bold text-sm uppercase dark:text-white">Active Thinker Accounts</h3>
                <p class="text-[11px] text-slate-400 font-light">All profiles registered in the database directory.</p>
              </div>

              <div class="max-h-56 overflow-y-auto space-y-2.5 pr-2">
                <div v-for="p in profiles" :key="p.id" class="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/5 rounded-xl flex items-center justify-between border-solid">
                  <div class="flex items-center space-x-2.5">
                    <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-900 dark:text-white text-xs uppercase">
                      {{ p.name.charAt(0) }}
                    </div>
                    <div>
                      <span class="block text-xs font-semibold text-slate-900 dark:text-white">{{ p.name }}</span>
                      <span class="block text-[10px] text-slate-400 font-mono">{{ p.email }}</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-cyan-400 rounded-lg text-[9px] font-mono uppercase font-bold border border-blue-500/10 border-solid">
                    {{ p.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Syllabus / Courses / Lessons CMS -->
        <div v-else-if="activeTab === 'courses'" class="space-y-8 text-left">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Course Creator CMS -->
            <div class="lg:col-span-5 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4 border-solid">
              <div>
                <h3 class="font-display font-bold text-sm uppercase dark:text-white">Add Course Blueprint</h3>
                <p class="text-[11px] text-slate-400 font-light">Publish a brand-new high-end dynamic course structure.</p>
              </div>

              <form @submit.prevent="handleCreateCourse" class="space-y-3">
                <div class="space-y-1">
                  <label class="block text-[9px] font-mono text-slate-400 uppercase">TITLE</label>
                  <input 
                    type="text" 
                    v-model="courseTitle"
                    placeholder="Advanced Spring Physics..."
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">PRICE ($)</label>
                    <input 
                      type="number" 
                      v-model="coursePrice"
                      placeholder="e.g. 199"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">DIFFICULTY</label>
                    <select 
                      v-model="courseDifficulty"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div v-if="isSuperAdmin" class="space-y-1">
                  <label class="block text-[9px] font-mono text-slate-400 uppercase">ASSIGNED INSTRUCTOR</label>
                  <select
                    v-model="courseInstructorId"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                  >
                    <option value="">Select Instructor...</option>
                    <option v-for="p in profiles.filter(p => p.role === 'instructor' || p.role === 'admin')" :key="p.id" :value="p.id">
                      {{ p.name }} ({{ p.role }})
                    </option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-[9px] font-mono text-slate-400 uppercase">DESCRIPTION</label>
                  <textarea 
                    v-model="courseDescription"
                    rows="2"
                    placeholder="In-depth conceptual syllabus text..."
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none dark:text-white focus:outline-none"
                  />
                </div>

                <button class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-all border-none">
                  Publish Syllabus
                </button>
              </form>
            </div>

            <!-- Lesson Appender CMS -->
            <div class="lg:col-span-7 space-y-6">
              <div class="p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4 border-solid">
                <div>
                  <h3 class="font-display font-bold text-sm uppercase dark:text-white">Add Video Lesson</h3>
                  <p class="text-[11px] text-slate-400 font-light">Upload dynamic stream components into an existing syllabus.</p>
                </div>

                <form @submit.prevent="handleCreateLesson" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1 md:col-span-2">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">TARGET COURSE BLUEPRINT</label>
                    <select
                      v-model="selectedCourseForLesson"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    >
                      <option value="">Select Target Course...</option>
                      <option v-for="c in visibleCourses" :key="c.id" :value="c.id">
                        {{ c.title }}
                      </option>
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">LESSON TITLE</label>
                    <input 
                      type="text" 
                      v-model="lessonTitle"
                      placeholder="e.g. Math behind Spring oscillatory bounds"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">VIDEO STREAM URL</label>
                    <input 
                      type="text" 
                      v-model="lessonVideoUrl"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">DURATION</label>
                    <input 
                      type="text" 
                      v-model="lessonDuration"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[9px] font-mono text-slate-400 uppercase">XP VALUE</label>
                    <input 
                      type="number" 
                      v-model="lessonXp"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                    />
                  </div>

                  <button class="md:col-span-2 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase cursor-pointer border-none">
                    Append Lesson Token
                  </button>
                </form>
              </div>

              <!-- Syllabus Roster Grid -->
              <div class="space-y-3">
                <span class="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">ACTIVE BLUEPRINTS DIRECTORY ({{ visibleCourses.length }})</span>
                
                <div v-for="c in visibleCourses" :key="c.id" class="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between border-solid">
                  <div>
                    <span class="block text-xs font-bold text-slate-900 dark:text-white">{{ c.title }}</span>
                    <span class="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {{ c.lessons ? c.lessons.length : 0 }} Lessons | Price: ${{ c.price }} | Level: {{ c.difficulty }}
                    </span>
                  </div>

                  <button
                    @click="handleDeleteCourse(c.id)"
                    class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Tab 3: Staff Assignment & RBAC (Admin-Only) -->
        <div v-else-if="activeTab === 'staff' && isSuperAdmin" class="space-y-8 text-left">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- TA and Instructor Assignment Module -->
            <div class="lg:col-span-6 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4 border-solid">
              <div>
                <h3 class="font-display font-bold text-sm uppercase dark:text-white">Register & Assign TA</h3>
                <p class="text-[11px] text-slate-400 font-light">Delegate customized action controls to certified teaching assistants.</p>
              </div>

              <form @submit.prevent="handleAssignTa" class="space-y-4">
                <div class="space-y-1">
                  <label class="block text-[9px] font-mono text-slate-400 uppercase">SELECT PROFILE</label>
                  <select
                    v-model="taUserId"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                  >
                    <option value="">Select User Profile...</option>
                    <option v-for="p in profiles.filter(p => p.role === 'student')" :key="p.id" :value="p.id">
                      {{ p.name }} ({{ p.email }})
                    </option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-[9px] font-mono text-slate-400 uppercase">ASSIGNED SYLLABUS</label>
                  <select
                    v-model="taCourseId"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                  >
                    <option value="">Select Course Blueprint...</option>
                    <option v-for="c in courses" :key="c.id" :value="c.id">
                      {{ c.title }}
                    </option>
                  </select>
                </div>

                <!-- Permissions check matrix -->
                <div class="space-y-2">
                  <label class="block text-[9px] font-mono text-slate-400 uppercase">TA ACTIONS AUTHORIZATIONS</label>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <button
                      v-for="perm in taPermissionOptions"
                      type="button"
                      :key="perm.id"
                      @click="toggleTaPermission(perm.id)"
                      class="p-2 rounded-xl border text-left flex items-center space-x-2 cursor-pointer transition-colors border-solid bg-transparent dark:text-white"
                      :class="taPermissions.includes(perm.id) ? 'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-cyan-400 font-semibold' : 'border-slate-200/10 hover:bg-slate-800/10'"
                    >
                      <div class="w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] font-bold border-solid" :class="taPermissions.includes(perm.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400'">
                        <span v-if="taPermissions.includes(perm.id)">✓</span>
                      </div>
                      <span>{{ perm.label }}</span>
                    </button>
                  </div>
                </div>

                <button class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer border-none">
                  Provision TA Security
                </button>
              </form>
            </div>

            <!-- Role Promotion Table -->
            <div class="lg:col-span-6 space-y-4">
              <div>
                <h3 class="font-display font-bold text-sm uppercase dark:text-white">Staff Directory Clearance</h3>
                <p class="text-[11px] text-slate-400 font-light">Promote, demote, or suspend user accounts dynamically in Supabase.</p>
              </div>

              <div class="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                <div v-for="p in profiles" :key="p.id" class="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between border-solid">
                  <div>
                    <span class="block text-xs font-bold text-slate-900 dark:text-white">{{ p.name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono block">{{ p.email }}</span>
                  </div>

                  <select
                    :value="p.role"
                    @change="handleUpdateRole(p.id, $event.target.value)"
                    class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs font-semibold uppercase dark:text-white focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="ta">Teaching Assistant</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab 4: Announcements -->
        <div v-else-if="activeTab === 'announcements'" class="space-y-6 text-left max-w-4xl">
          <div>
            <h3 class="font-display font-bold text-sm uppercase dark:text-white">Dispatch Live Announcement</h3>
            <p class="text-[11px] text-slate-400 font-light">Post header banners or dashboard cards readable by all students.</p>
          </div>

          <form @submit.prevent="handleCreateAnnouncement" class="p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl grid grid-cols-1 gap-4 border-solid">
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">SUBJECT HEADING</label>
              <input 
                type="text" 
                v-model="announcementTitle"
                placeholder="SaaS Class starts in 10 minutes..."
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">CONTENT STATEMENT</label>
              <textarea 
                v-model="announcementContent"
                rows="3"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none dark:text-white focus:outline-none"
              />
            </div>
            <button class="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer border-none">
              Dispatch Broadcast
            </button>
          </form>

          <div class="space-y-3 pt-4">
            <span class="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">PUBLISHED ANNOUNCEMENTS ({{ announcements.length }})</span>
            <div v-for="ann in announcements" :key="ann.id" class="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between border-solid">
              <div>
                <span class="block text-xs font-bold text-slate-900 dark:text-white">{{ ann.title }}</span>
                <span class="text-[10px] text-slate-400 font-light block mt-1">{{ ann.content }}</span>
                <span class="text-[8px] font-mono text-blue-500 uppercase mt-2 block">Published {{ ann.date }} by {{ ann.createdBy }}</span>
              </div>

              <button
                @click="handleDeleteAnnouncement(ann.id)"
                class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-none bg-transparent"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 5: Coupons (Admin-Only) -->
        <div v-else-if="activeTab === 'vouchers' && isSuperAdmin" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          <div class="lg:col-span-5 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4 border-solid">
            <div>
              <h3 class="font-display font-bold text-sm uppercase dark:text-white">Generate Coupon Token</h3>
              <p class="text-[11px] text-slate-400 font-light">Discounts are validated on individual checkout drawers.</p>
            </div>

            <form @submit.prevent="handleCreateVoucher" class="space-y-4">
              <div class="space-y-1">
                <label class="block text-[9px] font-mono text-slate-400 uppercase">COUPON NAME</label>
                <input 
                  type="text" 
                  v-model="voucherCode"
                  placeholder="e.g. STRIPE50"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs font-mono uppercase dark:text-white focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-[9px] font-mono text-slate-400 uppercase">DISCOUNT PERCENTAGE</label>
                <select
                  v-model="voucherDiscount"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                >
                  <option value="10">10% Off</option>
                  <option value="20">20% Off</option>
                  <option value="30">30% Off</option>
                  <option value="50">50% Off (Admin Star)</option>
                </select>
              </div>

              <button class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer border-none">
                Publish Coupon Code
              </button>
            </form>
          </div>

          <div class="lg:col-span-7 space-y-4">
            <span class="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">SECURE SYSTEM VOUCHERS</span>
            <div class="space-y-3">
              <div v-for="v in vouchers" :key="v.code" class="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between border-solid">
                <div class="flex items-center space-x-3">
                  <span class="px-2.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold rounded-xl border border-purple-500/10 border-solid">
                    {{ v.code }}
                  </span>
                  <div>
                    <span class="block text-xs font-bold">{{ v.discountPercent }}% OFF TOTAL</span>
                    <span class="block text-[9px] text-emerald-500 font-mono font-bold uppercase">STATUS: SYSTEM ONLINE</span>
                  </div>
                </div>

                <button
                  @click="handleDeleteVoucher(v.code)"
                  class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-none bg-transparent"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 6: Branding / Settings CMS -->
        <div v-else-if="activeTab === 'branding' && isSuperAdmin" class="space-y-6 text-left max-w-4xl">
          <div>
            <h3 class="font-display font-bold text-sm uppercase dark:text-white">Global Identity Configuration</h3>
            <p class="text-[11px] text-slate-400 font-light">Mutate the public headers and hero descriptors dynamically.</p>
          </div>

          <form @submit.prevent="handleUpdateBranding" class="p-6 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border-solid">
            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">PLATFORM PUBLIC LOGO / NAME</label>
              <input 
                type="text" 
                v-model="pName"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">WHATSAPP DIRECT SUPPORT PHONE</label>
              <input 
                type="text" 
                v-model="whatsapp"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
              />
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">HERO MAIN LANDING HEADING</label>
              <input 
                type="text" 
                v-model="hTitle"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
              />
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[9px] font-mono text-slate-400 uppercase">HERO DESCRIPTION SUBTITLE</label>
              <textarea 
                v-model="hSubtitle"
                rows="2"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none dark:text-white focus:outline-none"
              />
            </div>

            <button class="md:col-span-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer border-none">
              Commit Branding Specifications
            </button>
          </form>
        </div>

        <!-- Tab 7: FAQs CMS -->
        <div v-else-if="activeTab === 'faqs' && isSuperAdmin" class="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
          
          <!-- FAQ Creator -->
          <div class="lg:col-span-5 p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/10 rounded-2xl space-y-4 border-solid">
            <div>
              <h3 class="font-display font-bold text-sm uppercase dark:text-white">Add FAQ Block</h3>
              <p class="text-[11px] text-slate-400 font-light">Publish clear responses to frequently asked student queries.</p>
            </div>

            <form @submit.prevent="handleCreateFaq" class="space-y-3">
              <div class="space-y-1">
                <label class="block text-[9px] font-mono text-slate-400 uppercase">QUESTION</label>
                <input 
                  type="text" 
                  v-model="faqQuestion"
                  placeholder="e.g. Are certificates transferable?"
                  class="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-[9px] font-mono text-slate-400 uppercase">ANSWER BODY</label>
                <textarea 
                  v-model="faqAnswer"
                  rows="3"
                  class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-xl text-xs resize-none dark:text-white focus:outline-none"
                />
              </div>
              <button class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer border-none">
                Append FAQ Item
              </button>
            </form>
          </div>

          <!-- FAQ List -->
          <div class="lg:col-span-7 space-y-3">
            <span class="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">ACTIVE FAQS ON PLATFORM</span>
            <div v-for="f in faqs" :key="f.id" class="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/10 rounded-2xl flex items-center justify-between border-solid">
              <div>
                <span class="block text-xs font-bold text-slate-900 dark:text-white">{{ f.question }}</span>
                <span class="block text-[10px] text-slate-400 mt-1">{{ f.answer }}</span>
              </div>

              <button
                @click="handleDeleteFaq(f.id)"
                class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-none bg-transparent"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ShieldAlert, 
  DollarSign, 
  Users, 
  BookOpen, 
  Tag, 
  Trash2 
} from 'lucide-vue-next'
import { dbService } from '@/lib/db'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-back', 'refresh-courses'])

const activeTab = ref('overview')

// Data State
const courses = ref([])
const profiles = ref([])
const vouchers = ref([])
const faqs = ref([])
const testimonials = ref([])
const announcements = ref([])
const platformSettings = ref(null)

// CMS Inputs
const courseTitle = ref('')
const courseSubtitle = ref('')
const coursePrice = ref('')
const courseDifficulty = ref('Beginner')
const courseCategory = ref('Design Engineering')
const courseDuration = ref('8h 15m')
const courseDescription = ref('')
const courseInstructorId = ref('')

const selectedCourseForLesson = ref('')
const lessonTitle = ref('')
const lessonDuration = ref('15:00')
const lessonVideoUrl = ref('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
const lessonXp = ref('150')

const voucherCode = ref('')
const voucherDiscount = ref('20')

const announcementTitle = ref('')
const announcementContent = ref('')

const faqQuestion = ref('')
const faqAnswer = ref('')

const testiName = ref('')
const testiComment = ref('')
const testiRating = ref('5')

const whatsapp = ref('')
const pName = ref('')
const hTitle = ref('')
const hSubtitle = ref('')

const taUserId = ref('')
const taCourseId = ref('')
const taPermissions = ref(['announcements'])

const taPermissionOptions = [
  { id: 'announcements', label: 'Post Announcements' },
  { id: 'manage_live', label: 'Dispatch Live Classes' },
  { id: 'review_assignments', label: 'Grade Assignments' },
  { id: 'upload_files', label: 'Manage Syllabus Files' }
]

const loadData = async () => {
  try {
    const liveCourses = await dbService.getCourses()
    const liveProfiles = await dbService.listProfiles()
    const liveVouchers = await dbService.getVouchers()
    const liveFaqs = await dbService.getFaqs()
    const liveTestimonials = await dbService.getTestimonials()
    const liveAnnouncements = await dbService.getAnnouncements()
    const liveSettings = await dbService.getSettings()

    courses.value = liveCourses || []
    profiles.value = liveProfiles || []
    vouchers.value = liveVouchers || []
    faqs.value = liveFaqs || []
    testimonials.value = liveTestimonials || []
    announcements.value = liveAnnouncements || []
    platformSettings.value = liveSettings

    if (liveSettings) {
      whatsapp.value = liveSettings.whatsappNumber || ''
      pName.value = liveSettings.platformName || ''
      hTitle.value = liveSettings.heroTitle || ''
      hSubtitle.value = liveSettings.heroSubtitle || ''
    }
  } catch (err) {
    console.error('Error loading admin metrics:', err)
  }
}

onMounted(() => {
  loadData()
})

const isSuperAdmin = computed(() => props.currentUser.role === 'admin')
const isInstructor = computed(() => props.currentUser.role === 'instructor')
const isTA = computed(() => props.currentUser.role === 'ta')

const visibleCourses = computed(() => {
  if (isSuperAdmin.value) return courses.value
  if (isInstructor.value) {
    return courses.value.filter(course => course.instructorId === props.currentUser.id || (course.instructor && course.instructor.id === props.currentUser.id))
  }
  return courses.value
})

const handleCreateCourse = async () => {
  if (!courseTitle.value.trim() || !coursePrice.value) {
    alert('Course Title and tuition fee required.')
    return
  }

  try {
    const selectedInstId = isSuperAdmin.value ? (courseInstructorId.value || props.currentUser.id) : props.currentUser.id
    await dbService.createCourse({
      title: courseTitle.value,
      subtitle: courseSubtitle.value || 'High-fidelity educational modules.',
      duration: courseDuration.value,
      xpReward: 1000,
      coverImage: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=1200',
      category: courseCategory.value,
      description: courseDescription.value || 'No description provided.',
      outcomes: ['Develop spatial system architectures', 'Master layout typography rules'],
      requirements: ['Standard IDE setup', 'Basic framework familiarity'],
      price: Number(coursePrice.value),
      difficulty: courseDifficulty.value,
      instructorId: selectedInstId
    })

    courseTitle.value = ''
    courseSubtitle.value = ''
    coursePrice.value = ''
    courseDescription.value = ''
    
    await loadData()
    emit('refresh-courses')
    alert('Course instantiated successfully.')
  } catch (err) {
    alert(err.message || err)
  }
}

const handleCreateLesson = async () => {
  if (!selectedCourseForLesson.value || !lessonTitle.value.trim()) {
    alert('Please select a course blueprint and add a lesson title.')
    return
  }

  try {
    await dbService.createLesson(selectedCourseForLesson.value, {
      title: lessonTitle.value,
      duration: lessonDuration.value,
      videoUrl: lessonVideoUrl.value,
      isLocked: false,
      xp: Number(lessonXp.value)
    })

    lessonTitle.value = ''
    await loadData()
    alert('Lesson appended securely.')
  } catch (err) {
    alert(err.message || err)
  }
}

const handleDeleteCourse = async (id) => {
  if (!window.confirm('Delete this course blueprint? All associated lessons will be dropped.')) return
  try {
    await dbService.deleteCourse(id)
    await loadData()
    emit('refresh-courses')
  } catch (err) {
    alert(err.message || err)
  }
}

const handleCreateVoucher = async () => {
  if (!voucherCode.value.trim()) return

  try {
    await dbService.createVoucher({
      code: voucherCode.value.toUpperCase(),
      discountPercent: Number(voucherDiscount.value),
      isActive: true
    })
    voucherCode.value = ''
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleDeleteVoucher = async (code) => {
  try {
    await dbService.deleteVoucher(code)
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleCreateAnnouncement = async () => {
  if (!announcementTitle.value.trim() || !announcementContent.value.trim()) return

  try {
    await dbService.createAnnouncement({
      title: announcementTitle.value,
      content: announcementContent.value,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdBy: props.currentUser.name
    })
    announcementTitle.value = ''
    announcementContent.value = ''
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleDeleteAnnouncement = async (id) => {
  try {
    await dbService.deleteAnnouncement(id)
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleUpdateBranding = async () => {
  try {
    await dbService.updateSettings({
      platformName: pName.value,
      platformDescription: platformSettings.value?.platformDescription || '',
      whatsappNumber: whatsapp.value,
      heroTitle: hTitle.value,
      heroSubtitle: hSubtitle.value,
      bannerMessage: platformSettings.value?.bannerMessage || ''
    })
    alert('Branding and platform specifications updated dynamically.')
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleUpdateRole = async (userId, newRole) => {
  try {
    await dbService.updateProfileRole(userId, newRole)
    alert('Security level role modified successfully.')
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleCreateFaq = async () => {
  if (!faqQuestion.value.trim() || !faqAnswer.value.trim()) return
  try {
    await dbService.createFaq({ question: faqQuestion.value, answer: faqAnswer.value })
    faqQuestion.value = ''
    faqAnswer.value = ''
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const handleDeleteFaq = async (id) => {
  try {
    await dbService.deleteFaq(id)
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const toggleTaPermission = (perm) => {
  if (taPermissions.value.includes(perm)) {
    taPermissions.value = taPermissions.value.filter(p => p !== perm)
  } else {
    taPermissions.value.push(perm)
  }
}

const handleAssignTa = async () => {
  if (!taUserId.value || !taCourseId.value) {
    alert('Select TA User and Course blueprint.')
    return
  }

  try {
    await dbService.updateProfileRole(taUserId.value, 'ta')
    await dbService.assignTa({
      userId: taUserId.value,
      courseId: taCourseId.value,
      permissions: taPermissions.value
    })
    alert('TA security permissions mapped successfully.')
    await loadData()
  } catch (err) {
    alert(err.message || err)
  }
}

const emitGoBack = () => {
  emit('go-back')
}
</script>
