import { AnnouncementFormPage } from '@/features/announcements/announcement-form';

export default async function EditarComunicadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnnouncementFormPage announcementId={id} />;
}
