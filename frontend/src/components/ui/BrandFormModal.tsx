'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import ImageUploader from '@/modules/common/components/ImageUploader';
import { brandApi, BrandDTO, BrandRequest, uploadApi } from '@/lib/api';

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brand?: BrandDTO | null;
}

export default function BrandFormModal({ isOpen, onClose, onSuccess, brand }: BrandFormModalProps) {
  const [form, setForm] = useState<BrandRequest>({ code: '', name: '', logoUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (brand) {
        setForm({ code: brand.code, name: brand.name, logoUrl: brand.logoUrl || '' });
      } else {
        setForm({ code: '', name: '', logoUrl: '' });
      }
    }
  }, [isOpen, brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (brand) {
        await brandApi.update(brand.id, form);
      } else {
        await brandApi.create(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={brand ? '📝 Cập nhật thương hiệu' : '✨ Thêm thương hiệu mới'} maxWidth={600}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <ImageUploader
              label="Logo thương hiệu"
              value={form.logoUrl}
              onChange={url => setForm({...form, logoUrl: url})}
              uploadFn={uploadApi.uploadBrandLogo}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mã thương hiệu <span style={{color:'#ef4444'}}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="VD: SAM"
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                required
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tên thương hiệu <span style={{color:'#ef4444'}}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="VD: Samsung"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : (brand ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
