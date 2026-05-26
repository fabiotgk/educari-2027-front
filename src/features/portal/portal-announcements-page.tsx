'use client';

import { Megaphone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalAnnouncements } from '@/features/portal/hooks';
import { formatDate } from '@/lib/format';

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export function PortalAnnouncementsPage() {
  const { data: announcements = [], isLoading, isError } = usePortalAnnouncements();

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Megaphone className="text-primary h-5 w-5" />
          Comunicados
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Avisos publicados pela rede e pela escola.
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-sm">
            Carregando comunicados...
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="text-destructive py-8 text-sm">
            Não foi possível carregar os comunicados.
          </CardContent>
        </Card>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-sm">
            Nenhum comunicado publicado até o momento.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {PRIORITY_LABELS[announcement.priority] ?? announcement.priority}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(announcement.published_at ?? announcement.created_at)}
                  </span>
                </div>
                <CardTitle>{announcement.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcement.summary && (
                  <p className="text-muted-foreground text-sm font-medium">
                    {announcement.summary}
                  </p>
                )}
                <p className="text-sm leading-6 whitespace-pre-line">{announcement.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
