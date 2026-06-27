'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Main from '@/components/Main';
import { brandImportApi, BrandImportResult } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { Upload, FileSpreadsheet, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Download, AlertTriangle } from 'lucide-react';

type Step = 'upload' | 'map' | 'result';

interface ColumnInfo {
  index: number;
  header: string;
  sampleValues: string[];
}

const FIELD_OPTIONS: { value: string; label: string; required?: boolean }[] = [
  { value: 'code', label: 'Mã thương hiệu*', required: true },
  { value: 'name', label: 'Tên thương hiệu*', required: true },
  { value: 'logoUrl', label: 'Logo URL' },
  { value: 'bravoId', label: 'Bravo ID' },
  { value: 'isHighlight', label: 'Is Highlight' },
  { value: 'highlightPriority', label: 'Highlight Priority' },
  { value: 'status', label: 'Status' },
  { value: 'bravoSortValue', label: 'Bravo Sort Value' },
];

const REQUIRED_FIELDS = ['code', 'name'];

const FIELD_AUTO_DETECT: Record<string, string[]> = {
  code: ['mã', 'mã thương hiệu', 'code', 'brand code'],
  name: ['tên', 'tên thương hiệu', 'name', 'brand name'],
  logoUrl: ['logo', 'logo url', 'url logo', 'image'],
  bravoId: ['bravo id', 'bravo', 'mã bravo'],
  isHighlight: ['is highlight', 'highlight', 'nổi bật'],
  highlightPriority: ['highlight priority', 'priority', 'ưu tiên'],
  status: ['trạng thái', 'status'],
  bravoSortValue: ['bravo sort', 'sort value'],
};

