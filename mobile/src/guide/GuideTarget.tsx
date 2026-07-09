import React, { useCallback, useContext, useRef } from 'react';
import { View } from 'react-native';
import { GuideContext } from './GuideProvider';

interface GuideTargetProps {
  id: string;
  children: React.ReactElement;
}

export function GuideTarget({ id, children }: GuideTargetProps) {
  const ctx = useContext(GuideContext);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const lastRef = useRef<any>(null);

  const ref = useCallback((node: any) => {
    if (node) {
      lastRef.current = node;
      ctxRef.current?.registerTarget?.(id, node);
    } else {
      ctxRef.current?.unregisterTarget?.(id, lastRef.current);
      lastRef.current = null;
    }
  }, [id]);

  return <View ref={ref} collapsable={false}>{children}</View>;
}
