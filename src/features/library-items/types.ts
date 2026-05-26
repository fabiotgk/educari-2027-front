/** Tipos do recurso M24 / Biblioteca — espelham o LibraryItemResource do backend. */

export type LibraryItemKind = 'book' | 'magazine' | 'dvd' | 'other';
export type LoanStatus = 'active' | 'returned' | 'overdue' | 'lost';
export type LoanBorrowerType = 'student' | 'user' | 'external';

export interface LibraryItem {
  id: string;
  tenant_id: string;
  library_id: string;
  kind: LibraryItemKind;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  published_year: string | null;
  shelf_code: string | null;
  copies_total: number;
  copies_available: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Loan {
  id: string;
  tenant_id: string;
  library_item_id: string;
  borrower_type: LoanBorrowerType;
  student_id: string | null;
  user_id: string | null;
  external_library_user_id: string | null;
  loaned_at: string | null;
  due_at: string | null;
  returned_at: string | null;
  status: LoanStatus;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export const LIBRARY_ITEM_KIND_LABELS: Record<LibraryItemKind, string> = {
  book: 'Livro',
  magazine: 'Revista',
  dvd: 'DVD',
  other: 'Outro',
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Em andamento',
  returned: 'Devolvido',
  overdue: 'Em atraso',
  lost: 'Perdido',
};

export const LOAN_BORROWER_TYPE_LABELS: Record<LoanBorrowerType, string> = {
  student: 'Aluno',
  user: 'Servidor',
  external: 'Usuário externo',
};
