import { AccessGrantFormPage } from '@/features/access-grants/access-grant-form';

export default async function EditarConcessaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AccessGrantFormPage resourceId={id} />;
}
