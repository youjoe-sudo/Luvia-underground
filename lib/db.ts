import { createClient } from '@supabase/supabase-js';
import { 
  Profile, 
  Course, 
  Lesson, 
  Voucher, 
  Certificate, 
  LiveClass, 
  StudentProgress, 
  TAAssignment, 
  FAQ, 
  Testimonial, 
  Announcement, 
  PlatformSettings,
  Review
} from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is active
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

// LOCAL STORAGE RELATIONAL ENGINE FALLBACK
// ==========================================

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`luvia_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`luvia_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};

// Empty-by-default initial tables
const INITIAL_SETTINGS: PlatformSettings = {
  platformName: 'Luvia',
  platformDescription: 'Minimalist Educational SaaS for elite software creatives.',
  whatsappNumber: '+1 (555) 019-2834',
  heroTitle: 'Deconstruct High-End Interface Engineering',
  heroSubtitle: 'Immersive, physics-based courses breaking down secret motion guidelines and spatial layout design systems.',
  bannerMessage: '🎉 Enrollment open: Next-generation Interactive Springs Masterclass is live!'
};

export class LocalDb {
  static getProfiles(): Profile[] {
    return getStorageItem<Profile[]>('profiles', []);
  }

  static saveProfiles(profiles: Profile[]): void {
    setStorageItem('profiles', profiles);
  }

  static getCourses(): Course[] {
    return getStorageItem<Course[]>('courses', []);
  }

  static saveCourses(courses: Course[]): void {
    setStorageItem('courses', courses);
  }

  static getVouchers(): Voucher[] {
    return getStorageItem<Voucher[]>('vouchers', []);
  }

  static saveVouchers(vouchers: Voucher[]): void {
    setStorageItem('vouchers', vouchers);
  }

  static getCertificates(): Certificate[] {
    return getStorageItem<Certificate[]>('certificates', []);
  }

  static saveCertificates(certs: Certificate[]): void {
    setStorageItem('certificates', certs);
  }

  static getLiveClasses(): LiveClass[] {
    return getStorageItem<LiveClass[]>('live_classes', []);
  }

  static saveLiveClasses(classes: LiveClass[]): void {
    setStorageItem('live_classes', classes);
  }

  static getTaAssignments(): TAAssignment[] {
    return getStorageItem<TAAssignment[]>('ta_assignments', []);
  }

  static saveTaAssignments(assignments: TAAssignment[]): void {
    setStorageItem('ta_assignments', assignments);
  }

  static getFaqs(): FAQ[] {
    return getStorageItem<FAQ[]>('faqs', []);
  }

  static saveFaqs(faqs: FAQ[]): void {
    setStorageItem('faqs', faqs);
  }

  static getTestimonials(): Testimonial[] {
    return getStorageItem<Testimonial[]>('testimonials', []);
  }

  static saveTestimonials(testimonials: Testimonial[]): void {
    setStorageItem('testimonials', testimonials);
  }

  static getAnnouncements(): Announcement[] {
    return getStorageItem<Announcement[]>('announcements', []);
  }

  static saveAnnouncements(announcements: Announcement[]): void {
    setStorageItem('announcements', announcements);
  }

  static getSettings(): PlatformSettings {
    return getStorageItem<PlatformSettings>('settings', INITIAL_SETTINGS);
  }

  static saveSettings(settings: PlatformSettings): void {
    setStorageItem('settings', settings);
  }

  static getEnrollments(): Record<string, string[]> {
    // Maps userId -> list of courseIds
    return getStorageItem<Record<string, string[]>>('enrollments', {});
  }

  static saveEnrollments(enrollments: Record<string, string[]>): void {
    setStorageItem('enrollments', enrollments);
  }

  static getLessonCompletions(): Record<string, string[]> {
    // Maps userId -> list of completed lessonIds
    return getStorageItem<Record<string, string[]>>('lesson_completions', {});
  }

  static saveLessonCompletions(completions: Record<string, string[]>): void {
    setStorageItem('lesson_completions', completions);
  }
}

