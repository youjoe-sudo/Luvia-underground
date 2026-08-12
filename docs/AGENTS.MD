# Luvia — Product & Technical Specification for Claude

## Project Status

Luvia is currently an educational platform focused on delivering **one primary course**.

The platform must be designed in a way that allows future expansion to multiple courses, instructors, TAs, and more advanced educational features, but the current product experience must remain intentionally focused around a single course.

This document is the source of truth for implementing the current Luvia platform.

---

# 1. Product Vision

Luvia is a modern educational platform where a student can:

1. Discover the course without creating an account.
2. Read about the course and its educational value.
3. Submit an enrollment request.
4. Provide their personal/contact information.
5. Wait for an organizer to review the request.
6. Receive manually created login credentials through WhatsApp or email.
7. Log in for the first time.
8. Be forced to change the temporary password.
9. Enter the student dashboard.
10. Progress through the course lesson by lesson.
11. Track completed lessons.
12. Earn XP / points.
13. Maintain learning progress.
14. Attend live sessions when available.
15. Eventually receive a certificate after completing the required course conditions.

The platform should feel like a premium, focused educational product rather than a generic LMS.

---

# 2. Current Product Scope

## Current limitation

Luvia currently contains:

- One course.
- One primary learning path.
- One student journey.
- Manual student account creation.
- Organizer/admin controlled enrollment.
- Video lessons.
- Lesson progress.
- XP / gamification.
- Live classes.
- Certificates.
- Announcements.
- FAQ.
- Testimonials.
- Reviews.
- Platform settings.

Do NOT build the current UI as if Luvia is already a marketplace containing hundreds of courses.

The architecture may support future courses, but the UI should communicate:

> "This is the Luvia course."

rather than:

> "This is a course marketplace."

---

# 3. Core User Journey

The most important flow in the application is:

```text
Visitor
   ↓
Landing Page
   ↓
Course Information
   ↓
Enrollment Request
   ↓
Submit Personal Information
   ↓
Organizer Receives Request
   ↓
Organizer Reviews Request
   ↓
Organizer Creates Student Account
   ↓
Credentials Sent via WhatsApp / Email
   ↓
Student Logs In
   ↓
Mandatory Password Change
   ↓
Student Dashboard
   ↓
Course
   ↓
Lesson
   ↓
Complete Lesson
   ↓
Earn XP
   ↓
Continue Learning
   ↓
Course Completion
   ↓
Certificate
```

This flow should be treated as the primary product architecture.

---

# 4. Authentication Philosophy

## Important

Do NOT implement public student registration.

There must NOT be a normal:

```text
Create Account
```

flow for students.

Instead:

```text
Request Enrollment
```

is the public entry point.

A visitor does not become an authenticated user merely by submitting the enrollment form.

---

# 5. Enrollment Request System

Create a dedicated enrollment request entity.

Recommended table:

```sql
public.enrollment_requests
```

Suggested fields:

```text
id
full_name
email
phone
whatsapp
notes
status
reviewed_by
reviewed_at
created_at
updated_at
```

Recommended status values:

```text
pending
approved
rejected
contacted
converted
```

Potential future fields:

```text
country
age
occupation
education_level
preferred_contact_method
additional_data
```

Do not overcomplicate the current form.

---

# 6. Public Enrollment Form

The form should be accessible without authentication.

Minimum fields:

* Full name
* Email
* Phone number
* WhatsApp number
* Optional message / notes

If phone and WhatsApp are identical, allow the user to indicate that.

Example:

```text
Full Name
Email Address
Phone Number
WhatsApp Number
Message (Optional)
[Submit Enrollment Request]
```

After successful submission:

```text
Your request has been received.

Our team will review your application and contact you through
WhatsApp or email with your account details.
```

Do not automatically log the user in.

Do not automatically create a student account.

---

# 7. Organizer Enrollment Workflow

The organizer/admin dashboard must contain:

```text
Enrollment Requests
```

Each request should show:

* Name
* Email
* Phone
* WhatsApp
* Submission date
* Status
* Notes

Actions:

```text
View
Contact
Approve
Reject
Create Account
```

Once the organizer decides to accept the student:

```text
Create Student Account
```

The system should create the authenticated user account and corresponding profile.

---

# 8. Manual Account Creation

The organizer creates:

```text
Email
Name
Role = student
Temporary Password
```

The current requested default temporary password is:

```text
12345678
```

However, this must be treated as a **temporary credential only**.

The system must require a password change immediately after first login.

Preferably, make the temporary password configurable by the administrator in the future.

Never store plaintext passwords in the database.

If Supabase Auth is used, the password must be managed through Supabase Auth rather than `profiles`.

---

# 9. First Login Password Flow

When an organizer creates a student account, the student's profile must contain a state such as:

```text
must_change_password = true
```

or an equivalent secure mechanism.

Student login:

```text
Email
Password
```

After successful authentication:

```text
IF must_change_password = true
    → Redirect to Change Password screen
ELSE
    → Redirect to Student Dashboard
```

The student must not be able to access the normal dashboard until the password has been changed.

---

# 10. Mandatory Password Change Screen

The screen should clearly communicate:

```text
Welcome to Luvia

For your security, please create a new password before continuing.
```

Fields:

```text
Current Password
New Password
Confirm New Password
```

Validation:

* New password must meet the configured minimum length.
* Confirmation must match.
* Password must not be empty.
* Password must be different from the temporary password.

After successful change:

```text
must_change_password = false
```

Then redirect to:

```text
Student Dashboard
```

---

# 11. Authentication Roles

The existing RBAC model should remain conceptually supported:

```text
admin
instructor
ta
student
```

Current practical usage:

