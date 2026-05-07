import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type BadgeType = 'success' | 'error' | 'warning' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  type?: BadgeType;
  icon?: keyof typeof LucideIcons;
}

export default function Badge({ label, type = 'info', icon }: BadgeProps) {
  const IconComponent = icon ? (LucideIcons[icon] as LucideIcon) : null;

  const getTypeClass = () => {
    switch (type) {
      case 'success': return 'badge-success';
      case 'error': return 'badge-error';
      case 'warning': return 'badge-warning';
      case 'primary': return 'badge-primary';
      default: return 'badge-info';
    }
  };

  return (
    <span className={`badge ${getTypeClass()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}>
      {IconComponent && <IconComponent size={12} strokeWidth={3} />}
      {label}
    </span>
  );
}
