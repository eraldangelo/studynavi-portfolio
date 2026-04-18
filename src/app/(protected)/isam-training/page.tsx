export const metadata = {
  title: 'ISAM Training - StudyNavi',
};

import ISAMTrainingPage from '@/components/isam-training/ISAMTrainingPage';
import { AppHeader } from '@/components/common/layout/app-header';

export default function Page() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <AppHeader />
      <main className="container mx-auto px-6">
        <ISAMTrainingPage />
      </main>
    </div>
  );
}
