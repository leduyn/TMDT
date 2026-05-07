import React from 'react';
import GlassCard from './GlassCard';

export interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Không có dữ liệu hiển thị'
}: DataTableProps<T>) {
  if (loading) {
    return (
      <GlassCard style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ marginBottom: 16 }}></div>
        <div style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ padding: 0, overflow: 'hidden' }} className="fade-in">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ 
                    padding: '16px 20px', 
                    textAlign: col.align || 'left',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border)',
                    width: col.width
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, rowIdx) => (
                <tr 
                  key={item.id || rowIdx} 
                  style={{ 
                    borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--border)',
                    transition: 'background 0.2s'
                  }}
                  className="table-row-hover"
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      style={{ 
                        padding: '16px 20px', 
                        textAlign: col.align || 'left',
                        fontSize: '0.95rem'
                      }}
                    >
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </GlassCard>
  );
}
