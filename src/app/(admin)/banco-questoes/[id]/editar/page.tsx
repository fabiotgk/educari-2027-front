import { QuestionBankFormPage } from '@/features/question-banks/question-bank-form';

export default async function EditarBancoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionBankFormPage bankId={id} />;
}
