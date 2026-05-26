'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  apiFetch,
  deleteResource,
  getResource,
  listResource,
  updateResource,
  type ListParams,
} from '@/lib/api-client';
import type { ForumReply } from './types';

const RESOURCE = 'forum-replies';
const KEY = ['forum-replies'] as const;

interface ResourceEnvelope<T> {
  data: T;
}

function unwrap<T>(payload: ResourceEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ResourceEnvelope<T>).data;
  }
  return payload as T;
}

export function useForumReplies(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<ForumReply>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useForumReply(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<ForumReply>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateForumReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ forumThreadId, body }: { forumThreadId: string; body: Record<string, unknown> }) =>
      unwrap<ForumReply>(
        await apiFetch<ResourceEnvelope<ForumReply>>(`/api/v1/forum-threads/${forumThreadId}/forum-replies`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['forum-threads'] });
    },
  });
}

export function useUpdateForumReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<ForumReply>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteForumReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['forum-threads'] });
    },
  });
}

export function useDeleteForumReplies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['forum-threads'] });
    },
  });
}