### Admin

Can:

* Manage students.
* Manage enrollment requests.
* Create student accounts.
* Manage course.
* Manage lessons.
* Manage instructors.
* Manage TAs.
* Manage live classes.
* Manage vouchers.
* Manage certificates.
* Manage announcements.
* Manage FAQ.
* Manage testimonials.
* Manage settings.

### Instructor

Can:

* Manage assigned course content.
* Manage lessons.
* View students enrolled in their course.
* View student progress.
* Participate in educational operations.

### TA

Can:

* View assigned course/student information.
* View progress.
* Assist with live classes.
* Perform only permissions explicitly assigned by admin/instructor.

### Student

Can:

* View own profile.
* View own course.
* View own lessons.
* Complete lessons.
* View own progress.
* Earn XP.
* View own certificates.
* Attend available live classes.
* View announcements.
* Update allowed personal information.
* Change password.

---

# 12. Current UI Navigation

## Public Navigation

The public website should contain approximately:

```text
Luvia
Course
How It Works
FAQ
About
Login
Enroll
```

Do not show an excessive number of courses.

The primary CTA should be:

```text
Enroll Now
```

Secondary CTA:

```text
Login
```

---

# 13. Student Navigation

After login:

```text
Dashboard
My Course
Progress
Live Classes
Certificates
Announcements
Profile
Settings
```

Keep navigation simple.

The student should always know:

1. What they are learning.
2. What they completed.
3. What comes next.
4. How much remains.

---

# 14. Student Dashboard

The dashboard should be the central student experience.

Suggested sections:

## Welcome

```text
Welcome back, [Name]
Continue your learning journey.
```

## Current Course

Show:

* Course thumbnail
* Course title
* Progress percentage
* Completed lessons
* Total lessons
* Continue button

Example:

```text
Advanced Interface Engineering

68% Complete

17 / 25 Lessons

[Continue Learning]
```

## XP

Show:

```text
XP
2,450
```

## Level

Example:

```text
Level 5
```

## Streak

Example:

```text
7 Day Streak
```

## Next Lesson

Show the exact next lesson.

## Live Class

If a live class is active:

```text
LIVE NOW
Join Live Class
```

Otherwise:

```text
Next Live Class
```

## Announcements

Show latest important platform/course announcements.

---

# 15. Course Page

Because Luvia currently has one course, the course page should feel like the central learning environment.

Include:

* Course cover.
* Course title.
* Course description.
* Instructor.
* Difficulty.
* Duration.
* Lesson count.
* XP reward.
* Progress.
* Course outcomes.
* Requirements.
* Lesson list.

Example:

```text
Course

Advanced Interface Engineering

Learn advanced interface systems,
motion, spatial layout, typography,
and interaction principles.

Progress: 42%

[Continue Course]
```

---

# 16. Lesson Structure

Lessons are ordered.

Each lesson contains:

```text
id
course_id
title
video
order
type
XP
attachments
transcript
```

Current database contains:

```text
google_drive_video_id
```

Use this as the video source identifier.

The architecture should allow future video providers.

Recommended abstraction:

```text
VideoProvider
VideoId
VideoUrl
```

Do not hard-code the entire application around Google Drive forever.

---

# 17. Lesson Player

The lesson page should contain:

```text
Course navigation
↓
Video player
↓
Lesson title
↓
Lesson description
↓
Attachments
↓
Transcript
↓
Progress
↓
Complete lesson
↓
Next lesson
```

Primary action:

```text
Mark Lesson Complete
```

Once completed:

```text
Lesson Completed ✓
```

Then:

```text
Next Lesson →
```

---

# 18. Lesson Progress

Existing logical model:

```text
user_id
lesson_id
is_completed
completed_at
```

A student can only modify their own progress.

Instructors/TAs/admins can view progress according to permissions.

A lesson should not be counted as completed unless the completion operation succeeds.

---

# 19. Course Progress Calculation

Course progress should be calculated from lessons.

```text
completed lessons / total lessons
```

Example:

```text
12 / 20 = 60%
```

Use the same calculation consistently across:

* Dashboard
* Course page
* Lesson page
* Admin analytics
* Certificate eligibility

Do not store redundant progress percentages unless necessary for performance.

---

# 20. XP / Gamification

The existing frontend architecture already includes:

```text
points
totalXp
currentLevel
currentStreak
```

Keep this feature.

Recommended initial rule:

```text
Lesson completion → XP reward
```

Course-specific XP can be configured.

Example:

```text
Lesson XP = 150
```

Level calculation can initially follow the existing implementation:

```text
level = floor(XP / 500) + 1
```

This can later become a configurable progression system.

---

# 21. Prevent Duplicate XP

Completing the same lesson twice must not repeatedly grant XP.

The system must guarantee:

```text
lesson completion = idempotent
```

If the student already completed the lesson:

```text
Do not award XP again.
```

This should be enforced server-side where possible.

Do not rely only on frontend state.

---

# 22. Streak System

The current frontend model includes:

```text
currentStreak
```

Keep streak functionality in the product architecture.

However, the database currently does not contain enough information to implement a reliable historical streak.

For a production implementation, consider a future table:

```text
learning_activity
```

Example:

```text
id
user_id
activity_date
activity_type
created_at
```

For the current version, the streak can be implemented simply, but the architecture should not prevent future daily activity tracking.

---

# 23. Course Completion

Course completion should be calculated from lesson completion.

Default rule:

```text
All required lessons completed
```

Once the course is completed:

```text
Course Completed
```

Then certificate generation becomes available if the course is configured to issue certificates.

---

# 24. Certificates

The existing certificate model should remain supported.

Certificate data:

