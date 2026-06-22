'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  style,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find(o => o.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(
    () =>
      search.trim() === ''
        ? options
        : options.filter(o =>
            o.label.toLowerCase().includes(search.toLowerCase())
          ),
    [options, search]
  );

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [filteredOptions]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  const handleSelect = useCallback(
    (opt: SearchableSelectOption) => {
      onChange(opt.value);
      setIsOpen(false);
      setSearch('');
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
    setSearch('');
    setIsOpen(false);
  }, [onChange]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Focus input on next tick after render
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [disabled]);

  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      setSearch('');
    } else {
      openDropdown();
    }
  }, [disabled, isOpen, openDropdown]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearch('');
          break;
      }
    },
    [isOpen, openDropdown, filteredOptions, highlightedIndex, handleSelect]
  );

  const triggerText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', ...style }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={handleTriggerClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.05)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '0.85rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          minHeight: 34,
          userSelect: 'none',
          transition: 'border-color 0.15s',
          outline: 'none',
        }}
        onFocus={e => {
          if (!disabled) e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {triggerText}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            marginLeft: 8,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'var(--bg-glass, rgba(26, 26, 46, 0.97))',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            zIndex: 1000,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Search input */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Options */}
          <div
            ref={listRef}
            role="listbox"
            style={{ maxHeight: 220, overflowY: 'auto' }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}
              >
                Không có kết quả
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: isSelected ? 'var(--accent-light)' : 'var(--text-primary)',
                      background: isHighlighted
                        ? 'rgba(99, 102, 241, 0.12)'
                        : isSelected
                        ? 'rgba(99, 102, 241, 0.08)'
                        : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>

          {/* Clear action */}
          {value !== undefined && (
            <div style={{ padding: '4px 8px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleClear}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Xoá lựa chọn
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
