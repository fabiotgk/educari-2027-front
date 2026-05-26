import { LibraryItemDetailPage } from '@/features/library-items/library-item-detail';

export default async function BibliotecaItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LibraryItemDetailPage id={id} />;
}
