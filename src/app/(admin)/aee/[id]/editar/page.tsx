import type { Metadata } from 'next';
import { PdiPlanFormPage } from '@/features/pdi-plans/pdi-plan-form';

export const metadata: Metadata = { title: 'Editar PDI · Educação Especial' };

export default async function EditarPdiPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PdiPlanFormPage planId={id} />;
}