```text
id
student_id
student_full_name
description_en
description_ar
instructor_signature_text
qr_code_data
issued_at
```

Student should be able to access:

```text
My Certificates
```

Certificate should contain:

* Student name
* Course name
* Issue date
* Certificate identifier/hash
* Instructor signature
* QR code

---

# 25. Certificate Verification

Certificates should eventually have a public verification route:

```text
/verify/:certificateId
```

A visitor should be able to scan the QR code and see:

```text
Certificate Valid

Student:
[Name]

Course:
[Course]

Issued:
[Date]

Certificate ID:
[LUV-...]
```

Do not expose private student information beyond what is required for verification.

---

# 26. Live Classes

Keep the live class concept from the existing system.

Current model:

```text
live_lectures
```

The UI should support:

```text
Upcoming
Live Now
Ended
```

Current database only contains:

```text
id
is_active
created_at
```

For a stronger production implementation, extend the model in the future with:

```text
title
description
speaker
start_at
end_at
meeting_url
recording_url
course_id
created_by
```

The current UI should not pretend that the database already supports information that it does not store.

---

# 27. Announcements

Announcements are useful for:

* Course updates.
* New live classes.
* Important deadlines.
* Platform messages.
* Instructor announcements.

Student view:

```text
Announcements
```

Admin/organizer view:

```text
Create Announcement
Edit Announcement
Delete Announcement
```

Recommended fields:

```text
id
title
body
created_by
published_at
is_published
```

---

# 28. FAQ

Public FAQ should be available without login.

Questions should answer common issues such as:

* How do I enroll?
* When will I receive my account?
* How do I log in?
* How do I change my password?
* How does the course work?
* How do I track progress?
* How do certificates work?
* How do I contact support?

Admin should be able to manage FAQs.

---

# 29. Testimonials

Testimonials should be managed by admin.

Public landing page can display selected testimonials.

Recommended model:

```text
id
name
role
content
avatar
is_published
created_at
```

---

# 30. Reviews

The existing frontend architecture includes `Review`.

Because there is currently one course, reviews should belong to that course.

Students should eventually be able to submit a review after meeting a minimum course progress threshold.

Recommended future fields:

```text
id
course_id
student_id
rating
comment
created_at
is_published
```

---

# 31. Voucher System

The existing schema supports:

```text
vouchers
```

with:

```text
code
is_used
expiry_date
created_at
```

Keep the feature available for future enrollment/payment flows.

However, the current MVP does not need to expose a complicated marketplace checkout.

Voucher usage should be handled securely.

Do NOT expose all voucher codes publicly.

The original policy:

```text
Anyone can view vouchers
```

should be reconsidered for production.

Students should only be able to validate a voucher code, not enumerate all available voucher records.

---

# 32. Payment Architecture

The current requested product flow is manual enrollment.

Therefore:

```text
Public visitor
→ Enrollment Request
→ Organizer
→ Manual approval
→ Manual account creation
```

No mandatory automated payment system is required for the first version.

However, the architecture should not make future payment integration impossible.

Future flow could become:

```text
Enrollment
→ Payment
→ Automatic approval
→ Account creation
```

Do not implement unnecessary payment complexity in the first milestone unless specifically requested.

---

# 33. Admin Dashboard

Admin dashboard is one of the most important internal interfaces.

Main sections:

```text
Overview
Enrollment Requests
Students
Course
Lessons
Instructors
TAs
Live Classes
Announcements
FAQ
Testimonials
Certificates
Vouchers
Settings
```

---

# 34. Admin Overview

Display:

```text
Total Students
Pending Requests
Active Students
Course Completion Rate
Average Progress
Certificates Issued
Upcoming Live Classes
```

Because there is only one course, analytics should focus on that course.

---

# 35. Enrollment Requests Admin UI

Table:

```text
Name
Email
Phone
WhatsApp
Status
Created
Actions
```

Actions:

```text
View
Approve
Reject
Contact
Create Account
```

The account creation action should only be available after approval or explicit organizer confirmation.

---

# 36. Student Management

Admin can:

* View students.
* Search students.
* Filter by status.
* View student progress.
* View XP.
* View level.
* View enrollment.
* Ban/unban.
* Activate/deactivate.
* Change role when permitted.
* Create account.
* Reset account access.

Student profile should show:

```text
Name
Email
Phone
Status
Joined Date
XP
Level
Progress
Completed Lessons
Certificate
```

---

# 37. Instructor Management

The original RBAC contains instructors.

Keep this concept even though the current product has one course.

Admin can:

* Create instructor profile.
* Assign instructor to course.
* View instructor.
* Change instructor assignment.

---

# 38. TA Management

Keep TA support.

The original frontend architecture contains:

```text
TAAssignment
```

Current conceptual model:

```text
TA
→ Course
```

Admin can:

```text
Assign TA
Remove TA
View assignments
```

TAs should not automatically receive admin permissions.

---

# 39. Profile Model

Existing profile fields:

```text
id
email
name
role
points
is_active
is_banned
gender
created_at
updated_at
```

The profile should be connected to:

```text
auth.users
```

Authentication credentials must NOT be stored in `profiles`.

Supabase Auth owns passwords.

---

# 40. Required Profile Extensions

To support the new onboarding flow, add fields similar to:

```text
must_change_password boolean default false
phone text
whatsapp text
```

Potential future fields:

```text
avatar_url
last_login_at
last_activity_at
```

Do not store plaintext passwords.

---

# 41. Supabase Auth

Use:

```text
auth.users
```

for actual authentication.

`public.profiles` is the application profile layer.

Relationship:

```text
auth.users.id
        ↓
profiles.id
```

When an admin creates a student:

