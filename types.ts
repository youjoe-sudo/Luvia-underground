export type UserRole = 'admin' | 'instructor' | 'ta' | 'student';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  currentStreak: number;
  totalXp: number;
  currentLevel: number;
  createdAt?: string;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  coursesCount: number;
  studentsCount: number;
}

export interface Attachment {
  name: string;
  size: string;
  url: string;
}

export interface TranscriptLine {
  time: string;
  text: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isLocked: boolean;
  isCompleted?: boolean;
  xp: number;
  attachments?: Attachment[];
  transcript?: TranscriptLine[];
  sortOrder?: number;
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  rating: number;
  lessonsCount: number;
  xpReward: number;
  coverImage: string;
  instructorId?: string; // Links to Profile
  instructor?: Instructor; // Kept for compatibility but resolved dynamically
  category: string;
  description: string;
  outcomes: string[];
  requirements: string[];
  price: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
  reviews: Review[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Certificate {
  id: string;
  userId: string;
  title: string;
  courseTitle: string;
  recipientName: string;
  dateEarned: string;
  hash: string;
  qrUrl: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speakerId?: string;
  startsInMinutes: number;
  participantsCount: number;
  isLive: boolean;
}

export interface StudentProgress {
  currentStreak: number;
  totalXp: number;
  coursesCompleted: number;
  currentLevel: number;
}

export interface UserComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; userReacted?: boolean }[];
}

export interface Voucher {
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export interface TAAssignment {
  userId: string;
  courseId: string;
  permissions: ('review_assignments' | 'view_progress' | 'manage_live' | 'announcements' | 'upload_files')[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  comment: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId?: string; // Optional global vs course-specific
  date: string;
  createdBy: string;
}

export interface PlatformSettings {
  platformName: string;
  platformDescription: string;
  whatsappNumber: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerMessage?: string;
}
