import { PortalAttendancePage } from '@/features/portal/portal-attendance-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalAttendancePage studentId={id} />;
}
