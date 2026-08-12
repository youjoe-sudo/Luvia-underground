'use client';

import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { UltraSecurePlayer } from '@/components/player/UltraSecurePlayer';

interface Props {
  lessonId: string;
  videoId: string;
  durationSeconds: number;
  studentName: string;
  studentPhone: string;
}

export function LessonPlayer({ lessonId, videoId, durationSeconds, studentName, studentPhone }: Props) {
  const { signOut } = useAuth();
  const { show } = useToast();

  return (
    <UltraSecurePlayer
      videoId={videoId}
      lessonId={lessonId}
      studentName={studentName}
      studentPhone={studentPhone}
      durationSeconds={durationSeconds}
      onViolation={() => {
        show('Anti-piracy violation detected. You are being signed out.', 'danger');
        void signOut();
      }}
      onComplete={async () => {
        await fetch(`/api/lessons/${lessonId}/complete`, { method: 'POST' });
        show('Lesson complete', 'success');
      }}
    />
  );
}