```text
Create auth.users
        ↓
Create profiles
        ↓
Set must_change_password = true
        ↓
Send credentials
```

---

# 42. Security Rules

Never trust the frontend for authorization.

The backend/database must enforce:

* Role permissions.
* Student ownership.
* Course access.
* Lesson progress ownership.
* Certificate ownership.
* Admin-only operations.

Supabase RLS must be designed carefully.

---

# 43. Important RLS Correction

The original schema contains policies such as:

```sql
create policy "Public read profiles"
on public.profiles
for select
using (true);
```

This is not appropriate for production because it exposes profile data publicly.

The new implementation should avoid publicly exposing:

```text
email
phone
whatsapp
```

or other personal data.

Public users should not be able to enumerate all students.

---

# 44. Course Access Security

Although course metadata can be public, private learning content should be protected where necessary.

Possible model:

```text
Public:
- Course title
- Description
- Thumbnail
- General information

Authenticated enrolled student:
- Full lesson access
- Video access
- Progress
- Attachments
- Transcripts
```

The application must verify enrollment before allowing access to protected lessons.

---

# 45. Current Single-Course UX

Do not force students to choose a course.

Instead:

```text
Dashboard
→ My Course
```

opens the only available course.

Avoid:

```text
Browse Courses
```

as a primary navigation item.

Future multi-course support can introduce it later.

---

# 46. Data Model

The current core schema contains:

```text
profiles
courses
lessons
user_courses
lesson_progress
vouchers
live_lectures
settings
certificates
```

Add:

```text
enrollment_requests
```

Recommended future entities:

```text
announcements
faqs
testimonials
reviews
ta_assignments
learning_activity
```

These already exist conceptually in the frontend architecture and should eventually become proper database entities rather than relying exclusively on Local Storage.

---

# 47. Local Storage Fallback

The existing `LocalDb` architecture provides a local fallback when Supabase is unavailable.

Keep this abstraction for development/demo resilience.

Existing local entities include:

```text
profiles
courses
vouchers
certificates
live_classes
ta_assignments
faqs
testimonials
announcements
settings
enrollments
lesson_completions
```

However:

## Production rule

Supabase is the source of truth.

Local Storage must NOT be treated as a security boundary.

Never rely on Local Storage for:

* Authentication.
* Authorization.
* Password storage.
* Secure enrollment.
* Certificate authenticity.
* Payment status.

---

# 48. Unified Data Service

Keep a service abstraction similar to:

```text
dbService
```

The UI should not directly scatter Supabase queries everywhere.

Recommended layers:

```text
UI
 ↓
Application Services
 ↓
dbService / repositories
 ↓
Supabase
```

For local development:

```text
UI
 ↓
Application Services
 ↓
dbService
 ↓
Supabase OR LocalDb
```

---

# 49. Service Modules

Prefer separating the large service into logical modules over time:

```text
authService
courseService
lessonService
enrollmentService
studentService
progressService
certificateService
liveClassService
announcementService
settingsService
voucherService
```

A unified facade can still expose:

```text
dbService
```

if the application prefers it.

---

# 50. Landing Page

The landing page should be premium and focused.

Recommended sections:

## Hero

Clear statement of the value of the course.

Primary CTA:

```text
Enroll Now
```

Secondary CTA:

```text
Learn More
```

## Course Overview

Explain:

* What the student will learn.
* Who it is for.
* Course structure.
* Expected outcome.

## Curriculum Preview

Show selected lessons.

Do not expose protected lesson content.

## Instructor

Show instructor information.

## Learning Experience

Explain:

```text
Watch
Practice
Progress
Complete
Get Certified
```

## Testimonials

Show selected student testimonials.

## FAQ

Common questions.

## Final CTA

```text
Ready to start?

[Request Enrollment]
```

---

# 51. Login Page

The login page is intentionally simple.

Fields:

```text
Email
Password
```

Actions:

```text
Login
Forgot Password?
```

Do not include:

```text
Create Account
```

for students.

Instead:

```text
Don't have access yet?
Request Enrollment
```

---

# 52. Forgot Password

Implement a secure password recovery mechanism using Supabase Auth.

Do not attempt to recover or display the old password.

Flow:

```text
Forgot Password
→ Email
→ Secure reset link
→ New password
→ Login
```

---

# 53. Organizer Credential Delivery

The platform should support the organizer copying or sending a credential message.

Example template:

```text
Welcome to Luvia.

Your account has been created.

Email:
{{email}}

Temporary Password:
{{temporary_password}}

Login:
{{login_url}}

For security, you will be required to change your password
when you log in for the first time.
```

The system can provide:

```text
Copy Message
Send via WhatsApp
Send via Email
```

depending on integrations.

Do not automatically expose passwords inside logs.

---

# 54. WhatsApp Integration

The first implementation may simply provide a pre-filled WhatsApp message.

The organizer can click:

```text
Send via WhatsApp
```

and open a WhatsApp conversation with the student's number.

Future version may use the WhatsApp Business API.

Do not make WhatsApp API integration a blocker for MVP.

---

# 55. Email Integration

The system should eventually support transactional email for:

* Account creation.
* Password reset.
* Enrollment status.
* Important announcements.
* Certificate issuance.

The initial MVP can provide copyable credentials if email automation is not yet configured.

---

# 56. Course Content Management

Admin/instructor should be able to:

```text
Create Lesson
Edit Lesson
Delete Lesson
Reorder Lessons
Publish/Unpublish
```

Lesson ordering must be explicit:

```text
order_index
```

The student experience should follow this order.

---

# 57. Lesson Locking

Future lesson locking can support:

```text
Lesson 1
↓
Lesson 2 unlocked after Lesson 1
↓
Lesson 3 unlocked after Lesson 2
```

