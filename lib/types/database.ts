// Hand-written database row types that mirror supabase/migrations/0001_init.sql.
// Generate a richer typed client later with `supabase gen types typescript --linked`.
//
// The shape here matches the GenericTable / GenericView / GenericFunction
// constraints from @supabase/postgrest-js. In particular every table needs
// `Relationships: []`; otherwise the typed client collapses every row to
// `never`, which then cascades into "Property X does not exist on type never"
// errors across the entire codebase.

export type UserRole = 'student' | 'instructor' | 'coordinator' | 'admin' | 'super_admin';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'contacted' | 'converted' | 'enrolled';
export type SessionStatus = 'pending' | 'live' | 'ended' | 'completed';
export type AttendanceFinal = 'present' | 'absent';
export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type QuestionType = 'single_choice' | 'multiple_choice';

type AnyTable<R, I = Partial<R>, U = Partial<R>> = {
  Row: R;
  Insert: I;
  Update: U;
  Relationships: [];
};

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;
  must_change_password: boolean;
  xp_total: number;
  last_activity_date: string | null;
  last_login_ip: string | null;
  browser_fingerprint: string | null;
  active_session_id: string | null;
  active_session_started_at: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface EnrollmentRequestRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  status: 'pending' | 'contacted' | 'approved' | 'rejected' | 'converted' | 'enrolled';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandSettingsRow {
  id: string;
  platform_name: string;
  primary_font: string;
  colors: {
    primary_purple: string;
    cyan_blue: string;
    electric_blue: string;
    dark_navy: string;
    white: string;
    rich_black: string;
  };
  logos: Record<string, string>;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CohortRow {
  id: string;
  course_id: string;
  group_name: string;
  coordinator_id: string | null;
  instructor_id: string | null;
  created_at: string;
}

export interface StudentCohortRow {
  student_id: string;
  cohort_id: string;
  enrolled_at: string;
}

export interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface VoucherRow {
  id: string;
  code: string;
  course_id: string;
  is_used: boolean;
  used_by_user_id: string | null;
  used_at: string | null;
  created_at: string;
}

export interface VirtualSessionRow {
  id: string;
  cohort_id: string;
  course_id: string;
  title: string;
  start_time: string;
  end_time: string;
  meeting_link: string | null;
  is_link_active: boolean;
  status: SessionStatus;
  is_attendance_confirmed: boolean;
}

export interface AttendanceRecordRow {
  id: string;
  session_id: string;
  student_id: string;
  first_check: boolean;
  second_check: boolean;
  final_status: AttendanceFinal;
}

export interface LessonRow {
  id: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description: string | null;
  description_ar: string | null;
  video_id: string;
  duration_seconds: number;
  xp_reward: number;
  sort_order: number;
  created_at: string;
}

export interface LessonAttachmentRow {
  id: string;
  lesson_id: string;
  file_name: string;
  storage_url: string;
  size_bytes: number | null;
  created_at: string;
}

export interface LessonProgressRow {
  id: string;
  student_id: string;
  lesson_id: string;
  completed_at: string;
  watch_seconds: number;
}

export interface ExamRow {
  id: string;
  course_id: string;
  cohort_id: string;
  session_id: string | null;
  lesson_id: string | null;
  title: string;
  is_periodic: boolean;
  is_final: boolean;
  requires_attendance: boolean;
  requires_lesson_complete: boolean;
  time_limit_minutes: number | null;
  created_at: string;
}

export interface ExamQuestionRow {
  id: string;
  exam_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  correct: number[];
  sort_order: number;
  points: number;
}

export interface ExamAttemptRow {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
}

export interface CertificateRow {
  id: string;
  user_id: string;
  course_id: string;
  cohort_id: string | null;
  issued_at: string;
  instructor_signature_name: string | null;
  pdf_storage_url: string | null;
}

export interface SupportTicketRow {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface DeviceLockRow {
  id: string;
  user_id: string;
  device_fingerprint: string;
  ip_address: string | null;
  is_approved: boolean;
  flagged_at: string;
}

export interface CommunityPostRow {
  id: string;
  cohort_id: string;
  course_id: string;
  author_id: string;
  title: string | null;
  body: string;
  created_at: string;
}

export interface ResourceRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  storage_url: string | null;
  external_url: string | null;
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  title_ar: string | null;
  body_ar: string | null;
  is_published: boolean;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  question_ar: string | null;
  answer_ar: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface TestimonialRow {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  is_published: boolean;
  created_at: string;
}

// Convenience aggregate used by the typed client.
export interface Database {
  public: {
    Tables: {
      users: AnyTable<UserRow, Partial<UserRow> & { id: string; email: string; full_name: string }>;
      enrollment_requests: AnyTable<EnrollmentRequestRow, Omit<EnrollmentRequestRow, 'id' | 'created_at' | 'updated_at' | 'reviewed_by' | 'reviewed_at'>>;
      brand_settings: AnyTable<BrandSettingsRow>;
      courses: AnyTable<CourseRow, Omit<CourseRow, 'id' | 'created_at'>>;
      cohorts: AnyTable<CohortRow, Omit<CohortRow, 'id' | 'created_at'>>;
      student_cohorts: AnyTable<StudentCohortRow>;
      enrollments: AnyTable<EnrollmentRow, Omit<EnrollmentRow, 'id' | 'enrolled_at'>>;
      vouchers: AnyTable<VoucherRow, Omit<VoucherRow, 'id' | 'created_at' | 'is_used' | 'used_by_user_id' | 'used_at'>>;
      virtual_sessions: AnyTable<VirtualSessionRow, Omit<VirtualSessionRow, 'id'>>;
      attendance_records: AnyTable<AttendanceRecordRow, Omit<AttendanceRecordRow, 'id'>>;
      lessons: AnyTable<LessonRow, Omit<LessonRow, 'id' | 'created_at'>>;
      lesson_attachments: AnyTable<LessonAttachmentRow, Omit<LessonAttachmentRow, 'id' | 'created_at'>>;
      lesson_progress: AnyTable<LessonProgressRow, Omit<LessonProgressRow, 'id' | 'completed_at'>>;
      exams: AnyTable<ExamRow, Omit<ExamRow, 'id' | 'created_at'>>;
      exam_questions: AnyTable<ExamQuestionRow, Omit<ExamQuestionRow, 'id'>>;
      exam_attempts: AnyTable<ExamAttemptRow, Omit<ExamAttemptRow, 'id' | 'started_at' | 'submitted_at' | 'score' | 'total_points' | 'passed'>>;
      certificates: AnyTable<CertificateRow, Omit<CertificateRow, 'id' | 'issued_at'>>;
      support_tickets: AnyTable<SupportTicketRow, Omit<SupportTicketRow, 'id' | 'created_at' | 'updated_at' | 'status'>>;
      device_locks: AnyTable<DeviceLockRow, Omit<DeviceLockRow, 'id' | 'flagged_at'>>;
      community_posts: AnyTable<CommunityPostRow, Omit<CommunityPostRow, 'id' | 'created_at'>>;
      resources: AnyTable<ResourceRow, Omit<ResourceRow, 'id' | 'created_at'>>;
      announcements: AnyTable<AnnouncementRow, Omit<AnnouncementRow, 'id' | 'created_at' | 'published_at' | 'created_by'>>;
      faqs: AnyTable<FaqRow, Omit<FaqRow, 'id' | 'created_at'>>;
      testimonials: AnyTable<TestimonialRow, Omit<TestimonialRow, 'id' | 'created_at'>>;
    };
    Views: Record<string, never>;
    Functions: {
      complete_lesson: {
        Args: { p_lesson_id: string };
        Returns: Array<{ xp_awarded: number; xp_total: number; already_completed: boolean }>;
      };
      heartbeat_ping: { Args: { p_fingerprint: string; p_session_id: string }; Returns: string };
      start_session: { Args: { p_fingerprint: string }; Returns: string };
      end_session: { Args: Record<string, never>; Returns: void };
      admin_create_user: {
        Args: { p_email: string; p_full_name: string; p_phone: string; p_role: UserRole; p_temp_password: string };
        Returns: string;
      };
      can_attempt_exam: { Args: { p_exam_id: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_role: { Args: Record<string, never>; Returns: UserRole };
      is_cohort_staff: { Args: { p_cohort: string }; Returns: boolean };
      is_cohort_instructor: { Args: { p_cohort: string }; Returns: boolean };
      my_staff_cohorts: {
        Args: Record<string, never>;
        Returns: Array<{ id: string; course_id: string; group_name: string; role: string | null }>;
      };
    };
    Enums: {
      user_role: UserRole;
      request_status: RequestStatus;
      session_status: SessionStatus;
      attendance_final: AttendanceFinal;
      ticket_status: TicketStatus;
      question_type: QuestionType;
    };
  };
}