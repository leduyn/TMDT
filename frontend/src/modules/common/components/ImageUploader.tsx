'use client';

import { useRef, useState, useCallback } from 'react';
import { uploadApi } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  uploadFn?: (file: File) => Promise<{ url: string }>;
}

export default function ImageUploader({ value, onChange, label = 'Hình ảnh', uploadFn = uploadApi.uploadImage }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WEBP)');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const res = await uploadFn(file);
      onChange(res.url);
    } catch (e: any) {
      setError(e.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const previewSrc = resolveImageUrl(value);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {label}
      </label>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: previewSrc ? 8 : '32px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          minHeight: previewSrc ? 160 : 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {uploading ? (
          <>
            <div style={{
              width: 36, height: 36,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang tải lên...</span>
          </>
        ) : previewSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="preview"
              style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Click hoặc kéo thả để thay đổi ảnh
            </span>
          </>
        ) : (
          <>
            <div style={{ fontSize: 36 }}>🖼️</div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Kéo thả hoặc click để chọn ảnh</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                JPG, PNG, GIF, WEBP · Tối đa 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {value && !uploading && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="input-field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="hoặc nhập URL trực tiếp..."
            style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem',
            }}
          >✕ Xoá</button>
        </div>
      )}

      {!value && !uploading && (
        <input
          className="input-field"
          value=""
          onChange={(e) => onChange(e.target.value)}
          placeholder="hoặc nhập URL ảnh trực tiếp..."
          style={{ marginTop: 8, fontSize: '0.8rem', padding: '6px 12px' }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {error && (
        <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}

