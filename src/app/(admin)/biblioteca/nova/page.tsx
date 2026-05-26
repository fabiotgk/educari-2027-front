import type { Metadata } from 'next';
import { LibraryItemFormPage } from '@/features/library-items/library-item-form';

export const metadata: Metadata = { title: 'Novo item · Biblioteca' };

export default function NovoItemPage() {
  return <LibraryItemFormPage />;
}
