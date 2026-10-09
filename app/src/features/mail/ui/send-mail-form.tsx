'use client';

import { useState } from 'react';
import { Button, TextField } from '@felipechandiadev/ui';

export function SendMailForm({ accountEmail }: { accountEmail: string | null }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <form
      action="/api/integrations/microsoft/send"
      method="post"
      style={{ display: 'grid', gap: '0.75rem' }}
    >
      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.85 }}>
        Desde {accountEmail || 'tu cuenta Outlook'}
      </p>
      <TextField
        label="Para"
        name="to"
        type="email"
        required
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <TextField
        label="Asunto"
        name="subject"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.9rem' }}>Mensaje</span>
        <textarea
          name="body"
          required
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: '0.5rem',
            border:
              '1px solid color-mix(in srgb, currentColor 25%, transparent)',
            background: 'transparent',
            font: 'inherit',
          }}
        />
      </label>
      <Button type="submit" variant="primary">
        Enviar
      </Button>
    </form>
  );
}
