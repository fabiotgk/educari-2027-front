import { AnnouncementDetailPage } from '@/features/announcements/announcement-detail';

export default async function ComunicadoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnnouncementDetailPage id={id} />;
}
