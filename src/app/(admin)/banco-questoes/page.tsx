import type { Metadata } from 'next';
import { QuestionBanksPage } from '@/features/question-banks/question-banks-page';

export const metadata: Metadata = { title: 'Banco de Questões' };

export default function BancoQuestoesPage() {
  return <QuestionBanksPage />;
}
