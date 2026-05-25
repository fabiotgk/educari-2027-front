/**
 * Exportação CSV client-side (sem dependência). Usa `;` como separador
 * (padrão BR para abrir no Excel) e BOM UTF-8 para acentos corretos.
 */

export interface CsvColumn<T> {
  /** Cabeçalho da coluna no CSV. */
  header: string;
  /** Extrai o valor textual da linha. */
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const head = columns.map((c) => escapeCell(c.header)).join(';');
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(';'))
    .join('\n');
  const csv = `﻿${head}\n${body}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
