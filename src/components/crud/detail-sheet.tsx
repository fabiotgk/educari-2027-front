'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

/** Painel lateral de detalhe (somente leitura). */
export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-4">{children}</div>
        {footer && <SheetFooter className="flex-row justify-end gap-2 border-t">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

/** Bloco de campos do detalhe, com um título de seção. */
export function DetailSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </section>
  );
}

/** Par rótulo/valor dentro de uma DetailSection. */
export function DetailField({
  label,
  value,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  /** Ocupa as duas colunas. */
  full?: boolean;
}) {
  return (
    <div className={cn(full && 'col-span-2')}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value === null || value === undefined || value === '' ? '—' : value}</dd>
    </div>
  );
}
