'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailField, DetailGrid } from '@/components/crud/detail-fields';
import { formatDateTime } from '@/lib/format';
import type { Student } from './types';

export function StudentAuditTab({ student, studentId }: { student: Student; studentId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Auditoria</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailGrid cols={3}>
          <DetailField label="Chave da consulta" value={studentId} />
          <DetailField label="Requisitado para" value={student.id} />
          <DetailField label="Criado em" value={formatDateTime(student.created_at)} />
          <DetailField label="Atualizado em" value={formatDateTime(student.updated_at)} />
          <DetailField label="Excluído em" value={student.deleted_at ? formatDateTime(student.deleted_at) : null} />
          <DetailField label="Anonimizado em" value={student.anonymized_at ? formatDateTime(student.anonymized_at) : null} />
        </DetailGrid>
      </CardContent>
    </Card>
  );
}
