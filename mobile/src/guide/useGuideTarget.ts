import { useCallback, useContext, useRef } from 'react';
import { GuideContext } from './GuideProvider';

export function useGuideTarget(id: string) {
  const ctx = useContext(GuideContext);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  return useCallback((node: any) => {
    if (node) {
      ctxRef.current?.registerTarget?.(id, node);
    } else {
      ctxRef.current?.unregisterTarget?.(id);
    }
  }, [id]);
}
