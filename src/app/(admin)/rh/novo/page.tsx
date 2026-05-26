import type { Metadata } from 'next';
import { StaffMemberFormPage } from '@/features/staff-members/staff-member-form';

export const metadata: Metadata = { title: 'Novo servidor · RH Magistério' };

export default function NovoStaffMemberPage() {
  return <StaffMemberFormPage />;
}
