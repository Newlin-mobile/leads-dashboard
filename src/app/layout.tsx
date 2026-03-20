import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Leads Dashboard',
    template: '%s | Leads Dashboard',
  },
  description: 'Track en manage je sales leads pipeline.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="h-full">
      <head>
        {/* Fluister feedback widget - TODO: add project key */}
        {/* <script src="https://fluister.dev/widget.js" data-project="YOUR_PROJECT_KEY" data-color="#9333ea" data-lang="nl" defer></script> */}
      </head>
      <body className="h-full antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