// ==========================================
// UNIFIED DATA SERVICE (SUPABASE OR LOCAL)
// ==========================================

export const dbService = {
  // Check if system has no users (fresh launch setup trigger)
  async isSystemEmpty(): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { count, error } = await supabase!
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          return count === 0;
        }
      } catch (err) {
        console.error('Supabase count error, fallback to local check', err);
      }
    }
    return LocalDb.getProfiles().length === 0;
  },

  // Auth Operations
  async signUp(email: string, name: string, role: 'admin' | 'instructor' | 'ta' | 'student' = 'student'): Promise<Profile> {
    const cleanEmail = email.trim().toLowerCase();
    
    if (isSupabaseConfigured()) {
      const mockId = crypto.randomUUID();
      const profile: Profile = {
        id: mockId,
        email: cleanEmail,
        name,
        role,
        currentStreak: 1,
        totalXp: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString()
      };
      
      const { error } = await supabase!
        .from('profiles')
        .insert([{
          id: mockId,
          email: cleanEmail,
          name,
          role,
          points: 0,
          is_active: true,
          is_banned: false,
          gender: 'female' // default for schema CHECK constraint
        }]);
      if (!error) return profile;
      console.error('Supabase signUp error, falling back to LocalDb', error);
    }

    // Local DB write
    const profiles = LocalDb.getProfiles();
    const existing = profiles.find(p => p.email === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      name,
      role,
      currentStreak: 1,
      totalXp: 0,
      currentLevel: 1,
      createdAt: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    LocalDb.saveProfiles(profiles);
    return newProfile;
  },

  async signIn(email: string): Promise<Profile> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      
      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          currentStreak: 1,
          totalXp: data.points || 0,
          currentLevel: Math.floor((data.points || 0) / 500) + 1
        };
      }
    }

    const profiles = LocalDb.getProfiles();
    const found = profiles.find(p => p.email === cleanEmail);
    if (!found) {
      throw new Error('Account not found. Please register.');
    }
    return found;
  },

  async getProfile(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          currentStreak: 1,
          totalXp: data.points || 0,
          currentLevel: Math.floor((data.points || 0) / 500) + 1
        };
      }
    }
    return LocalDb.getProfiles().find(p => p.id === id) || null;
  },

  async updateProfileProgress(userId: string, xpAwarded: number): Promise<Profile> {
    if (isSupabaseConfigured()) {
      const profile = await this.getProfile(userId);
      if (profile) {
        const nextXp = profile.totalXp + xpAwarded;
        
        const { data, error } = await supabase!
          .from('profiles')
          .update({
            points: nextXp,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .maybeSingle();
          
        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            currentStreak: 1,
            totalXp: data.points || 0,
            currentLevel: Math.floor((data.points || 0) / 500) + 1
          };
        }
      }
    }

    const profiles = LocalDb.getProfiles();
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      const p = profiles[idx];
      const nextXp = p.totalXp + xpAwarded;
      const nextLevel = Math.floor(nextXp / 500) + 1;
      profiles[idx] = {
        ...p,
        totalXp: nextXp,
        currentLevel: nextLevel > p.currentLevel ? nextLevel : p.currentLevel
      };
      LocalDb.saveProfiles(profiles);
      return profiles[idx];
    }
    throw new Error('Profile not found');
  },

  async listProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      const { data } = await supabase!.from('profiles').select('*');
      if (data) {
        return data.map(d => ({
          id: d.id,
          email: d.email,
          name: d.name,
          role: d.role,
          currentStreak: 1,
          totalXp: d.points || 0,
          currentLevel: Math.floor((d.points || 0) / 500) + 1
        }));
      }
    }
    return LocalDb.getProfiles();
  },

  async updateProfileRole(id: string, role: 'admin' | 'instructor' | 'ta' | 'student'): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase!.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
    }
    const profiles = LocalDb.getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      profiles[idx].role = role;
      LocalDb.saveProfiles(profiles);
    }
  },

  // Courses Operations
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase!
          .from('courses')
          .select('*, lessons(*)');
        if (!error && data) {
          return data.map(c => ({
            id: c.id,
            title: c.title_en || c.title_ar || '',
            subtitle: c.description_en || c.description_ar || '',
            duration: '12 hours',
            rating: 4.9,
            lessonsCount: c.lessons ? c.lessons.length : 0,
            xpReward: 300,
            coverImage: c.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
            category: 'Interface Engineering',
            description: c.description_en || c.description_ar || '',
            outcomes: ['Develop spatial systems', 'Master layout typography', 'Understand spring physics'],
            requirements: ['Basic UI/UX knowledge', 'Familiarity with React'],
            price: Number(c.price_usd) || 0,
            difficulty: 'Intermediate' as any,
            instructorId: c.instructor_id || undefined,
            instructor: {
              id: c.instructor_id || 'marcus',
              name: c.instructor_name_en || c.instructor_name_ar || 'Marcus Vance',
              role: 'Design Specialist',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
              bio: 'Platform visual designer and tutor.',
              coursesCount: 3,
              studentsCount: 1420
            },
            lessons: (c.lessons || []).map((l: any) => ({
              id: l.id,
              title: l.title_en || l.title_ar || '',
              duration: '35 mins',
              videoUrl: l.google_drive_video_id || 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              isLocked: false,
              xp: 150,
              attachments: [],
              transcript: []
            })),
            reviews: []
          }));
        }
      } catch (err) {
        console.error('Supabase courses select failed, falling back to local database', err);
      }
    }
    return LocalDb.getCourses();
  },

  async createCourse(courseData: Omit<Course, 'id' | 'lessons' | 'reviews' | 'rating' | 'lessonsCount'> & { instructorId: string }): Promise<Course> {
    const profiles = await this.listProfiles();
    const instructorProfile = profiles.find(p => p.id === courseData.instructorId);
    
    const mockInstructorObj = {
      id: courseData.instructorId,
      name: instructorProfile?.name || 'Assigned Instructor',
      role: instructorProfile?.role === 'instructor' ? 'Design Specialist' : 'Educator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      bio: 'Professional platform educator.',
      coursesCount: 1,
      studentsCount: 0
    };

    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: courseData.title,
      subtitle: courseData.subtitle,
      duration: courseData.duration,
      rating: 5.0,
      lessonsCount: 0,
      xpReward: courseData.xpReward,
      coverImage: courseData.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      category: courseData.category,
      description: courseData.description,
      outcomes: courseData.outcomes,
      requirements: courseData.requirements,
      price: courseData.price,
      difficulty: courseData.difficulty,
      lessons: [],
      reviews: []
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!
          .from('courses')
          .insert([{
            id: newCourse.id,
            title_en: newCourse.title,
            title_ar: newCourse.title,
            description_en: newCourse.description || newCourse.subtitle,
            description_ar: newCourse.description || newCourse.subtitle,
            instructor_name_en: mockInstructorObj.name,
            instructor_name_ar: mockInstructorObj.name,
            price_usd: newCourse.price,
            thumbnail_url: newCourse.coverImage,
            is_published: true,
            instructor_id: courseData.instructorId
          }]);
        if (!error) return newCourse;
        console.error('Supabase createCourse insert failed', error);
      } catch (err) {
        console.error('Supabase createCourse error', err);
      }
    }

    // Set instructor ref
    newCourse.instructor = mockInstructorObj;
    
    const courses = LocalDb.getCourses();
    courses.push(newCourse);
    LocalDb.saveCourses(courses);
    return newCourse;
  },

  async updateCourse(id: string, updated: Partial<Course>): Promise<Course> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('courses')
          .update({
            title_en: updated.title,
            title_ar: updated.title,
            description_en: updated.description || updated.subtitle,
            description_ar: updated.description || updated.subtitle,
            price_usd: updated.price,
            thumbnail_url: updated.coverImage,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.error('Supabase updateCourse error', err);
      }
    }

    const courses = LocalDb.getCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], ...updated };
      LocalDb.saveCourses(courses);
      return courses[idx];
    }
    throw new Error('Course not found');
  },

  async deleteCourse(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!.from('courses').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteCourse error', err);
      }
    }
    const courses = LocalDb.getCourses();
    const filtered = courses.filter(c => c.id !== id);
    LocalDb.saveCourses(filtered);
  },

  // Lessons Operations
  async createLesson(courseId: string, lessonData: Omit<Lesson, 'id'>): Promise<Lesson> {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: lessonData.title,
      duration: lessonData.duration,
      videoUrl: lessonData.videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isLocked: lessonData.isLocked,
      xp: lessonData.xp,
      attachments: lessonData.attachments || [],
      transcript: lessonData.transcript || []
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('lessons')
          .insert([{
            id: newLesson.id,
            course_id: courseId,
            title_en: newLesson.title,
            title_ar: newLesson.title,
            google_drive_video_id: newLesson.videoUrl,
            order_index: 0,
            lesson_type: 'video'
          }]);
      } catch (err) {
        console.error('Supabase createLesson error', err);
      }
    }

    const courses = LocalDb.getCourses();
    const courseIdx = courses.findIndex(c => c.id === courseId);
    if (courseIdx !== -1) {
      courses[courseIdx].lessons.push(newLesson);
      courses[courseIdx].lessonsCount = courses[courseIdx].lessons.length;
      LocalDb.saveCourses(courses);
    }
    return newLesson;
  },

  async deleteLesson(courseId: string, lessonId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!.from('lessons').delete().eq('id', lessonId);
      } catch (err) {
        console.error('Supabase deleteLesson error', err);
      }
    }
    const courses = LocalDb.getCourses();
    const courseIdx = courses.findIndex(c => c.id === courseId);
    if (courseIdx !== -1) {
      courses[courseIdx].lessons = courses[courseIdx].lessons.filter(l => l.id !== lessonId);
      courses[courseIdx].lessonsCount = courses[courseIdx].lessons.length;
      LocalDb.saveCourses(courses);
    }
  },

  // Enrollment & Progress
  async getEnrollments(userId: string): Promise<string[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase!
          .from('user_courses')
          .select('course_id')
          .eq('user_id', userId);
        if (data) {
          return data.map(d => d.course_id);
        }
      } catch (err) {
        console.error('Supabase getEnrollments error', err);
      }
    }
    const enrols = LocalDb.getEnrollments();
    return enrols[userId] || [];
  },

  async enrollInCourse(userId: string, courseId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('user_courses')
          .insert([{ user_id: userId, course_id: courseId }]);
      } catch (err) {
        console.error('Supabase enrollInCourse error', err);
      }
    }
    const enrols = LocalDb.getEnrollments();
    if (!enrols[userId]) {
      enrols[userId] = [];
    }
    if (!enrols[userId].includes(courseId)) {
      enrols[userId].push(courseId);
      LocalDb.saveEnrollments(enrols);
    }
  },

  async getCompletedLessons(userId: string): Promise<string[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase!
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('is_completed', true);
        if (data) {
          return data.map(d => d.lesson_id);
        }
      } catch (err) {
        console.error('Supabase getCompletedLessons error', err);
      }
    }
    const completions = LocalDb.getLessonCompletions();
    return completions[userId] || [];
  },

  async completeLesson(userId: string, courseId: string, lessonId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { data: existing } = await supabase!
          .from('lesson_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (existing) {
          await supabase!
            .from('lesson_progress')
            .update({ is_completed: true, completed_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await supabase!
            .from('lesson_progress')
            .insert([{
              user_id: userId,
              lesson_id: lessonId,
              is_completed: true,
              completed_at: new Date().toISOString()
            }]);
        }
      } catch (err) {
        console.error('Supabase completeLesson error', err);
      }
    }

    const completions = LocalDb.getLessonCompletions();
    if (!completions[userId]) {
      completions[userId] = [];
    }
    if (!completions[userId].includes(lessonId)) {
      completions[userId].push(lessonId);
      LocalDb.saveLessonCompletions(completions);
    }
  },

  // Voucher operations
  async getVouchers(): Promise<Voucher[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase!.from('vouchers').select('*');
        if (data) {
          return data.map(d => ({
            code: d.code,
            discountPercent: 100,
            isActive: !d.is_used && (d.expiry_date ? new Date(d.expiry_date) > new Date() : true)
          }));
        }
      } catch (err) {
        console.error('Supabase getVouchers error', err);
      }
    }
    return LocalDb.getVouchers();
  },

  async verifyVoucher(code: string): Promise<Voucher | null> {
    const list = await this.getVouchers();
    const matched = list.find(v => v.code.toUpperCase() === code.toUpperCase() && v.isActive);
    return matched || null;
  },

  async createVoucher(voucher: Voucher): Promise<Voucher> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('vouchers')
          .insert([{
            code: voucher.code.toUpperCase(),
            is_used: false
          }]);
      } catch (err) {
        console.error('Supabase createVoucher error', err);
      }
    }
    const vouchers = LocalDb.getVouchers();
    if (!vouchers.some(v => v.code === voucher.code.toUpperCase())) {
      vouchers.push({ ...voucher, code: voucher.code.toUpperCase() });
      LocalDb.saveVouchers(vouchers);
    }
    return voucher;
  },

  async deleteVoucher(code: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!.from('vouchers').delete().eq('code', code.toUpperCase());
      } catch (err) {
        console.error('Supabase deleteVoucher error', err);
      }
    }
    const vouchers = LocalDb.getVouchers();
    const filtered = vouchers.filter(v => v.code !== code.toUpperCase());
    LocalDb.saveVouchers(filtered);
  },

  // Live Classes
  async getLiveClasses(): Promise<LiveClass[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase!.from('live_lectures').select('*');
        if (data) {
          return data.map(d => ({
            id: d.id,
            title: 'Live Workshop Session',
            description: 'Advanced real-time interactive visual design guidelines.',
            speaker: 'Lead Specialist',
            startsInMinutes: d.is_active ? 0 : 45,
            participantsCount: 22,
            isLive: d.is_active
          }));
        }
      } catch (err) {
        console.error('Supabase live_lectures query error', err);
      }
    }
    return LocalDb.getLiveClasses();
  },

  async createLiveClass(lc: Omit<LiveClass, 'id'>): Promise<LiveClass> {
    const newClass: LiveClass = {
      id: crypto.randomUUID(),
      title: lc.title,
      description: lc.description,
      speaker: lc.speaker,
      startsInMinutes: lc.startsInMinutes,
      participantsCount: lc.participantsCount,
      isLive: lc.isLive
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('live_lectures')
          .insert([{
            id: newClass.id,
            is_active: newClass.isLive
          }]);
      } catch (err) {
        console.error('Supabase live_lectures insert error', err);
      }
    }

    const classes = LocalDb.getLiveClasses();
    classes.push(newClass);
    LocalDb.saveLiveClasses(classes);
    return newClass;
  },

  async deleteLiveClass(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!.from('live_lectures').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase live_lectures delete error', err);
      }
    }
    const classes = LocalDb.getLiveClasses().filter(c => c.id !== id);
    LocalDb.saveLiveClasses(classes);
  },

  // TA Assignments / Permissions
  async getTaAssignments(): Promise<TAAssignment[]> {
    return LocalDb.getTaAssignments();
  },

  async assignTa(ta: TAAssignment): Promise<void> {
    const tas = LocalDb.getTaAssignments();
    tas.push(ta);
    LocalDb.saveTaAssignments(tas);
  },

  async removeTa(userId: string, courseId: string): Promise<void> {
    const tas = LocalDb.getTaAssignments().filter(t => !(t.userId === userId && t.courseId === courseId));
    LocalDb.saveTaAssignments(tas);
  },

  // FAQs
  async getFaqs(): Promise<FAQ[]> {
    return LocalDb.getFaqs();
  },

  async createFaq(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
    const item: FAQ = { id: crypto.randomUUID(), ...faq };
    const faqs = LocalDb.getFaqs();
    faqs.push(item);
    LocalDb.saveFaqs(faqs);
    return item;
  },

  async deleteFaq(id: string): Promise<void> {
    const faqs = LocalDb.getFaqs().filter(f => f.id !== id);
    LocalDb.saveFaqs(faqs);
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return LocalDb.getTestimonials();
  },

  async createTestimonial(t: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const item: Testimonial = { id: crypto.randomUUID(), ...t };
    const ts = LocalDb.getTestimonials();
    ts.push(item);
    LocalDb.saveTestimonials(ts);
    return item;
  },

  async deleteTestimonial(id: string): Promise<void> {
    const ts = LocalDb.getTestimonials().filter(t => t.id !== id);
    LocalDb.saveTestimonials(ts);
  },

  // Settings
  async getSettings(): Promise<PlatformSettings> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase!
          .from('settings')
          .select('*')
          .eq('key', 'global')
          .maybeSingle();
        if (data && data.value) {
          try {
            return JSON.parse(data.value) as PlatformSettings;
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.error('Supabase settings query error', err);
      }
    }
    return LocalDb.getSettings();
  },

  async updateSettings(settings: PlatformSettings): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('settings')
          .upsert({ key: 'global', value: JSON.stringify(settings) });
      } catch (err) {
        console.error('Supabase settings upsert error', err);
      }
    }
    LocalDb.saveSettings(settings);
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return LocalDb.getAnnouncements();
  },

  async createAnnouncement(a: Omit<Announcement, 'id'>): Promise<Announcement> {
    const item: Announcement = { id: crypto.randomUUID(), ...a };
    const list = LocalDb.getAnnouncements();
    list.unshift(item);
    LocalDb.saveAnnouncements(list);
    return item;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const list = LocalDb.getAnnouncements().filter(a => a.id !== id);
    LocalDb.saveAnnouncements(list);
  },

  // Certificates
  async getCertificates(userId: string): Promise<Certificate[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase!
          .from('certificates')
          .select('*')
          .eq('student_id', userId);
        if (data) {
          return data.map(d => ({
            id: d.id,
            userId: d.student_id,
            title: d.description_en || 'Interaction Specialist Certified',
            courseTitle: d.description_ar || 'Advanced Design & Interaction Dynamics',
            recipientName: d.student_full_name || 'Student Name',
            dateEarned: d.issued_at ? new Date(d.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'July 12, 2026',
            hash: d.instructor_signature_text || `LUV-${Math.floor(10000 + Math.random() * 90000)}`,
            qrUrl: d.qr_code_data || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://luvia.edu/verify/${d.id}`
          }));
        }
      } catch (err) {
        console.error('Supabase certificates query error', err);
      }
    }
    return LocalDb.getCertificates().filter(c => c.userId === userId);
  },

  async createCertificate(userId: string, courseTitle: string, recipientName: string): Promise<Certificate> {
    const hash = `LUV-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newCert: Certificate = {
      id: crypto.randomUUID(),
      userId,
      title: 'Interaction Specialist Certified',
      courseTitle,
      recipientName,
      dateEarned: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      hash,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://luvia.edu/verify/${hash}`
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase!
          .from('certificates')
          .insert([{
            id: newCert.id,
            student_id: userId,
            student_full_name: recipientName,
            description_en: newCert.title,
            description_ar: courseTitle,
            instructor_signature_text: hash,
            qr_code_data: newCert.qrUrl,
            issued_at: new Date().toISOString()
          }]);
      } catch (err) {
        console.error('Supabase createCertificate error', err);
      }
    }

    const certs = LocalDb.getCertificates();
    certs.push(newCert);
    LocalDb.saveCertificates(certs);
    return newCert;
  }
};
