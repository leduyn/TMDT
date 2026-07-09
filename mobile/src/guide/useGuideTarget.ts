import { useCallback, useContext, useRef } from 'react';
import { GuideContext } from './GuideProvider';

export function useGuideTarget(id: string) {
  const ctx = useContext(GuideContext);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const lastRef = useRef<any>(null);

  return useCallback((node: any) => {
    if (node) {
      lastRef.current = node;
      ctxRef.current?.registerTarget?.(id, node);
    } else {
      ctxRef.current?.unregisterTarget?.(id, lastRef.current);
      lastRef.current = null;
    }
  }, [id]);
}
