'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOCK_ACTIVITY, type ActivityItem } from '@/data/mock';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<ActivityItem['type'], { icon: keyof typeof Icons; color: string; label: string }> = {
  enrollment: { icon: 'UserPlus', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', label: 'Matrícula' },
  grade: { icon: 'GraduationCap', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', label: 'Nota' },
  document: { icon: 'FileText', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300', label: 'Documento' },
  communication: { icon: 'MessageSquare', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', label: 'Comunicação' },
  attendance: { icon: 'CalendarCheck', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', label: 'Frequência' },
};

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade recente</CardTitle>
        <CardDescription>Últimas operações em todas as escolas da rede</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px] -mr-4 pr-4">
          <div className="space-y-1">
            {MOCK_ACTIVITY.map((item, index) => {
              const config = TYPE_CONFIG[item.type];
              const IconComponent = (Icons[config.icon] as React.ComponentType<{ className?: string }>) ?? Icons.Activity;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="group flex items-start gap-3 rounded-md px-2 py-3 hover:bg-accent/40 transition-colors"
                >
                  <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md', config.color)}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{item.title}</p>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      <Badge variant="outline" className="font-normal text-[10px] py-0 px-1.5 mr-1.5">
                        {config.label}
                      </Badge>
                      {item.user}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
