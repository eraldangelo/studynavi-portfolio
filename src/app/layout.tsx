import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/overlay/toaster';
import { GlobalRuntimeEffects } from '@/components/common/layout/global-runtime-effects';

export const metadata: Metadata = {
  title: 'StudyNavi',
  description: 'StudyNavi is a tool to help consultants provide the most accurate study plans and computations for our clients.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70" type="image/png" />
      </head>
      <body className="bg-background">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <GlobalRuntimeEffects />
      </body>
    </html>
  );
}
