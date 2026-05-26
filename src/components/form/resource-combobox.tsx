'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { Popover } from 'radix-ui';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { listResource, getResource } from '@/lib/api-client';

type ResourceItem = {
  id: string;
};

interface ResourceComboboxProps<T extends ResourceItem> {
  value: string | null;
  onChange: (id: string | null) => void;
  resource: string;
  labelFn: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  errorMessage?: string;
}

const SEARCH_FIELDS: Readonly<Record<string, string>> = {
  students: 'full_name',
  users: 'name',
  courses: 'title',
  'course-modules': 'title',
  lessons: 'title',
  'lms-quizzes': 'title',
  'lms-questions': 'statement',
  'quiz-attempts': 'attempt_number',
  'forum-threads': 'title',
};

function buildSearch(resource: string, value: string): Record<string, string> {
  const field = SEARCH_FIELDS[resource] ?? 'title';
  return { [field]: value };
}

export function ResourceCombobox<T extends ResourceItem>({
  value,
  onChange,
  resource,
  labelFn,
  placeholder = 'Selecione…',
  disabled = false,
  searchable = true,
  errorMessage,
}: ResourceComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  React.useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const normalizedValue = value || null;
  const shouldSearch = searchable && debouncedSearch.length > 0;

  const optionsQuery = useQuery({
    queryKey: ['resource-combobox', resource, shouldSearch ? debouncedSearch : '', 20],
    queryFn: () =>
      listResource<T>(resource, {
        ...(shouldSearch ? { search: buildSearch(resource, debouncedSearch) } : {}),
        limit: 20,
      }),
  });

  const options = optionsQuery.data?.data ?? [];
  const selectedInList = options.find((item) => item.id === normalizedValue) ?? null;

  const selectedQuery = useQuery({
    queryKey: ['resource-combobox', resource, 'selected', normalizedValue],
    queryFn: () => getResource<T>(resource, normalizedValue ?? ''),
    enabled: Boolean(normalizedValue && !selectedInList),
  });

  const resolvedSelected = selectedInList ?? selectedQuery.data ?? null;
  const isResolvingSelected = Boolean(normalizedValue && !resolvedSelected && selectedQuery.isLoading);

  const queryErrorMessage =
    optionsQuery.error instanceof Error ? optionsQuery.error.message : null;

  const displayLabel =
    resolvedSelected !== null
      ? labelFn(resolvedSelected)
      : isResolvingSelected
        ? 'Carregando…'
        : placeholder;

  return (
    <div className="w-full space-y-1.5">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          asChild
          disabled={disabled}
        >
          <button
            type="button"
            aria-invalid={Boolean(errorMessage || queryErrorMessage)}
            className={cn(
              "inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1 text-sm transition-shadow outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
              "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <span
              className={cn(
                'min-w-0 truncate',
                resolvedSelected || isResolvingSelected ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {displayLabel}
            </span>
            {optionsQuery.isLoading ? (
              <Loader2 className="size-4 animate-spin opacity-70" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="size-4 opacity-70" aria-hidden="true" />
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            className="relative z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border bg-popover p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            {searchable && (
              <div className="pb-1">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-60" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar…"
                    autoFocus
                    className="h-8 w-full px-8"
                    onClick={(event) => event.stopPropagation()}
                  />
                  {search ? (
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSearch('');
                      }}
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-auto rounded-md">
              {queryErrorMessage ? (
                <div className="px-2 py-3 text-sm text-destructive">Falha ao carregar: {queryErrorMessage}</div>
              ) : optionsQuery.isLoading && !options.length ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">Carregando…</div>
              ) : options.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">Nenhum resultado</div>
              ) : (
                options.map((item) => {
                  const itemLabel = labelFn(item);
                  const isActive = item.id === normalizedValue;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent text-accent-foreground',
                      )}
                    >
                      <Check className={cn('size-4 opacity-0', isActive && 'opacity-100')} />
                      <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
                    </button>
                  );
                })
              )}

              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground outline-none transition hover:bg-accent hover:text-accent-foreground"
              >
                <span className="size-4" aria-hidden="true" />
                <span>Sem seleção</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
      {queryErrorMessage && !errorMessage ? <p className="text-xs text-destructive">{queryErrorMessage}</p> : null}
    </div>
  );
}

