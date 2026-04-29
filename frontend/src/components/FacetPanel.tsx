'use client';

import React from 'react';
import { FacetGroupDTO } from '@/lib/api';

interface FacetPanelProps {
  facets: FacetGroupDTO[];
  selectedValueIds: Set<number>;
  onToggleValue: (valueId: number) => void;
  onClearAll: () => void;
  loading?: boolean;
}

export default function FacetPanel({
  facets,
  selectedValueIds,
  onToggleValue,
  onClearAll,
  loading = false,
}: FacetPanelProps) {
  const hasSelection = selectedValueIds.size > 0;

  return (
    <aside className="facet-panel">
      <div className="facet-panel__header">
        <h3 className="facet-panel__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Bộ lọc
        </h3>
        {hasSelection && (
          <button className="facet-panel__clear" onClick={onClearAll}>
            Xoá tất cả
          </button>
        )}
      </div>

      {loading && (
        <div className="facet-panel__loading">
          <div className="facet-panel__spinner" />
          <span>Đang tải...</span>
        </div>
      )}

      {!loading && facets.length === 0 && (
        <div className="facet-panel__empty">
          Chưa có thuộc tính nào
        </div>
      )}

      <div className="facet-panel__groups">
        {facets.map((group) => (
          <div key={group.attributeId} className="facet-group">
            <h4 className="facet-group__title">{group.displayName}</h4>
            <ul className="facet-group__list">
              {group.values.map((fv) => {
                const isSelected = selectedValueIds.has(fv.valueId);
                const isDisabled = fv.count === 0 && !isSelected;
                return (
                  <li key={fv.valueId} className="facet-item">
                    <label
                      className={`facet-item__label ${isSelected ? 'facet-item__label--active' : ''} ${isDisabled ? 'facet-item__label--disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="facet-item__checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => onToggleValue(fv.valueId)}
                      />
                      <span className="facet-item__checkmark">
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="facet-item__text">{fv.value}</span>
                      <span className={`facet-item__count ${isDisabled ? 'facet-item__count--zero' : ''}`}>
                        {fv.count}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .facet-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }

        .facet-panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .facet-panel__title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .facet-panel__clear {
          background: none;
          border: none;
          color: #818cf8;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .facet-panel__clear:hover {
          background: rgba(129, 140, 248, 0.12);
          color: #a5b4fc;
        }

        .facet-panel__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 30px 20px;
          color: #94a3b8;
          font-size: 13px;
        }

        .facet-panel__spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(129, 140, 248, 0.2);
          border-top-color: #818cf8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .facet-panel__empty {
          padding: 30px 20px;
          color: #64748b;
          font-size: 13px;
          text-align: center;
        }

        .facet-panel__groups {
          padding: 8px 0;
        }

        .facet-group {
          padding: 12px 20px 16px;
        }

        .facet-group + .facet-group {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .facet-group__title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 10px;
        }

        .facet-group__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .facet-item__label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .facet-item__label:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .facet-item__label--active {
          background: rgba(129, 140, 248, 0.1);
        }

        .facet-item__label--active:hover {
          background: rgba(129, 140, 248, 0.15);
        }

        .facet-item__label--disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .facet-item__label--disabled:hover {
          background: transparent;
        }

        .facet-item__checkbox {
          display: none;
        }

        .facet-item__checkmark {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .facet-item__label--active .facet-item__checkmark {
          background: #818cf8;
          border-color: #818cf8;
        }

        .facet-item__text {
          flex: 1;
          font-size: 13.5px;
          color: #cbd5e1;
          font-weight: 400;
        }

        .facet-item__label--active .facet-item__text {
          color: #e2e8f0;
          font-weight: 500;
        }

        .facet-item__count {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 7px;
          border-radius: 10px;
          min-width: 24px;
          text-align: center;
        }

        .facet-item__count--zero {
          color: #475569;
        }
      `}</style>
    </aside>
  );
}
