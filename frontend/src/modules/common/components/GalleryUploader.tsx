'use client';

import { useRef, useState, useCallback } from 'react';
import { uploadApi } from '@/lib/api';
import { resolveImageUrl } from '@/lib/utils';

interface GalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function GalleryUploader({
  images,
  onChange,
  label = 'Thư viện ảnh (Gallery)',
  maxImages = 10,
}: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArr.length) { setError('Chỉ chấp nhận file hình ảnh'); return; }
    const remaining = maxImages - images.length;
    if (remaining <= 0) { setError(`Tối đa ${maxImages} ảnh`); return; }

    setUploading(true);
    setError('');
    try {
      const uploads = await Promise.all(
        fileArr.slice(0, remaining).map(f => uploadApi.uploadImage(f))
      );
      const newUrls = uploads.map(r => r.url);
      onChange([...images, ...newUrls]);
    } catch (e: any) {
      setError(e.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {label}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
          (Ảnh đầu tiên là ảnh chính · Tối đa {maxImages} ảnh)
        </span>
      </label>

      {/* Grid ảnh đã upload */}
      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 10,
          marginBottom: 12,
        }}>
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              style={{
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
                border: i === 0 ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
                aspectRatio: '1',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(url)}
                alt={`Ảnh ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Badge ảnh chính */}
              {i === 0 && (
                <span style={{
                  position: 'absolute', top: 4, left: 4,
                  background: 'var(--accent)', color: '#fff',
                  fontSize: '0.6rem', padding: '2px 6px', borderRadius: 20, fontWeight: 700,
                }}>CHÍNH</span>
              )}

              {/* Overlay controls */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    title="Di chuyển sang trái"
                    style={overlayBtn}
                  >◀</button>
                )}
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    title="Di chuyển sang phải"
                    style={overlayBtn}
                  >▶</button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  title="Xoá ảnh"
                  style={{ ...overlayBtn, background: 'rgba(239,68,68,0.8)' }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            background: dragOver ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s ease',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8,
          }}
        >
          {uploading ? (
            <>
              <div style={{
                width: 32, height: 32,
                border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang tải lên...</span>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28 }}>📁</div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>
                  Kéo thả hoặc click để thêm ảnh
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Có thể chọn nhiều ảnh cùng lúc · {images.length}/{maxImages}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}

const overlayBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: '#fff',
  borderRadius: 6,
  padding: '3px 8px',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 700,
};

