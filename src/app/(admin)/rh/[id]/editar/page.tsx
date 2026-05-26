import type { Metadata } from 'next';
import { StaffMemberFormPage } from '@/features/staff-members/staff-member-form';

export const metadata: Metadata = { title: 'Editar servidor · RH Magistério' };

export default async function EditarStaffMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaffMemberFormPage memberId={id} />;
}
