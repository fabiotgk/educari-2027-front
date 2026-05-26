import type { Metadata } from 'next';
import { FacialEnrollmentsPage } from '@/features/facial-enrollments/facial-enrollments-page';

export const metadata: Metadata = {
  title: 'Cadastros Faciais · Reconhecimento Facial',
};

/** M28 / Reconhecimento Facial — Lista de cadastros faciais. */
export default function FacialPage() {
  return <FacialEnrollmentsPage />;
}
