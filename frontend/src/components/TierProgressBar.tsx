'use client';

import { TierProgressDTO } from '@/modules/accumulation/accumulationApi';

interface TierProgressBarProps {
  tiers: TierProgressDTO[];
  totalValue: number;
  unlimited?: boolean;
}

const formatCurrency = (v: number) => {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' tỷ';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
  return v.toLocaleString('vi-VN');
};

const TIER_COLORS = [
  { bg: '#dbeafe', fill: '#3b82f6', text: '#1e40af' },
  { bg: '#dcfce7', fill: '#22c55e', text: '#166534' },
  { bg: '#fef3c7', fill: '#f59e0b', text: '#92400e' },
  { bg: '#fce7f3', fill: '#ec4899', text: '#9d174d' },
  { bg: '#e0e7ff', fill: '#6366f1', text: '#3730a3' },
  { bg: '#ccfbf1', fill: '#14b8a6', text: '#115e59' },
];

export default function TierProgressBar({ tiers, totalValue, unlimited }: TierProgressBarProps) {
  if (!tiers || tiers.length === 0) return null;

  const lastTier = tiers[tiers.length - 1];
  const maxThreshold = unlimited && tiers.length > 1
    ? tiers[tiers.length - 2].thresholdValue
    : lastTier.thresholdValue;
  const totalWidth = 100;

  return (
    <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, marginTop: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
        Tiến độ theo mốc lũy tiến
      </div>

      {/* Progress bar tổng */}
      <div style={{ position: 'relative', height: 32, borderRadius: 8, overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
        {tiers.map((tier, i) => {
          const isLastUnlimited = unlimited && i === tiers.length - 1;
          const tierWidth = isLastUnlimited
            ? totalWidth - (maxThreshold / maxThreshold) * (tiers.length > 1 ? tiers[tiers.length - 2].thresholdValue / maxThreshold * totalWidth : 0)
            : ((tier.thresholdValue - tier.previousThreshold) / maxThreshold) * totalWidth;
          const colors = TIER_COLORS[i % TIER_COLORS.length];
          const fillPercent = isLastUnlimited ? 100 : tier.progress * 100;

          return (
            <div key={i} style={{ width: isLastUnlimited ? undefined : `${Math.max(tierWidth, 2)}%`, flex: isLastUnlimited ? 1 : undefined, position: 'relative', background: colors.bg }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${fillPercent}%`,
                background: tier.isReached ? colors.fill : (tier.isCurrentTier ? colors.fill : colors.bg),
                opacity: tier.isReached || isLastUnlimited ? 1 : (tier.isCurrentTier ? 0.6 : 0.2),
                transition: 'width 0.5s ease',
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: tier.isReached || isLastUnlimited ? 'white' : colors.text,
                zIndex: 1,
                textShadow: tier.isReached || isLastUnlimited ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              }}>
                {(tier.rebateRate * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Mốc đánh dấu */}
      <div style={{ position: 'relative', height: 20, marginTop: 2 }}>
        {tiers.map((tier, i) => {
          const isLastUnlimited = unlimited && i === tiers.length - 1;
          const pos = isLastUnlimited && tiers.length > 1
            ? ((tier.previousThreshold / maxThreshold) * 100 + (totalWidth - (maxThreshold / maxThreshold) * 100) / 2)
            : (tier.thresholdValue / maxThreshold) * 100;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: isLastUnlimited ? `${((tier.previousThreshold / maxThreshold) * 100 + (totalWidth - (maxThreshold / maxThreshold) * 100) / 2)}%` : `${Math.min(pos, 100)}%`,
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}>
              {isLastUnlimited ? '∞' : formatCurrency(tier.thresholdValue)}
            </div>
          );
        })}
      </div>

      {/* Chi tiết từng tier */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tiers.length}, 1fr)`, gap: 8, marginTop: 16 }}>
        {tiers.map((tier, i) => {
          const isLastUnlimited = unlimited && i === tiers.length - 1;
          const colors = TIER_COLORS[i % TIER_COLORS.length];
          return (
            <div key={i} style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${tier.isCurrentTier ? colors.fill : 'var(--border)'}`,
              background: tier.isReached ? colors.bg : 'transparent',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                Mốc {i + 1}: {formatCurrency(tier.previousThreshold)} → {isLastUnlimited ? '∞' : formatCurrency(tier.thresholdValue)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 2 }}>
                Tỷ lệ: {(tier.rebateRate * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 12, marginBottom: 2 }}>
                Giá trị: <span style={{ fontWeight: 600 }}>{formatCurrency(tier.valueInTier)}</span>
              </div>
              <div style={{ fontSize: 12, color: colors.fill, fontWeight: 600 }}>
                HH: {formatCurrency(tier.commissionFromTier)}
              </div>
              {(tier.isCurrentTier || isLastUnlimited) && (
                <div style={{
                  marginTop: 6,
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--border)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${tier.progress * 100}%`,
                    background: colors.fill,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              )}
              {(tier.isCurrentTier || isLastUnlimited) && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {isLastUnlimited ? 'Không giới hạn' : `Đạt ${(tier.progress * 100).toFixed(0)}%`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