For the current MVP, lessons may be accessible based on enrollment, but the architecture should support sequential unlocking.

Recommended future fields:

```text
is_locked
unlock_rule
required_lesson_id
```

---

# 58. Course Completion Certificate Rule

Default:

```text
100% required lessons completed
```

Then:

```text
Issue Certificate
```

Certificate creation must be server-authorized.

Students should not be able to call certificate creation arbitrarily.

---

# 59. Settings

The platform settings model should support:

```text
platformName
platformDescription
whatsappNumber
heroTitle
heroSubtitle
bannerMessage
```

The current LocalDb implementation already contains these concepts.

Admin can modify global settings.

Public pages read published settings.

---

# 60. Internationalization

The original database supports:

```text
title_en
title_ar
description_en
description_ar
```

Keep bilingual data compatibility.

The interface should be designed to support:

```text
Arabic
English
```

without hardcoding layout assumptions that break RTL.

Arabic mode must support:

```text
dir="rtl"
```

English mode:

```text
dir="ltr"
```

The design system must work correctly in both directions.

---

# 61. Responsive Design

The platform must work on:

```text
Mobile
Tablet
Desktop
```

Mobile is particularly important because students may receive credentials and access lessons through WhatsApp on their phones.

The student dashboard must be fully usable on mobile.

---

# 62. Visual Design Direction

Luvia should feel:

* Premium.
* Minimal.
* Modern.
* Focused.
* Educational.
* Technical.
* High quality.
* Calm.
* Not visually overloaded.

Avoid generic LMS aesthetics.

Avoid excessive cards everywhere.

Avoid unnecessary gradients.

Avoid excessive animations.

Use hierarchy and whitespace.

---

# 63. Design Principles

Primary principles:

```text
Clarity over decoration
Progress over complexity
Content over chrome
Consistency over novelty
Mobile-first usability
Accessibility
Fast interaction
```

The interface should make learning the dominant activity.

---

# 64. Dashboard Visual Hierarchy

The dashboard should visually prioritize:

```text
1. Continue Learning
2. Course Progress
3. Next Lesson
4. Live Class
5. XP / Streak
6. Announcements
```

Do not make secondary administrative information dominate the student's screen.

---

# 65. Loading States

Every asynchronous operation should have proper states:

```text
Loading
Success
Error
Empty
```

Examples:

```text
Loading course...
Loading lessons...
Submitting enrollment request...
Creating account...
Updating password...
Saving progress...
```

Never leave the user wondering whether an action succeeded.

---

# 66. Error Handling

Errors should be human-readable.

Bad:

```text
PostgrestException 23505
```

Good:

```text
An account with this email already exists.
```

For network failures:

```text
We couldn't connect right now.
Please try again.
```

Do not expose database internals to users.

---

# 67. Empty States

Example:

## No enrollment requests

```text
No enrollment requests yet.
```

## No announcements

```text
No new announcements.
```

## No certificates

```text
Your certificate will appear here after you complete the course.
```

---

# 68. Accessibility

The implementation must support:

* Keyboard navigation.
* Visible focus states.
* Proper labels.
* Semantic HTML.
* Screen reader-friendly buttons.
* Sufficient contrast.
* Reduced motion preference.
* Accessible video controls.

Do not make functionality dependent exclusively on hover.

---

# 69. Performance

Optimize for:

* Fast initial load.
* Lazy loading of protected lesson content.
* Efficient Supabase queries.
* Indexed foreign keys.
* Minimal unnecessary requests.
* Optimized images.
* Cached course metadata where appropriate.

Do not load every admin dataset on every page.

---

# 70. Security Requirements

Critical requirements:

1. Never store plaintext passwords.
2. Never expose Supabase service-role keys to the frontend.
3. Never trust client-side role checks alone.
4. Use RLS.
5. Protect private student data.
6. Validate enrollment ownership.
7. Prevent duplicate lesson XP.
8. Protect certificate creation.
9. Protect admin actions.
10. Validate all input.
11. Sanitize user-generated content where appropriate.
12. Avoid exposing internal database errors.
13. Do not expose voucher inventory publicly.
14. Do not expose student contact information publicly.

---

# 71. Supabase Environment Variables

Frontend should use only public-safe variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

in frontend code.

Admin-level account creation may require a trusted backend/server-side function.

---

# 72. Secure Admin Account Creation

Do not implement:

```text
frontend → Supabase admin.createUser()
```

with a service role key.

Instead use a secure server-side mechanism such as:

```text
Supabase Edge Function
```

or a trusted backend.

Flow:

```text
Admin Dashboard
       ↓
Authenticated Admin Request
       ↓
Secure Server Function
       ↓
Validate Admin Permission
       ↓
Create auth.users
       ↓
Create/update profile
       ↓
Return safe account information
```

---

# 73. Enrollment Request Security

Public enrollment submission should be protected against spam.

Consider:

* Rate limiting.
* CAPTCHA/Turnstile.
* Input validation.
* Email validation.
* Phone normalization.
* Duplicate pending request detection.

Do not allow arbitrary public writes to sensitive tables.

---

# 74. Recommended Database Changes

The original schema is a strong foundation, but the current product requires additional entities/fields.

## Add enrollment requests

```sql
create table public.enrollment_requests (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  notes text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);
```

## Extend profiles

Conceptually:

```sql
alter table public.profiles
add column phone text,
add column whatsapp text,
add column must_change_password boolean not null default false;
```

The exact migration should be implemented safely according to the existing production database state.

---

# 75. Single Course Configuration

Even though the database retains:

```text
courses
```

the current application should operate with:

```text
ACTIVE COURSE = one course
```

