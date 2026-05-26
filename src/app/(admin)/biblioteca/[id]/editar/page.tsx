import { LibraryItemFormPage } from '@/features/library-items/library-item-form';

export default async function EditarItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LibraryItemFormPage libraryItemId={id} />;
}
