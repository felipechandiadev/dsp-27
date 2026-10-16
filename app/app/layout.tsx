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

const SIDEBAR_COLLAPSE_BOOTSTRAP = `
try {
  if (localStorage.getItem('dsp-sidebar-collapsed') === '1') {
    document.documentElement.dataset.sidebarCollapsed = '1';
  }
} catch (_) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-density="compact" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: SIDEBAR_COLLAPSE_BOOTSTRAP }}
        />
      </head>
      <body>
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