Do not hardcode an arbitrary UUID throughout the application.

Instead:

```text
settings
→ active_course_id
```

or retrieve the published primary course.

This allows future expansion without rewriting the application.

---

# 76. Future Multi-Course Compatibility

Do not build a system that assumes there can never be multiple courses.

Keep:

```text
courses
user_courses
lessons
lesson_progress
```

relational.

Current UI:

```text
My Course
```

Future UI:

```text
My Courses
```

This transition should require minimal architectural changes.

---

# 77. Admin Course UI

Although there is only one current course, the admin should still see:

```text
Course Management
```

with one course.

The UI may show:

```text
Luvia Main Course
Published
```

and allow:

```text
Edit
Manage Lessons
View Students
```

Do not build an unnecessarily complex course marketplace dashboard.

---

# 78. Student Enrollment Record

Once an account is created and approved:

```text
user_courses
```

must contain:

```text
student_id
course_id
```

This is the authoritative enrollment relationship.

The student should not receive course access merely because their profile exists.

---

# 79. Enrollment State

Recommended flow:

```text
Enrollment Request
       ↓
Pending
       ↓
Approved
       ↓
Account Created
       ↓
Enrolled
       ↓
Active Learning
       ↓
Completed
```

The request record should preserve its history.

Do not delete enrollment requests after creating an account.

---

# 80. Auditability

For important administrative operations, maintain audit information.

Future table:

```text
audit_logs
```

Recommended:

```text
id
actor_id
action
entity_type
entity_id
metadata
created_at
```

Examples:

```text
ADMIN_CREATED_STUDENT
ADMIN_APPROVED_ENROLLMENT
ADMIN_BANNED_USER
ADMIN_ISSUED_CERTIFICATE
ADMIN_CREATED_COURSE
```

This is strongly recommended for production.

---

# 81. Notifications

The first version can rely on:

```text
WhatsApp
Email
```

Future in-app notifications can use:

```text
notifications
```

Potential events:

```text
Enrollment Approved
Account Created
New Announcement
Live Class Starting
Certificate Issued
```

---

# 82. Recommended Frontend Structure

Suggested structure:

```text
src/
├── components/
├── pages/
├── layouts/
├── features/
│   ├── auth/
│   ├── enrollment/
│   ├── course/
│   ├── lessons/
│   ├── progress/
│   ├── certificates/
│   ├── live-classes/
│   ├── announcements/
│   └── admin/
├── services/
│   ├── authService
│   ├── courseService
│   ├── enrollmentService
│   ├── progressService
│   └── certificateService
├── lib/
│   └── supabase
├── types/
├── hooks/
└── utils/
```

Do not put all business logic directly into page components.

---

# 83. Type System

Types should represent the real domain.

Core types:

```text
Profile
Course
Lesson
EnrollmentRequest
Enrollment
LessonProgress
Voucher
LiveClass
Certificate
Announcement
FAQ
Testimonial
Review
TAAssignment
PlatformSettings
```

Keep database types and UI types distinguishable if their shapes differ.

---

# 84. Do Not Fake Database Fields

The original frontend mapping contains values such as:

```text
duration: '12 hours'
rating: 4.9
xpReward: 300
category: 'Interface Engineering'
```

These should not remain hardcoded in production if they are meant to be editable product data.

Move important product information into the database.

However, avoid expanding the database unnecessarily during the first milestone.

Prioritize fields that are actually displayed or administered.

---

# 85. Video Security

If course videos are private, avoid simply exposing permanent public video URLs.

Depending on provider, use:

* Signed URLs.
* Protected storage.
* Provider-specific access controls.

The lesson page should verify:

```text
authenticated user
+
enrolled in course
```

before retrieving protected video resources.

---

# 86. Progress Synchronization

When the student completes a lesson:

```text
Frontend
→ progressService.completeLesson()
→ server/database
→ confirm success
→ update local UI
→ award XP once
```

Do not optimistically award permanent XP before the server confirms the operation.

---

# 87. Offline / Local Fallback

The current `LocalDb` can be useful during development.

When Supabase is unavailable:

```text
LocalDb fallback
```

may allow demos.

However, the UI should clearly distinguish development fallback behavior from production authentication.

Never let a production student bypass authentication because Supabase is temporarily unavailable.

---

# 88. Testing Requirements

Test the following flows.

## Public

* Landing page loads.
* Course information loads.
* Enrollment request succeeds.
* Duplicate request is handled.
* Invalid email rejected.
* Empty required fields rejected.

## Authentication

* Valid student login.
* Invalid login.
* First login forces password change.
* Password change succeeds.
* Student cannot bypass password change.
* Forgot password works.
* Logout works.

## Student

* Dashboard loads.
* Course loads.
* Lessons load.
* Lesson completion works.
* Duplicate completion does not duplicate XP.
* Progress updates.
* Certificate appears after completion.

## Admin

* Admin login.
* Enrollment request list.
* Approve request.
* Create account.
* Student is enrolled.
* Credential message generated.
* Student progress visible.
* Course management.
* Lesson management.

## RBAC

Test:

```text
Admin
Instructor
TA
Student
Unauthenticated Visitor
```

Each role must only see and execute authorized operations.

---

# 89. Milestone Strategy

Implementation must be performed in milestones.

Do not attempt to build everything at once.

---

# MILESTONE 0 — Project Foundation

## Objective

Establish the application architecture and design system.

### Tasks

* Set up project.
* Configure TypeScript.
* Configure routing.
* Configure Supabase client.
* Configure environment variables.
* Establish design tokens.
* Establish typography.
* Establish spacing.
* Establish responsive breakpoints.
* Establish RTL/LTR foundation.
* Create shared UI components.
* Create loading/error/empty states.
* Establish application layout.

