'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

/**
 * Shell de formulário em painel lateral (criar/editar). A tela renderiza
 * os campos como children e passa o `onSubmit` já embrulhado pelo
 * handleSubmit do react-hook-form.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  submitting = false,
  onSubmit,
  submitLabel = 'Salvar',
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitting?: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn('w-full gap-0 p-0 sm:max-w-xl', className)}>
        <form onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto p-4">{children}</div>

          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
