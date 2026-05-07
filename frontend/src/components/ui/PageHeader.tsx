import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof LucideIcons;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  const IconComponent = icon ? (LucideIcons[icon] as LucideIcon) : null;

  return (
    <div style={{ marginBottom: 32 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {IconComponent && <IconComponent size={32} className="gradient-text" style={{ strokeWidth: 2.5 }} />}
        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
