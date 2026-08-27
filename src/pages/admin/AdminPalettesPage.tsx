import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaletteItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';

export const AdminPalettesPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { palettes, deletePalette } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return palettes.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [palettes, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove palette "${title}"?`)) {
      deletePalette(id);
      logActivity('Deleted Palette', `Removed palette "${title}"`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Palette Systems Manager
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Manage {palettes.length.toLocaleString()} structured 5-tone palette systems and tokens.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10 }} />
            <input
              type="text"
              placeholder="Search palette title or slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '6px 12px 6px 32px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                width: '260px',
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              padding: '6px 10px',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Categories</option>
            <option value="editorial">Editorial</option>
            <option value="minimal">Minimal</option>
            <option value="nature">Nature</option>
            <option value="architectural">Architectural</option>
            <option value="vintage">Vintage</option>
            <option value="vibrant">Vibrant</option>
            <option value="monochrome">Monochrome</option>
            <option value="dark-mode">Dark Mode</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {filtered.length.toLocaleString()} PALETTES MATCHED
        </div>
      </div>

      {/* Dense Table */}
      <div
        className="admin-table-container"
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <th style={{ padding: '10px 14px' }}>SPECTRUM STRIP</th>
              <th style={{ padding: '10px 14px' }}>TITLE</th>
              <th style={{ padding: '10px 14px' }}>CATEGORY</th>
              <th style={{ padding: '10px 14px' }}>SWATCHES</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((palette) => (
              <tr key={palette.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', width: '90px', height: '22px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    {palette.colors.map((c, i) => (
                      <div key={i} style={{ flex: 1, backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{palette.title}</td>
                <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{palette.category}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {palette.colors.map((c) => c.hex).join(' • ')}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(palette.id, palette.title)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      color: '#F87171',
                      cursor: 'pointer',
                    }}
                    title="Delete Palette"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-1)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            PAGE {currentPage} OF {totalPages}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
