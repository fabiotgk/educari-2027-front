import type { Metadata } from 'next';
import { LearningPathsPage } from '@/features/learning-paths/learning-paths-page';

export const metadata: Metadata = { title: 'Trilhas · Ensino Adaptativo IA' };

/**
 * M32 / Ensino Adaptativo IA — Trilhas de aprendizagem.
 * Tela de listagem do padrão CRUD.
 */
export default function IaAdaptativoPage() {
  return <LearningPathsPage />;
}