### Deliverable

A clean application shell with:

```text
Public Layout
Auth Layout
Student Layout
Admin Layout
```

---

# MILESTONE 1 — Public Landing Experience

## Objective

Build the public-facing Luvia experience.

### Pages

```text
/
 /course
 /faq
 /login
 /enroll
```

### Features

* Hero.
* Course introduction.
* Curriculum preview.
* Instructor.
* Testimonials.
* FAQ.
* CTA.
* Responsive design.
* Arabic/English support.
* Login CTA.
* Enrollment CTA.

### Important

No authentication required.

---

# MILESTONE 2 — Enrollment Request System

## Objective

Allow visitors to request access without creating an account.

### Backend

Create:

```text
enrollment_requests
```

### Frontend

Build:

```text
Enrollment Form
Success State
Validation
Error Handling
```

### Fields

```text
Full Name
Email
Phone
WhatsApp
Notes
```

### Security

* Public insert only.
* No public read of all requests.
* Validation.
* Spam protection where possible.

### Deliverable

Visitor can successfully submit an enrollment request.

---

# MILESTONE 3 — Admin Authentication & Dashboard

## Objective

Create the secure internal admin environment.

### Features

* Admin login.
* Admin route protection.
* Admin dashboard.
* Role verification.
* Student overview.
* Enrollment request overview.

### Deliverable

Admin can securely enter the platform and manage enrollment requests.

---

# MILESTONE 4 — Enrollment Review & Student Account Creation

## Objective

Connect enrollment requests to actual student accounts.

### Features

* View request.
* Approve/reject.
* Create student account.
* Assign course.
* Generate temporary credentials.
* Set:

```text
must_change_password = true
```

### Secure backend

Use a server-side trusted function for Auth account creation.

### Deliverable

Admin can transform:

```text
Enrollment Request
```

into:

```text
Student Account + Course Enrollment
```

---

# MILESTONE 5 — Credential Delivery

## Objective

Make it easy for organizers to send student credentials.

### Features

```text
Copy Credentials
Copy WhatsApp Message
Open WhatsApp
Copy Email Message
```

Message includes:

```text
Name
Login Email
Temporary Password
Login URL
Password-change instruction
```

### Security

Do not store sent plaintext credentials in logs.

---

# MILESTONE 6 — First Login & Mandatory Password Change

## Objective

Implement the critical first-login experience.

### Flow

```text
Login
 ↓
Check must_change_password
 ↓
If true
 ↓
Password Change Page
 ↓
Successful Change
 ↓
Update must_change_password = false
 ↓
Dashboard
```

### Requirements

* Cannot bypass.
* Cannot access student dashboard before change.
* Cannot navigate around the requirement.
* Works on mobile.
* Clear messaging.
* Strong validation.

---

# MILESTONE 7 — Student Dashboard

## Objective

Build the main authenticated student experience.

### Features

* Welcome section.
* Course card.
* Progress.
* Continue learning.
* Next lesson.
* XP.
* Level.
* Streak.
* Live class.
* Announcements.

### Deliverable

A student can log in and immediately understand what to do next.

---

# MILESTONE 8 — Course & Lesson System

## Objective

Build the complete learning experience.

### Features

* Course page.
* Lesson list.
* Lesson player.
* Video.
* Attachments.
* Transcript.
* Lesson navigation.
* Complete lesson.
* Next lesson.

### Security

Verify enrollment before protected content access.

---

# MILESTONE 9 — Progress & Gamification

## Objective

Make learning progress persistent and motivating.

### Features

* Lesson completion.
* Course percentage.
* XP.
* Level.
* Streak foundation.
* Progress synchronization.
* Duplicate completion protection.

### Deliverable

Student can clearly see learning progression.

---

# MILESTONE 10 — Admin Course & Lesson Management

## Objective

Allow organizers/instructors to manage the actual course.

### Features

* Edit course.
* Add lesson.
* Edit lesson.
* Delete lesson.
* Reorder lessons.
* Publish/unpublish.
* Assign instructor.

### Deliverable

Course content no longer needs to be hardcoded.

---

# MILESTONE 11 — Live Classes

## Objective

Add real-time educational events.

### Features

* Upcoming class.
* Live now.
* Speaker.
* Date/time.
* Meeting link.
* Admin creation.
* Admin deletion.
* Student access.

### Future

* Recording.
* Attendance.
* Calendar integration.

---

# MILESTONE 12 — Announcements / FAQ / Testimonials

## Objective

Complete the communication and trust layer.

### Features

Admin:

```text
Create
Edit
Delete
Publish
```

Student/public:

```text
Read
```

---

# MILESTONE 13 — Certificates

## Objective

Reward course completion.

### Features

* Completion detection.
* Certificate generation.
* Unique certificate ID.
* QR code.
* Certificate page.
* Public verification.

### Security

Certificate generation must be server-authorized.

---

# MILESTONE 14 — Advanced Admin Analytics

## Objective

Give organizers visibility into the course.

### Metrics

```text
Total Students
Active Students
Pending Requests
Average Progress
Completion Rate
Average XP
Lessons Completed
Certificates Issued
```

### Student analytics

Admin can open a student and see:

```text
Progress
Lessons
XP
Level
Activity
Certificate
```

---

# MILESTONE 15 — Security Hardening

## Objective

Prepare Luvia for real production usage.

### Tasks

* Review all RLS policies.
* Remove public profile exposure.
* Secure enrollment requests.
* Secure admin account creation.
* Audit authentication.
* Audit course access.
* Audit certificate issuance.
* Audit voucher access.
* Add rate limiting.
* Add spam protection.
* Validate all inputs.
* Remove service-role keys from frontend.
* Review XSS risks.
* Review file/video access.

