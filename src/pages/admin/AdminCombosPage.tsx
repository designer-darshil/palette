import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComboItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';

export const AdminCombosPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { combos, deleteCombo } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHarmony, setSelectedHarmony] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return combos.filter((cb) => {
      if (selectedHarmony !== 'all' && cb.harmonyType !== selectedHarmony) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!cb.title.toLowerCase().includes(q) && !cb.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [combos, selectedHarmony, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove harmony combination "${title}"?`)) {
      deleteCombo(id);
      logActivity('Deleted Combo', `Removed harmony "${title}"`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Color Harmonies &amp; Combos
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Manage {combos.length.toLocaleString()} relational pairings with surface roles and WCAG AAA compliance.
          </p>
        </div>
      </div>

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
              placeholder="Search combos..."
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
                width: '240px',
              }}
            />
          </div>

          <select
            value={selectedHarmony}
            onChange={(e) => {
              setSelectedHarmony(e.target.value);
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
            <option value="all">All Harmonies</option>
            <option value="Complementary">Complementary</option>
            <option value="Triadic">Triadic</option>
            <option value="Analogous">Analogous</option>
            <option value="Split Complementary">Split Complementary</option>
            <option value="Warm & Cool">Warm &amp; Cool</option>
            <option value="Monochromatic">Monochromatic</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {filtered.length.toLocaleString()} COMBOS MATCHED
        </div>
      </div>

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
              <th style={{ padding: '10px 14px' }}>SWATCHES</th>
              <th style={{ padding: '10px 14px' }}>TITLE</th>
              <th style={{ padding: '10px 14px' }}>HARMONY TYPE</th>
              <th style={{ padding: '10px 14px' }}>CONTRAST</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((combo) => (
              <tr key={combo.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', width: '80px', height: '22px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    {combo.colors.map((c, i) => (
                      <div key={i} style={{ flex: 1, backgroundColor: c.hex }} title={`${c.role}: ${c.hex}`} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{combo.title}</td>
                <td style={{ padding: '10px 14px' }}>{combo.harmonyType}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{combo.contrastScore}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(combo.id, combo.title)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      color: '#F87171',
                      cursor: 'pointer',
                    }}
                    title="Delete Combo"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
          <div>PAGE {currentPage} OF {totalPages}</div>
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
