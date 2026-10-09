import type { Metadata, Viewport } from 'next';
import { AppSessionProvider } from '@/providers/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DSP-27',
  description: 'Dirección de Seguridad Pública — Plan 2027',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b3d5c',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-density="compact">
      <body>
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
