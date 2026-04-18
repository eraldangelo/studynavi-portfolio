'use client';

import React from 'react';
import { Card } from '@/components/ui/layout/card';

function FeatureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h4 className="font-semibold">{title}</h4>
      <div className="text-sm text-muted-foreground mt-2">{children}</div>
    </Card>
  );
}

export default function ISAMContent() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <FeatureCard title="Overview">Learn about ISAM and its objectives.</FeatureCard>
      <FeatureCard title="Modules">Short interactive modules with quizzes.</FeatureCard>
      <FeatureCard title="Progress Tracking">Track your training completion and scores.</FeatureCard>
      <FeatureCard title="Resources">Downloadable guides and reference documents.</FeatureCard>
    </div>
  );
}
