import type { Metadata } from 'next';
import { LibraryItemsPage } from '@/features/library-items/library-items-page';

export const metadata: Metadata = { title: 'Acervo · Biblioteca' };

export default function BibliotecaPage() {
  return <LibraryItemsPage />;
}