export default function ImportBrandsPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrandImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const isAuthorized = user?.roles.some(r => ['ROLE_ADMIN', 'ROLE_COMPANY'].includes(r));
  if (!isAuthorized) {
    return (
      <>
        <Navbar />
        <Main><p>Bạn không có quyền truy cập trang này.</p></Main>
      </>
    );
  }

  const parseExcel = (data: ArrayBuffer) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
    if (rows.length === 0) { setError('File Excel rỗng'); return; }

    const startIdx = hasHeader ? 1 : 0;
    const headerRow = hasHeader ? rows[0] : rows[0].map((_, i) => `Cột ${i + 1}`);

    const cols: ColumnInfo[] = headerRow.map((h, i) => ({
      index: i,
      header: h || `Cột ${i + 1}`,
      sampleValues: [] as string[],
    }));

    for (let r = startIdx; r < Math.min(startIdx + 5, rows.length); r++) {
      if (rows[r]) {
        rows[r].forEach((val, i) => {
          if (cols[i] && cols[i].sampleValues.length < 5) {
            cols[i].sampleValues.push(val !== undefined ? String(val) : '');
          }
        });
      }
    }

    setColumns(cols);
    setPreviewRows(rows.slice(startIdx, startIdx + 5));

    const autoMap: Record<string, number | null> = {};
    FIELD_OPTIONS.forEach(opt => {
      if (hasHeader) {
        const keywords = FIELD_AUTO_DETECT[opt.value];
        if (keywords) {
          const matched = cols.find(col => {
            const headerLower = col.header.toLowerCase().replace(/[*]/g, '').trim();
            return keywords.some(kw => headerLower.includes(kw) || kw.includes(headerLower));
          });
          autoMap[opt.value] = matched?.index ?? null;
        } else {
          autoMap[opt.value] = null;
        }
      } else {
        autoMap[opt.value] = null;
      }
    });
    setMappings(autoMap);
    setError('');
  };

  const handleFileSelect = (f: File) => {
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setError('Vui lòng chọn file .xlsx hoặc .xls');
      return;
    }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) parseExcel(e.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const validateMapping = (): string | null => {
    const usedCols = new Set<number>();
    for (const [field, colIdx] of Object.entries(mappings)) {
      if (colIdx === null || colIdx === undefined) continue;
      if (usedCols.has(colIdx)) {
        const col = columns.find(c => c.index === colIdx);
        return `Cột "${col?.header || colIdx}" được chọn bởi nhiều trường`;
      }
      usedCols.add(colIdx);
    }
    for (const req of REQUIRED_FIELDS) {
      if (mappings[req] === null || mappings[req] === undefined) {
        const opt = FIELD_OPTIONS.find(o => o.value === req);
        return `Thiếu trường bắt buộc: ${opt?.label}`;
      }
    }
    return null;
  };

  const handleImport = async () => {
    const validationError = validateMapping();
    if (validationError) { setError(validationError); return; }
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const colMappings: Record<string, string> = {};
      Object.entries(mappings).forEach(([field, colIdx]) => {
        if (colIdx === null || colIdx === undefined) return;
        if (hasHeader) {
          const col = columns.find(c => c.index === colIdx);
          if (col) colMappings[col.header] = field;
        } else {
          colMappings[`col_${colIdx}`] = field;
        }
      });

      const res = await brandImportApi.importBrands(file, {
        columnMappings: colMappings,
        hasHeaderRow: hasHeader,
        sheetIndex: 0,
      });
      setResult(res);
      setStep('result');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Main maxWidth={1000}>
        <div className="fade-in-up" style={{ marginBottom: 32 }}>
          <Link href="/brands" style={{ color: 'var(--accent-light)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ArrowLeft size={16} /> Quay lại danh sách thương hiệu
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>
            <Upload size={28} style={{ marginRight: 12, verticalAlign: 'middle' }} />
            <span className="gradient-text">Import thương hiệu từ Excel</span>
          </h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
          {(['upload', 'map', 'result'] as Step[]).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
                background: step === s ? 'var(--accent)' : s === 'map' && step === 'upload' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)',
                color: step === s ? 'white' : s === 'map' && step === 'upload' ? 'var(--accent-light)' : 'var(--text-muted)',
              }}>{i + 1}</div>
              <span style={{
                fontSize: '0.85rem', fontWeight: step === s ? 600 : 400,
                color: step === s ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                {s === 'upload' ? 'Tải file' : s === 'map' ? 'Map cột' : 'Kết quả'}
              </span>
              {i < 2 && <div style={{ width: 40, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="fade-in-up">
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 16, padding: '60px 40px', textAlign: 'center',
                background: file ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
              {file ? (
                <div>
                  <FileSpreadsheet size={48} style={{ color: 'var(--accent-light)', marginBottom: 16 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {(file.size / 1024).toFixed(1)} KB — Nhấn để chọn file khác
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Kéo thả file Excel vào đây</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>hoặc nhấn để chọn file (.xlsx, .xls)</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} />
                <span style={{ fontSize: '0.9rem' }}>Dòng đầu là tiêu đề</span>
              </label>
              <a
                href={brandImportApi.downloadTemplateUrl}
                className="btn-outline"
                style={{ marginLeft: 'auto', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Download size={16} /> Tải template mẫu
              </a>
            </div>

            {error && <div className="alert-error" style={{ marginTop: 16 }}>{error}</div>}

            {columns.length > 0 && (
              <div className="glass-card" style={{ marginTop: 24, padding: 20, overflow: 'auto' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
                  Xem trước dữ liệu ({previewRows.length} dòng)
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      {columns.map(col => (
                        <th key={col.index} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr key={ri}>
                        {columns.map(col => (
                          <td key={col.index} style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                            {row[col.index] !== undefined ? String(row[col.index]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => router.push('/brands')}>Hủy</button>
              <button className="btn-primary" disabled={!file || columns.length === 0} onClick={() => setStep('map')}>
                Tiếp theo <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Map columns */}
        {step === 'map' && (
          <div className="fade-in-up">
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Chọn cột Excel cho từng trường thương hiệu</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                Với mỗi trường thương hiệu (cố định bên trái), chọn cột Excel tương ứng.
                Trường có <span style={{ color: '#ef4444' }}>*</span> là bắt buộc.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Trường thương hiệu</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Dữ liệu mẫu</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Cột Excel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIELD_OPTIONS.map(opt => {
                      const selectedCol = mappings[opt.value];
                      const sampleText = selectedCol !== null && selectedCol !== undefined
                        ? columns.find(c => c.index === selectedCol)?.sampleValues.slice(0, 2).join(', ') || '—'
                        : '—';
                      return (
                        <tr key={opt.value}>
                          <td style={{ padding: '10px 16px', fontWeight: opt.required ? 700 : 400, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {opt.required ? <span style={{ color: '#ef4444' }}>* </span> : null}
                            {opt.label}
                          </td>
                          <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {sampleText}
                          </td>
                          <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <select
                              className="input-field"
                              value={selectedCol !== null && selectedCol !== undefined ? String(selectedCol) : ''}
                              onChange={e => {
                                const val = e.target.value;
                                setMappings(prev => ({ ...prev, [opt.value]: val ? Number(val) : null }));
                              }}
                              style={{ width: 300 }}
                            >
                              <option value="">-- Bỏ qua --</option>
                              {columns.map(col => (
                                <option key={col.index} value={col.index}>{col.header}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {REQUIRED_FIELDS.map(f => {
                  const has = mappings[f] !== null && mappings[f] !== undefined;
                  const opt = FIELD_OPTIONS.find(o => o.value === f);
                  return (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                      {has ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                      <span style={{ color: has ? '#10b981' : '#ef4444' }}>{opt?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <div className="alert-error" style={{ marginTop: 16 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setStep('upload')}><ArrowLeft size={16} style={{ marginRight: 6 }} /> Quay lại</button>
              <button className="btn-primary" disabled={loading} onClick={handleImport}>
                {loading ? 'Đang import...' : 'Thực hiện import'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && result && (
          <div className="fade-in-up">
            <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
              {result.errorCount === 0 ? (
                <div style={{ color: '#10b981' }}>
                  <CheckCircle2 size={64} style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Import thành công!</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Đã import <strong>{result.successCount}</strong> / {result.totalRows} thương hiệu
                  </p>
                </div>
              ) : (
                <div>
                  <AlertTriangle size={64} style={{ margin: '0 auto 16px', color: '#f59e0b' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Import hoàn tất</h2>
                  <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{result.successCount}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thành công</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{result.errorCount}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lỗi</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{result.totalRows}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {result.rowResults.filter((r: { success: boolean }) => !r.success).length > 0 && (
              <div className="glass-card" style={{ padding: 20, overflow: 'auto' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, color: '#ef4444' }}>
                  <XCircle size={16} style={{ marginRight: 8 }} /> Chi tiết lỗi
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Dòng</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rowResults.filter((r: { success: boolean }) => !r.success).map((r: { rowIndex: number; message: string }) => (
                      <tr key={r.rowIndex}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600, fontFamily: 'monospace' }}>
                          #{r.rowIndex}
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#ef4444' }}>
                          {r.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.rowResults.filter((r: { success: boolean }) => r.success).length > 0 && (
              <div className="glass-card" style={{ padding: 20, marginTop: 16, overflow: 'auto' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, color: '#10b981' }}>
                  <CheckCircle2 size={16} style={{ marginRight: 8 }} /> Thương hiệu đã import
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Dòng</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Thương hiệu</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rowResults.filter((r: { success: boolean }) => r.success).map((r: { rowIndex: number; brandId?: number; brandName?: string }) => (
                      <tr key={r.rowIndex}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace' }}>#{r.rowIndex}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600 }}>{r.brandName}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>{r.brandId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => { setStep('upload'); setFile(null); setColumns([]); setMappings({}); setResult(null); }}>
                Import file khác
              </button>
              <Link href="/brands" className="btn-primary" style={{ textDecoration: 'none' }}>
                Quay lại danh sách thương hiệu
              </Link>
            </div>
          </div>
        )}
      </Main>
    </>
  );
}
