import { useEffect, useState, useCallback } from 'react';

type NumberMap = Record<string, number>;

function shallowEqual(a: Record<string, any>, b: Record<string, any>) {
  if (a === b) return true;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export function useEditableObject<T extends Record<string, number>>(source: T) {
  const [persisted, setPersisted] = useState<T>(source);
  const [draft, setDraft] = useState<T>(source);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) return;

    setPersisted((prev) => (shallowEqual(prev, source) ? prev : source));
    setDraft((prev) => (shallowEqual(prev, source) ? prev : source));
  }, [source, isEditing]);

  const startEdit = useCallback(() => setIsEditing(true), []);
  const cancelEdit = useCallback(() => {
    setDraft(persisted);
    setIsEditing(false);
  }, [persisted]);

  const setDraftValue = useCallback((key: keyof T, value: number) => {
    setDraft((prev) => ({ ...prev, [key]: value } as T));
  }, []);

  return { persisted, draft, isEditing, startEdit, cancelEdit, setDraftValue, setPersisted };
}

export function useEditableMap(keys: string[], sourceMap: NumberMap) {
  return useEditableObject(
    keys.reduce((acc, k) => ({ ...acc, [k]: sourceMap[k] ?? 0 }), {} as Record<string, number>)
  );
}
