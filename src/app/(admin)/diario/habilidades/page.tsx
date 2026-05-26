import type { Metadata } from 'next';
import { LearningExpectationsPage } from '@/features/learning-expectations/learning-expectations-page';

export const metadata: Metadata = { title: 'Habilidades BNCC · Diário Online' };

export default function HabilidadesBNCCPage() {
  return <LearningExpectationsPage />;
}