---

# MILESTONE 16 — Production QA

## Objective

Verify the entire product.

### Test complete journey

```text
Visitor
→ Enrollment
→ Admin
→ Approval
→ Account Creation
→ WhatsApp/Email
→ Login
→ Mandatory Password Change
→ Dashboard
→ Course
→ Lesson
→ Progress
→ XP
→ Completion
→ Certificate
```

Test on:

```text
Mobile
Tablet
Desktop
```

Test:

```text
Arabic
English
RTL
LTR
```

---

# 90. Definition of Done

Luvia is considered ready for the first production release when:

* A visitor can view the course without logging in.
* A visitor can submit an enrollment request.
* An admin can review the request.
* An admin can create a student account.
* The student receives credentials.
* The student can log in.
* The student is forced to change the temporary password.
* The student can access the course after changing the password.
* Student access is limited to enrolled content.
* Lessons work.
* Lesson completion works.
* XP works.
* Progress works.
* Admin can see student progress.
* Course/lesson management works.
* RLS protects private data.
* Passwords are never stored manually.
* Certificate generation works.
* Public certificate verification works.
* The interface is responsive.
* Arabic/English direction works.
* Error states work.
* Loading states work.
* Production environment variables are secure.

---

# 91. Important Product Decisions

These decisions are intentional and should not be changed casually.

## Decision 1

There is currently one course.

## Decision 2

There is no public student signup.

## Decision 3

The public user submits an enrollment request.

## Decision 4

An organizer manually creates the student's account.

## Decision 5

The organizer can send credentials through WhatsApp or email.

## Decision 6

The initial password is temporary.

Current requested temporary password:

```text
12345678
```

The user must change it immediately.

## Decision 7

The password change is mandatory before accessing the student dashboard.

## Decision 8

Supabase Auth owns authentication credentials.

## Decision 9

Supabase is the production source of truth.

## Decision 10

LocalDb is a development/demo fallback, not a security mechanism.

## Decision 11

The architecture remains relational and multi-course compatible.

## Decision 12

The current UI should not look like a large LMS marketplace.

---

# 92. Things Claude Must NOT Do

Do not:

* Add public student signup.
* Create fake authentication.
* Store passwords in `profiles`.
* Expose all student profiles publicly.
* Expose all voucher codes publicly.
* Trust frontend-only authorization.
* Allow students to access another student's progress.
* Allow duplicate XP from repeated lesson completion.
* Generate certificates from the client without authorization.
* Hardcode the only course UUID everywhere.
* Build a marketplace UI.
* Add unnecessary payment complexity to MVP.
* Overload the dashboard with unnecessary widgets.
* Make the interface visually generic.
* Make the public site require authentication.
* Force the visitor to create an account before requesting enrollment.
* Assume Local Storage is secure.
* Expose Supabase service-role credentials in frontend code.

---

# 93. Recommended Priority Order

If implementation time is limited, prioritize in this order:

```text
1. Foundation
2. Public Landing Page
3. Enrollment Request
4. Admin Authentication
5. Enrollment Management
6. Student Account Creation
7. Mandatory Password Change
8. Student Dashboard
9. Course
10. Lessons
11. Progress
12. XP
13. Admin Course Management
14. Certificates
15. Live Classes
16. Announcements
17. FAQ
18. Testimonials
19. Analytics
20. Security Hardening
21. Production QA
```

---

# 94. Final Architecture

The desired architecture is:

```text
                         ┌──────────────────────┐
                         │      PUBLIC USER     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     LANDING PAGE     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ ENROLLMENT REQUEST   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       ADMIN          │
                         │  Review Application  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ CREATE STUDENT AUTH  │
                         │ + PROFILE + ENROLL   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ WHATSAPP / EMAIL     │
                         │ CREDENTIAL DELIVERY  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       LOGIN          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ FORCE PASSWORD       │
                         │ CHANGE               │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  STUDENT DASHBOARD   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     SINGLE COURSE    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       LESSONS        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ PROGRESS + XP +      │
                         │ STREAK               │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ COURSE COMPLETION    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     CERTIFICATE      │
                         └──────────────────────┘
```

---

# 95. Claude Implementation Instructions

When implementing this specification:

1. First inspect the existing project structure.
2. Do not destroy working functionality without understanding it.
3. Reuse existing types/components where appropriate.
4. Refactor duplicated business logic instead of duplicating it.
5. Keep Supabase access centralized.
6. Preserve the existing relational concepts.
7. Implement the single-course UX.
8. Implement enrollment requests before student signup.
9. Implement secure organizer-created accounts.
10. Implement mandatory first-login password change.
11. Protect all authenticated routes.
12. Implement RLS before considering the system production-ready.
13. Keep public and private data clearly separated.
14. Make all critical states explicit.
15. Avoid fake placeholder functionality where a real implementation is expected.
16. Avoid unnecessary dependencies.
17. Keep the application responsive.
18. Support Arabic and English.
19. Test each milestone before moving to the next.
20. Do not consider a UI feature complete until its data flow and authorization are also complete.

---

# 96. Final Product Principle

Luvia should feel simple to the student:

```text
Request access.
Receive your account.
Log in.
Change your password.
Learn.
Track your progress.
Finish the course.
Get certified.
```

The complexity should exist behind the scenes for organizers and administrators, not in the student's learning experience.

The student's primary question should always be answered immediately:

> "What should I learn next?"

And the primary CTA after login should always guide them toward:

```text
Continue Learning
```

---

# END OF LUVIA SPECIFICATION

```
```
