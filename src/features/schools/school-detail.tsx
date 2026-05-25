'use client';

import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DetailSheet, DetailSection, DetailField } from '@/components/crud/detail-sheet';
import { formatCnpj, formatDateTime } from '@/lib/format';
import { maskCep, maskPhone } from '@/lib/masks';
import { SchoolStatusBadge } from './columns';
import {
  SCHOOL_PROFILE_LABELS,
  SCHOOL_TYPE_LABELS,
  type School,
} from './types';

export function SchoolDetail({
  school,
  open,
  onOpenChange,
  onEdit,
}: {
  school: School | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (s: School) => void;
}) {
  if (!school) return null;
  const addr = school.address;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={school.name}
      description={school.short_name ?? SCHOOL_TYPE_LABELS[school.type]}
      footer={
        <Button
          onClick={() => {
            onOpenChange(false);
            onEdit(school);
          }}
        >
          <Pencil /> Editar
        </Button>
      }
    >
      <DetailSection title="Identificação">
        <DetailField label="Tipo" value={<Badge variant="secondary">{SCHOOL_TYPE_LABELS[school.type]}</Badge>} />
        <DetailField label="Situação" value={<SchoolStatusBadge status={school.operation_status} />} />
        <DetailField label="Código interno" value={school.code} />
        <DetailField label="Código INEP" value={school.inep_code} />
        <DetailField label="CNPJ" value={school.cnpj ? formatCnpj(school.cnpj) : null} />
        <DetailField label="Inscrição estadual" value={school.state_registration} />
      </DetailSection>

      <DetailSection title="Contato">
        <DetailField label="E-mail" value={school.email} />
        <DetailField label="Telefone" value={school.phone ? maskPhone(school.phone) : null} />
      </DetailSection>

      <DetailSection title="Endereço">
        <DetailField label="CEP" value={addr?.cep ? maskCep(addr.cep) : null} />
        <DetailField label="Região / zona" value={school.region} />
        <DetailField
          label="Logradouro"
          full
          value={addr?.logradouro ? `${addr.logradouro}${addr.numero ? ', ' + addr.numero : ''}` : null}
        />
        <DetailField label="Bairro" value={addr?.bairro} />
        <DetailField label="Município" value={addr?.cidade ? `${addr.cidade}${addr.uf ? '/' + addr.uf : ''}` : null} />
        <DetailField
          label="Coordenadas"
          full
          value={
            school.coordinates?.lat != null && school.coordinates?.lng != null
              ? `${school.coordinates.lat}, ${school.coordinates.lng}`
              : null
          }
        />
      </DetailSection>

      <DetailSection title="Perfis">
        <DetailField
          label="Perfis"
          full
          value={
            school.profiles?.length
              ? school.profiles.map((p) => SCHOOL_PROFILE_LABELS[p]).join(', ')
              : null
          }
        />
      </DetailSection>

      <DetailSection title="Auditoria">
        <DetailField label="Criada em" value={formatDateTime(school.created_at)} />
        <DetailField label="Atualizada em" value={formatDateTime(school.updated_at)} />
      </DetailSection>
    </DetailSheet>
  );
}
