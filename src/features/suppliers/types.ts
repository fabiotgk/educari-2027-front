/** Tipos do recurso M21 / Fornecedores PNAE — espelham o SupplierResource do backend. */

export interface SupplierAddress {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  cnpj: string | null;
  is_regional: boolean | null;
  phone: string | null;
  email: string | null;
  address: SupplierAddress | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
