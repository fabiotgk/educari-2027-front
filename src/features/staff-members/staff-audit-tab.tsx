'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDateTime } from '@/lib/format';
import type { StaffMember } from './types';

export function StaffAuditTab({ member }: { member: StaffMember }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Auditoria</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailGrid cols={3}>
          <DetailField label="Chave da consulta" value={member.id} />
          <DetailField label="Tenant" value={member.tenant_id} />
          <DetailField label="Usuário vinculado" value={member.user_id ?? '—'} />
          <DetailField label="Criado em" value={formatDateTime(member.created_at)} />
          <DetailField label="Atualizado em" value={formatDateTime(member.updated_at)} />
          <DetailField label="Excluído em" value={member.deleted_at ? formatDateTime(member.deleted_at) : '—'} />
        </DetailGrid>
      </CardContent>
    </Card>
  );
}
