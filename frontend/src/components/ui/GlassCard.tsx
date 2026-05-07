import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, style, className = '', hoverable = false, onClick }: GlassCardProps) {
  const baseClass = hoverable ? 'glass-card' : 'glass-card-static';
  
  return (
    <div 
      className={`${baseClass} ${className}`} 
      style={{
        ...style,
        ...(onClick ? { cursor: 'pointer' } : {})
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
