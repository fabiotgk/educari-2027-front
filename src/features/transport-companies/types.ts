/** Tipos do recurso M20 / Transporte — espelham o TransportCompanyResource do backend. */

export interface TransportCompanyAddress {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface TransportCompany {
  id: string;
  tenant_id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  address: TransportCompanyAddress | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
