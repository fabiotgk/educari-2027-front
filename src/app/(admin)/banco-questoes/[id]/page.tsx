import { QuestionBankDetailPage } from '@/features/question-banks/question-bank-detail';

export default async function BancoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionBankDetailPage id={id} />;
}
