import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      padding: '20px 0',
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: page === 0 ? 'transparent' : 'rgba(99,102,241,0.1)',
          color: page === 0 ? 'var(--text-muted)' : 'var(--accent-light)',
          cursor: page === 0 ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all 0.2s',
          opacity: page === 0 ? 0.4 : 1,
        }}
      >
        ← Trước
      </button>

      {getPageNumbers().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: p === page ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: p === page ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: p === page ? 700 : 500,
            transition: 'all 0.2s',
          }}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: page >= totalPages - 1 ? 'transparent' : 'rgba(99,102,241,0.1)',
          color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--accent-light)',
          cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all 0.2s',
          opacity: page >= totalPages - 1 ? 0.4 : 1,
        }}
      >
        Sau →
      </button>
    </div>
  );
}
