'use client';

import React from 'react';

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: number | string;
}

export default function Main({ children, style, maxWidth, ...props }: MainProps) {
  return (
    <main
      style={{
        padding: '20px 24px',
        ...(maxWidth ? { maxWidth, margin: '0 auto' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </main>
  );
}
