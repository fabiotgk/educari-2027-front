import type { Metadata } from 'next';
import { QuestionBankFormPage } from '@/features/question-banks/question-bank-form';

export const metadata: Metadata = { title: 'Novo banco de questões' };

export default function NovoBancoPage() {
  return <QuestionBankFormPage />;
}
