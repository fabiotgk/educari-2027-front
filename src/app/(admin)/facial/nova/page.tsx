import type { Metadata } from 'next';
import { FacialEnrollmentFormPage } from '@/features/facial-enrollments/facial-enrollment-form';

export const metadata: Metadata = {
  title: 'Novo cadastro facial · Reconhecimento Facial',
};

export default function NovaFacialPage() {
  return <FacialEnrollmentFormPage />;
}
