import React from 'react';
import GlassCard from './GlassCard';
import { Search } from 'lucide-react';

interface SearchActionHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  actions?: React.ReactNode;
}

export default function SearchActionHeader({
  searchQuery,
  onSearchChange,
  placeholder = 'Tìm kiếm...',
  actions
}: SearchActionHeaderProps) {
  return (
    <GlassCard 
      className="fade-in-up" 
      style={{ padding: 24, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center' }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', 
            color: 'var(--text-muted)' 
          }} 
        />
        <input
          className="input-field"
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={{ margin: 0, paddingLeft: 44 }}
        />
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 12 }}>
          {actions}
        </div>
      )}
    </GlassCard>
  );
}

