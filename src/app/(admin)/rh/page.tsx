import type { Metadata } from 'next';
import { StaffMembersPage } from '@/features/staff-members/staff-members-page';

export const metadata: Metadata = { title: 'Servidores · RH Magistério' };

export default function StaffMembersRoute() {
  return <StaffMembersPage />;
}
