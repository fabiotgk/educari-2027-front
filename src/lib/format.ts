/**
 * Utilities de formatação PT-BR / GMT-3.
 *
 * Ver docs/conventions/code-style.md §Datas.
 */

import { format, formatDistanceToNow as dfnsDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BRT = 'America/Sao_Paulo';

export function formatDate(
  date: Date | string | null | undefined,
  pattern = 'dd/MM/yyyy'
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function formatTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'HH:mm');
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return dfnsDistance(d, { locale: ptBR, addSuffix: true });
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return '—';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return '—';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export { BRT };
