import { describe, it, expect } from 'vitest';
import { formatCpf, formatCnpj, formatNumber, formatPercent } from './format';

describe('formatCpf', () => {
  it('formata CPF com 11 dígitos', () => {
    expect(formatCpf('12345678909')).toBe('123.456.789-09');
  });

  it('retorna traço para CPF nulo', () => {
    expect(formatCpf(null)).toBe('—');
    expect(formatCpf(undefined)).toBe('—');
  });

  it('retorna original se não tem 11 dígitos', () => {
    expect(formatCpf('12345')).toBe('12345');
  });
});

describe('formatCnpj', () => {
  it('formata CNPJ com 14 dígitos', () => {
    expect(formatCnpj('12345678000123')).toBe('12.345.678/0001-23');
  });

  it('retorna traço para CNPJ nulo', () => {
    expect(formatCnpj(null)).toBe('—');
  });
});

describe('formatNumber', () => {
  it('formata número em padrão PT-BR', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('aceita casas decimais', () => {
    expect(formatNumber(1234.5, 2)).toBe('1.234,50');
  });
});

describe('formatPercent', () => {
  it('formata percentual com 1 casa decimal', () => {
    expect(formatPercent(92.4)).toBe('92,4%');
  });
});
