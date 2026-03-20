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
        <script src="https://fluister.dev/widget.js" data-project="d0315c8815c996f2fbe95a161746fd42b074fb4ea58594dd" data-color="#667eea" defer></script>
      </head>
      <body className="h-full antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
