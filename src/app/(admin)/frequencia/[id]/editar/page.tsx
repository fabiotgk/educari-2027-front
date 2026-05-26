import { AttendanceRecordFormPage } from '@/features/attendance-records/attendance-record-form';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AttendanceRecordFormPage recordId={id} />;
}
