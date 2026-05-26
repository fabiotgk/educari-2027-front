import { StaffMemberDetailPage } from '@/features/staff-members/staff-member-detail';

export default async function StaffMemberDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaffMemberDetailPage id={id} />;
}
