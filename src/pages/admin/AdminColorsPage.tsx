import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  Eye,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ColorItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import {
  hexToRgb,
  hexToHsl,
  hslToHex,
  getContrastRatio,
  hexToOklch,
} from '../../utils/colorUtils';

export const AdminColorsPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { colors, addColor, updateColor, deleteColor } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Editor Modal State
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formHex, setFormHex] = useState('#3B82F6');
  const [formFamily, setFormFamily] = useState('cool');
  const [formHueGroup, setFormHueGroup] = useState('blue');
  const [formTone, setFormTone] = useState('medium');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('interface, primary, digital');

  const filteredColors = useMemo(() => {
    return colors.filter((c) => {
      if (selectedFamily !== 'all' && c.family !== selectedFamily) return false;
      if (selectedTone !== 'all' && c.tone !== selectedTone) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchHex = c.hex.toLowerCase().includes(q);
        const matchSlug = c.slug.toLowerCase().includes(q);
        if (!matchName && !matchHex && !matchSlug) return false;
      }
      return true;
    });
  }, [colors, selectedFamily, selectedTone, searchQuery]);

  const totalPages = Math.ceil(filteredColors.length / pageSize) || 1;
  const paginatedColors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredColors.slice(start, start + pageSize);
  }, [filteredColors, currentPage, pageSize]);

  // Derived calculations for form
  const contrastWhite = getContrastRatio(formHex, '#FFFFFF');
  const contrastBlack = getContrastRatio(formHex, '#000000');
  const bestTextColor = contrastWhite >= 4.5 ? '#FFFFFF' : '#111111';
  const calculatedRgb = hexToRgb(formHex);
  const rgbString = calculatedRgb ? `rgb(${calculatedRgb.r}, ${calculatedRgb.g}, ${calculatedRgb.b})` : 'rgb(0, 0, 0)';
  const calculatedHsl = hexToHsl(formHex);
  const hslString = calculatedHsl ? `hsl(${calculatedHsl.h}, ${calculatedHsl.s}%, ${calculatedHsl.l}%)` : 'hsl(0, 0%, 0%)';
  const oklchString = hexToOklch(formHex);

  // Duplicate warning
  const duplicateMatch = useMemo(() => {
    return colors.find(
      (c) => c.hex.toUpperCase() === formHex.toUpperCase() && c.id !== editingColor?.id
    );
  }, [colors, formHex, editingColor]);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingColor(null);
    setFormName('New Specimen');
    setFormHex('#3B82F6');
    setFormFamily('cool');
    setFormHueGroup('blue');
    setFormTone('medium');
    setFormDescription('A calibrated color specimen for digital applications.');
    setFormTags('digital, primary, specimen');
  };

  const handleOpenEdit = (color: ColorItem) => {
    setIsCreating(false);
    setEditingColor(color);
    setFormName(color.name);
    setFormHex(color.hex);
    setFormFamily(color.family);
    setFormHueGroup(color.hueGroup);
    setFormTone(color.tone);
    setFormDescription(color.description);
    setFormTags(color.tags.join(', '));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (isCreating) {
      const newColor: ColorItem = {
        id: `c-custom-${Date.now()}`,
        slug,
        name: formName,
        hex: formHex.toUpperCase(),
        rgb: rgbString,
        hsl: hslString,
        oklch: oklchString,
        family: formFamily,
        hueGroup: formHueGroup,
        tone: formTone,
        description: formDescription,
        usageNotes: 'Administrative curated record.',
        tags: tagArray,
        contrastWithWhite: contrastWhite,
        contrastWithBlack: contrastBlack,
        bestTextColor,
        complementaryHex: hslToHex((calculatedHsl?.h || 0 + 180) % 360, calculatedHsl?.s || 50, calculatedHsl?.l || 50),
        analogousHexes: [
          hslToHex((calculatedHsl?.h || 0 + 30) % 360, calculatedHsl?.s || 50, calculatedHsl?.l || 50),
          hslToHex((calculatedHsl?.h || 0 + 330) % 360, calculatedHsl?.s || 50, calculatedHsl?.l || 50),
        ],
        triadicHexes: [
          hslToHex((calculatedHsl?.h || 0 + 120) % 360, calculatedHsl?.s || 50, calculatedHsl?.l || 50),
          hslToHex((calculatedHsl?.h || 0 + 240) % 360, calculatedHsl?.s || 50, calculatedHsl?.l || 50),
        ],
        shades: [],
      };

      addColor(newColor);
      logActivity('Created Color', `Added specimen "${formName}" (${formHex.toUpperCase()})`);
    } else if (editingColor) {
      const updatedItem: ColorItem = {
        ...editingColor,
        name: formName,
        hex: formHex.toUpperCase(),
        rgb: rgbString,
        hsl: hslString,
        oklch: oklchString,
        family: formFamily,
        hueGroup: formHueGroup,
        tone: formTone,
        description: formDescription,
        tags: tagArray,
        contrastWithWhite: contrastWhite,
        contrastWithBlack: contrastBlack,
        bestTextColor,
      };
      updateColor(updatedItem);
      logActivity('Updated Color', `Modified specimen "${formName}" (${formHex.toUpperCase()})`);
    }

    setEditingColor(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove specimen "${name}"?`)) {
      deleteColor(id);
      logActivity('Deleted Color', `Removed specimen "${name}"`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Color Specimen Library
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Manage {colors.length.toLocaleString()} master colors across OKLCH, HSL, and sRGB gamuts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.82rem' }}
        >
          <Plus size={15} />
          <span>New Color Specimen</span>
        </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10 }} />
            <input
              type="text"
              placeholder="Search name, hex, slug..."
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
            value={selectedFamily}
            onChange={(e) => {
              setSelectedFamily(e.target.value);
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
            <option value="all">All Families</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="neutral">Neutral</option>
            <option value="earth">Earth</option>
            <option value="pastel">Pastel</option>
            <option value="vibrant">Vibrant</option>
            <option value="deep">Deep</option>
          </select>

          <select
            value={selectedTone}
            onChange={(e) => {
              setSelectedTone(e.target.value);
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
            <option value="all">All Tones</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark">Dark</option>
            <option value="muted">Muted</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {filteredColors.length.toLocaleString()} SPECIMENS MATCHED
        </div>
      </div>

      {/* Dense Table */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <th style={{ padding: '10px 14px' }}>SWATCH</th>
              <th style={{ padding: '10px 14px' }}>NAME</th>
              <th style={{ padding: '10px 14px' }}>HEX</th>
              <th style={{ padding: '10px 14px' }}>FAMILY</th>
              <th style={{ padding: '10px 14px' }}>SPECTRUM</th>
              <th style={{ padding: '10px 14px' }}>TONE</th>
              <th style={{ padding: '10px 14px' }}>WCAG CONTRAST</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedColors.map((color) => (
              <tr
                key={color.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 100ms ease',
                }}
              >
                <td style={{ padding: '10px 14px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '24px',
                      borderRadius: '3px',
                      backgroundColor: color.hex,
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{color.name}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{color.hex}</td>
                <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{color.family}</td>
                <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{color.hueGroup}</td>
                <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{color.tone}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  W: {color.contrastWithWhite}:1 | B: {color.contrastWithBlack}:1
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(color)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                      title="Edit Color"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(color.id, color.name)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        color: '#F87171',
                        cursor: 'pointer',
                      }}
                      title="Delete Color"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
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

      {/* Create / Edit Modal */}
      {(editingColor || isCreating) && (
        <div className="modal-backdrop" onClick={() => { setEditingColor(null); setIsCreating(false); }}>
          <div
            className="search-dialog-card"
            style={{ maxWidth: '640px', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isCreating ? 'Create Color Specimen' : `Edit Specimen: ${editingColor?.name}`}
              </h2>
              <button
                onClick={() => { setEditingColor(null); setIsCreating(false); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {duplicateMatch && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(233, 196, 106, 0.15)',
                  border: '1px solid rgba(233, 196, 106, 0.3)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '10px 12px',
                  color: '#E9C46A',
                  fontSize: '0.78rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Duplicate Notice:</strong> Hex {formHex} already exists as &ldquo;{duplicateMatch.name}&rdquo;.
                </span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Live Color Preview Stage */}
              <div
                style={{
                  height: '110px',
                  backgroundColor: formHex,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: bestTextColor,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    LIVE PREVIEW
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {oklchString}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formName || 'Untitled'}</div>
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {formHex} • {rgbString}
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Color Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '8px 10px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    HEX Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formHex}
                    onChange={(e) => setFormHex(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '8px 10px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Family
                  </label>
                  <select
                    value={formFamily}
                    onChange={(e) => setFormFamily(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '8px 10px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="neutral">Neutral</option>
                    <option value="earth">Earth</option>
                    <option value="pastel">Pastel</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Tone
                  </label>
                  <select
                    value={formTone}
                    onChange={(e) => setFormTone(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '8px 10px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                    <option value="muted">Muted</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              {/* Calculated WCAG Health Strip */}
              <div
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div>Contrast On White: <strong>{contrastWhite}:1</strong> ({contrastWhite >= 4.5 ? 'AA Pass' : 'Fail'})</div>
                <div>Contrast On Black: <strong>{contrastBlack}:1</strong> ({contrastBlack >= 4.5 ? 'AA Pass' : 'Fail'})</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setEditingColor(null); setIsCreating(false); }}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  {isCreating ? 'Create Color' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
