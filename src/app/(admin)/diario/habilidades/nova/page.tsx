import type { Metadata } from 'next';
import { LearningExpectationFormPage } from '@/features/learning-expectations/learning-expectation-form';

export const metadata: Metadata = { title: 'Nova habilidade BNCC · Diário Online' };

export default function NovaHabilidadePage() {
  return <LearningExpectationFormPage />;
}
