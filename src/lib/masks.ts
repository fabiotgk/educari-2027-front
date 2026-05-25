/**
 * Máscaras de entrada PT-BR. Cada `maskX` recebe o valor digitado e
 * devolve o texto formatado para exibição; `unmask` remove tudo que
 * não é dígito para enviar ao backend (que espera só números).
 */

export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskCpf(value: string): string {
  return unmask(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCnpj(value: string): string {
  return unmask(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function maskCep(value: string): string {
  return unmask(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function maskPhone(value: string): string {
  const d = unmask(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** dd/mm/aaaa a partir de dígitos digitados. */
export function maskDate(value: string): string {
  return unmask(value)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

export const MASKS = {
  cpf: maskCpf,
  cnpj: maskCnpj,
  cep: maskCep,
  phone: maskPhone,
  date: maskDate,
} as const;

export type MaskKind = keyof typeof MASKS;
