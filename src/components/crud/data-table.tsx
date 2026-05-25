'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Columns3,
  Download,
  Search,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { exportCsv } from '@/lib/csv';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Definição declarativa de coluna. Escrita à mão por cada tela. */
export interface Column<T> {
  /** Identificador único da coluna. */
  id: string;
  /** Rótulo do cabeçalho (PT-BR). */
  header: string;
  /** Renderiza a célula. */
  cell: (row: T) => React.ReactNode;
  /** Se fornecido, habilita ordenação client por esta coluna. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Valor textual para a exportação CSV (default: usa sortValue). */
  exportValue?: (row: T) => string | number | null | undefined;
  /** Esconde a coluna por padrão (visível pelo seletor de colunas). */
  defaultHidden?: boolean;
  /** Classes extras na célula e no cabeçalho. */
  className?: string;
  /** Impede ocultar/exportar (ex: coluna de ações). */
  pinned?: boolean;
}

type SortState = { id: string; dir: 'asc' | 'desc' } | null;

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  /** Busca textual (dispara refetch no backend — controlada pela tela). */
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  /** Slot de filtros específicos da tela (Selects, etc). */
  filters?: React.ReactNode;
  /** Render das ações em massa, recebe as linhas selecionadas e um clear(). */
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  /** Clique na linha (ex: abrir painel de detalhe). */
  onRowClick?: (row: T) => void;
  /** Habilita o botão de exportar CSV com este nome de arquivo. */
  exportFilename?: string;
  /** Mensagem quando não há registros. */
  emptyMessage?: string;
  /** Paginação (CursorPager montado pela tela). */
  pager?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  search,
  filters,
  bulkActions,
  onRowClick,
  exportFilename,
  emptyMessage = 'Nenhum registro encontrado.',
  pager,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortState>(null);
  const [hidden, setHidden] = React.useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)),
  );
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const visibleColumns = columns.filter((c) => !hidden.has(c.id));

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va).localeCompare(String(vb), 'pt-BR') * factor;
    });
  }, [rows, sort, columns]);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortValue) return;
    setSort((prev) => {
      if (prev?.id !== col.id) return { id: col.id, dir: 'asc' };
      if (prev.dir === 'asc') return { id: col.id, dir: 'desc' };
      return null;
    });
  };

  const selectedRows = sortedRows.filter((r) => selected.has(getRowId(r)));
  const clearSelection = () => setSelected(new Set());
  const allChecked = sortedRows.length > 0 && selected.size === sortedRows.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) clearSelection();
    else setSelected(new Set(sortedRows.map(getRowId)));
  };
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleExport = () => {
    if (!exportFilename) return;
    const cols = visibleColumns
      .filter((c) => !c.pinned && (c.exportValue || c.sortValue))
      .map((c) => ({
        header: c.header,
        value: (row: T) => (c.exportValue ?? c.sortValue)!(row) ?? '',
      }));
    exportCsv(exportFilename, cols, selectedRows.length ? selectedRows : sortedRows);
  };

  const selectable = Boolean(bulkActions);
  const colSpan = visibleColumns.length + (selectable ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? 'Buscar…'}
              className="h-9 pl-8"
            />
            {search.value && (
              <button
                type="button"
                onClick={() => search.onChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
        {filters}

        <div className="ml-auto flex items-center gap-2">
          {exportFilename && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!rows.length}>
              <Download /> Exportar
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 /> Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((c) => !c.pinned)
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={!hidden.has(c.id)}
                    onCheckedChange={() =>
                      setHidden((prev) => {
                        const next = new Set(prev);
                        next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                        return next;
                      })
                    }
                  >
                    {c.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Barra de ações em massa */}
      {selectable && selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">
            {selected.size} {selected.size === 1 ? 'selecionado' : 'selecionados'}
          </span>
          <div className="flex items-center gap-2">{bulkActions!(selectedRows, clearSelection)}</div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
            <X /> Limpar
          </Button>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
              )}
              {visibleColumns.map((c) => (
                <TableHead key={c.id} className={c.className}>
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c)}
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      {c.header}
                      {sort?.id === c.id ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="size-4" />
                    </TableCell>
                  )}
                  {visibleColumns.map((c) => (
                    <TableCell key={c.id}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => {
                const id = getRowId(row);
                return (
                  <TableRow
                    key={id}
                    data-state={selected.has(id) ? 'selected' : undefined}
                    className={onRowClick ? 'cursor-pointer' : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(id)}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label="Selecionar linha"
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((c) => (
                      <TableCell key={c.id} className={c.className}>
                        {c.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pager}
    </div>
  );
}
