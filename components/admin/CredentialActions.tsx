'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  buildCredentialMessage,
  buildMailtoUrl,
  buildWhatsAppUrl,
} from '@/lib/auth/credentials';

interface Props {
  email: string;
  fullName: string;
  phone: string | null;
  initialPassword?: string;
}

export function CredentialActions({ email, fullName, phone, initialPassword }: Props) {
  const { show } = useToast();
  const [password, setPassword] = useState(initialPassword ?? '');
  const message = password
    ? buildCredentialMessage({ fullName, email, tempPassword: password })
    : '';

  const copy = async () => {
    if (!message) {
      show('Enter a temporary password first.', 'danger');
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      show('Credentials copied.', 'success');
    } catch {
      show('Could not copy. Select and copy manually.', 'danger');
    }
  };

  const openWhatsApp = () => {
    if (!phone) {
      show('No WhatsApp number on this request.', 'danger');
      return;
    }
    if (!message) {
      show('Enter a temporary password first.', 'danger');
      return;
    }
    window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener');
  };

  const openEmail = () => {
    if (!message) {
      show('Enter a temporary password first.', 'danger');
      return;
    }
    window.location.href = buildMailtoUrl(email, 'Welcome to Luvia', message);
  };

  return (
    <Card className="mt-2">
      <CardTitle className="text-base">Send credentials</CardTitle>
      <CardDescription>
        The temporary password is set to <code className="rounded bg-white/10 px-1">12345678</code>{' '}
        on first create. Override it here if you generated a custom one.
      </CardDescription>
      <div className="mt-3 space-y-2">
        <Input
          label="Temporary password"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="12345678"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={copy} disabled={!password}>
            Copy message
          </Button>
          <Button size="sm" variant="secondary" onClick={openWhatsApp} disabled={!phone || !password}>
            Open WhatsApp
          </Button>
          <Button size="sm" variant="secondary" onClick={openEmail} disabled={!password}>
            Open email
          </Button>
        </div>
      </div>
    </Card>
  );
}