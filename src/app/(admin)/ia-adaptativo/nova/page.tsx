import type { Metadata } from 'next';
import { LearningPathFormPage } from '@/features/learning-paths/learning-path-form';

export const metadata: Metadata = { title: 'Nova trilha · Ensino Adaptativo IA' };

export default function NovaTrilhaPage() {
  return <LearningPathFormPage />;
}
