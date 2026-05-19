'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Check, Search, MapPin, Loader2 } from 'lucide-react';
import { regionApi, ProvinceDTO, WardDTO } from '@/lib/api';

interface LocationSelectorProps {
  selectedWardIds: number[];
  onChange: (wardIds: number[]) => void;
}

export default function LocationSelector({ selectedWardIds, onChange }: LocationSelectorProps) {
  const [hierarchy, setHierarchy] = useState<ProvinceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProvinces, setExpandedProvinces] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const data = await regionApi.getHierarchy();
        setHierarchy(data);
      } catch (error) {
        console.error('Failed to fetch hierarchy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const toggleProvince = (id: number) => {
    setExpandedProvinces(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWardToggle = (wardId: number) => {
    const id = Number(wardId);
    const currentSelected = (selectedWardIds || []).map(Number);
    const newSelection = currentSelected.includes(id)
      ? currentSelected.filter(sid => sid !== id)
      : [...currentSelected, id];
    onChange(newSelection);
  };

  const handleProvinceToggle = (province: ProvinceDTO) => {
    const fullProvince = hierarchy.find(p => p.id === province.id) || province;
    const wardIds = (fullProvince.wards || []).map(w => Number(w.id));
    
    if (wardIds.length === 0) {
      alert(`Không tìm thấy xã/phường nào trong tỉnh ${province.name}. Vui lòng kiểm tra lại dữ liệu.`);
      return;
    }

    const currentSelected = (selectedWardIds || []).map(Number);
    const allSelected = wardIds.every(id => currentSelected.includes(id));
    
    if (allSelected) {
      onChange(currentSelected.filter(id => !wardIds.includes(id)));
    } else {
      const uniqueNewIds = wardIds.filter(id => !currentSelected.includes(id));
      onChange([...currentSelected, ...uniqueNewIds]);
    }
  };

  const filteredHierarchy = useMemo(() => {
    if (!searchQuery) return hierarchy;
    
    const query = searchQuery.toLowerCase();
    return hierarchy.map(p => {
      const filteredWards = (p.wards || []).filter(w => w.name.toLowerCase().includes(query));
      const provinceMatches = p.name.toLowerCase().includes(query);
      
      if (provinceMatches || filteredWards.length > 0) {
        return { ...p, wards: provinceMatches ? p.wards : filteredWards };
      }
      return null;
    }).filter(Boolean) as ProvinceDTO[];
  }, [hierarchy, searchQuery]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8 }} />
        Đang tải dữ liệu hành chính...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="search-box" style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="input-field" 
          placeholder="Tìm kiếm tỉnh, xã..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      <div style={{ 
        maxHeight: 400, 
        overflowY: 'auto', 
        border: '1px solid var(--border)', 
        borderRadius: 8,
        padding: 8,
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        {filteredHierarchy.map(province => {
          const wardIds = (province.wards || []).map(w => Number(w.id));
          const currentSelected = (selectedWardIds || []).map(Number);
          const selectedCount = wardIds.filter(id => currentSelected.includes(id)).length;
          const allPSelected = wardIds.length > 0 && wardIds.every(id => currentSelected.includes(id));
          const partialPSelected = wardIds.some(id => currentSelected.includes(id)) && !allPSelected;

          return (
            <div key={province.id} style={{ marginBottom: 4 }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                background: expandedProvinces[province.id] ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent'
              }}>
                <div onClick={() => toggleProvince(province.id)} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 8 }}>
                  {expandedProvinces[province.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span style={{ fontWeight: 600 }}>{province.name}</span>
                  {wardIds.length > 0 ? (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '1px 8px', 
                      borderRadius: 10, 
                      background: selectedCount > 0 ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(128,128,128,0.1)',
                      color: selectedCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>
                      {selectedCount}/{wardIds.length} xã
                    </span>
                  ) : (
                    <small style={{ color: 'var(--text-muted)' }}>(Trống)</small>
                  )}
                </div>
                <div 
                  onClick={(e) => { e.stopPropagation(); handleProvinceToggle(province); }}
                  style={{ 
                    width: 22, height: 22, border: '2px solid var(--border)', borderRadius: 6, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    background: allPSelected ? 'var(--accent)' : partialPSelected ? 'var(--accent-light)' : 'transparent',
                    borderColor: (allPSelected || partialPSelected) ? 'var(--accent)' : 'var(--border)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {allPSelected && <Check size={14} color="white" />}
                  {partialPSelected && <div style={{ width: 8, height: 2, background: 'white' }} />}
                </div>
              </div>

              {expandedProvinces[province.id] && (
                <div style={{ marginLeft: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6, padding: '8px 0' }}>
                  {(province.wards || []).map(ward => {
                    const isSelected = currentSelected.includes(Number(ward.id));
                    return (
                      <div 
                        key={ward.id} 
                        onClick={() => handleWardToggle(ward.id)}
                        style={{ 
                          display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                          fontSize: '0.9rem', color: isSelected ? 'var(--accent)' : 'var(--text)',
                          background: isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ 
                          width: 16, height: 16, border: '1px solid var(--border)', borderRadius: 4, 
                          marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                        }}>
                          {isSelected && <Check size={12} color="white" />}
                        </div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ward.name}>
                          {ward.name}
                        </span>
                        {ward.regionId && !isSelected && (
                          <small style={{ fontSize: '0.7rem', marginLeft: 6, color: 'var(--text-muted)' }}>
                            ({ward.regionName})
                          </small>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filteredHierarchy.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
            <MapPin size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p>{searchQuery ? 'Không tìm thấy địa điểm phù hợp' : 'Không có dữ liệu địa lý.'}</p>
          </div>
        )}
      </div>
      
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
        <span>Đã chọn: <strong>{selectedWardIds.length}</strong> xã/phường</span>
        <button 
          type="button" 
          onClick={() => onChange([])}
          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
        >
          Bỏ chọn tất cả
        </button>
      </div>
    </div>
  );
}
