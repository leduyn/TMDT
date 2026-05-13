import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hoverable?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  title, 
  icon, 
  style, 
  className = '', 
  hoverable = false, 
  noPadding = false,
  onClick 
}: GlassCardProps) {
  const baseClass = hoverable ? 'glass-card' : 'glass-card-static';
  
  // If there's a title/icon, we need the header structure
  const hasHeader = !!(title || icon);

  return (
    <div 
      className={`${baseClass} ${className}`} 
      style={{
        ...style,
        ...(onClick ? { cursor: 'pointer' } : {}),
        // If we have a header, the padding from style should probably apply to the content, 
        // but for simplicity and compatibility with existing code, 
        // we'll keep the padding on the outer div if noPadding is NOT set and there's NO header.
        ...( (!hasHeader && !noPadding && !style?.padding) ? { padding: 20 } : {} )
      }}
      onClick={onClick}
    >
      {hasHeader && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
        }}>
          {icon && <div style={{ color: 'var(--primary)', display: 'flex' }}>{icon}</div>}
          {title && <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h3>}
        </div>
      )}
      
      {hasHeader && !noPadding ? (
        <div style={{ padding: 20 }}>
          {children}
        </div>
      ) : children}
    </div>
  );
}

