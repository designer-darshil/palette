import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { ColorItem } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';
import {
  hexToRgb,
  hexToHsl,
  hslToHex,
  getContrastRatio,
  getTextColorForBackground,
  hexToOklch,
  copyToClipboard,
} from '../../utils/colorUtils';

export const AdminColorsPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { colors, addColor, updateColor, deleteColor } = useLibraryData();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 18 : 25;

  // Modals
  const [inspectColor, setInspectColor] = useState<ColorItem | null>(null);
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formHex, setFormHex] = useState('#34C759');
  const [formFamily, setFormFamily] = useState('cool');
  const [formHueGroup, setFormHueGroup] = useState('green');
  const [formTone, setFormTone] = useState('medium');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('digital, primary, specimen');

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
  const bestTextColor = getTextColorForBackground(formHex);
  const calculatedRgb = hexToRgb(formHex);
  const rgbString = calculatedRgb ? `${calculatedRgb.r} / ${calculatedRgb.g} / ${calculatedRgb.b}` : '0 / 0 / 0';
  const calculatedHsl = hexToHsl(formHex);
  const hslString = calculatedHsl ? `hsl(${calculatedHsl.h}, ${calculatedHsl.s}%, ${calculatedHsl.l}%)` : 'hsl(0, 0%, 0%)';
  const oklchString = hexToOklch(formHex);

  const handleCopy = async (hex: string) => {
    await copyToClipboard(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingColor(null);
    setFormName('New Specimen');
    setFormHex('#34C759');
    setFormFamily('cool');
    setFormHueGroup('green');
    setFormTone('medium');
    setFormDescription('Calibrated chromatic color specimen for digital applications.');
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
        rgb: `rgb(${rgbString.replace(/ \/ /g, ', ')})`,
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
        rgb: `rgb(${rgbString.replace(/ \/ /g, ', ')})`,
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
    if (confirm(`Remove specimen "${name}" from master library?`)) {
      deleteColor(id);
      logActivity('Deleted Color', `Removed specimen "${name}"`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Color Specimen Archive
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
            {colors.length.toLocaleString()} calibrated specimens across OKLCH, HSL, and sRGB gamuts.
          </p>
        </div>

        <KromaButton
          onClick={handleOpenCreate}
          variant="filled"
          size="sm"
          iconLeft={<Plus size={14} />}
        >
          New Color Specimen
        </KromaButton>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#707070]" />
            <input
              type="text"
              placeholder="Search name, HEX, slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
            />
          </div>

          <select
            value={selectedFamily}
            onChange={(e) => {
              setSelectedFamily(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
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
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Tones</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark">Dark</option>
            <option value="muted">Muted</option>
          </select>
        </div>

        {/* View Mode Toggle & Count */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#707070] dark:text-[#9DA3AF]">
            {filteredColors.length.toLocaleString()} SPECIMENS
          </span>

          <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-xs gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Visual Archive Grid"
              className={`p-1 rounded-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#181A20] text-[#171717] dark:text-[#F8F8F8] shadow-xs'
                  : 'text-[#707070]'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Editorial Data Table"
              className={`p-1 rounded-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#181A20] text-[#171717] dark:text-[#F8F8F8] shadow-xs'
                  : 'text-[#707070]'
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: HYBRID VISUAL ARCHIVE OR EDITORIAL DATA TABLE */}
      {viewMode === 'grid' ? (
        /* VISUAL COLOR ARCHIVE */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {paginatedColors.map((color) => {
            const rgb = hexToRgb(color.hex);
            const rgbDisplay = rgb ? `${rgb.r} / ${rgb.g} / ${rgb.b}` : color.rgb;

            return (
              <div
                key={color.id}
                className="bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs overflow-hidden flex flex-col justify-between"
              >
                {/* Large Prominent Color Field */}
                <div
                  className="w-full h-28 cursor-pointer relative group flex items-end p-2 transition-transform duration-200"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setInspectColor(color)}
                >
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-xs backdrop-blur-md font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: color.bestTextColor === '#FFFFFF' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                      color: color.bestTextColor,
                    }}
                  >
                    Inspect
                  </span>
                </div>

                {/* Data & Real Metadata */}
                <div className="p-3 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#171717] dark:text-[#F8F8F8] truncate">
                      {color.name}
                    </h3>
                    <div className="flex justify-between items-center font-mono text-[11px] mt-0.5 text-[#171717] dark:text-[#F8F8F8]">
                      <span className="font-semibold">{color.hex}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(color.hex)}
                        title="Copy HEX"
                        className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors"
                      >
                        {copiedHex === color.hex ? <Check size={11} className="text-[#34C759]" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-[#707070] dark:text-[#9DA3AF] space-y-0.5 pt-1.5 border-t border-black/5 dark:border-white/5">
                    <div className="flex justify-between">
                      <span>RGB</span>
                      <span className="truncate">{rgbDisplay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CONTRAST</span>
                      <span>W {color.contrastWithWhite}:1</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setInspectColor(color)}
                      className="text-[10.5px] font-mono text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                    >
                      VIEW
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(color)}
                        aria-label="Edit"
                        className="p-1 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(color.id, color.name)}
                        aria-label="Delete"
                        className="p-1 text-[#707070] hover:text-[#FF3B30]"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EDITORIAL DATA TABLE */
        <div className="admin-table-container">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-[10.5px] text-[#707070] dark:text-[#9DA3AF]">
                <th className="py-2.5 px-4 font-semibold">SWATCH</th>
                <th className="py-2.5 px-4 font-semibold">SPECIMEN NAME</th>
                <th className="py-2.5 px-4 font-semibold">HEX</th>
                <th className="py-2.5 px-4 font-semibold">RGB</th>
                <th className="py-2.5 px-4 font-semibold">SPECTRUM</th>
                <th className="py-2.5 px-4 font-semibold">TONE</th>
                <th className="py-2.5 px-4 font-semibold">WCAG CONTRAST</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {paginatedColors.map((color) => {
                const rgb = hexToRgb(color.hex);
                const rgbDisplay = rgb ? `${rgb.r} / ${rgb.g} / ${rgb.b}` : color.rgb;

                return (
                  <tr
                    key={color.id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2 px-4">
                      <div
                        className="w-7 h-5 rounded-xs border border-black/15 dark:border-white/15 cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setInspectColor(color)}
                      />
                    </td>
                    <td className="py-2 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                      {color.name}
                    </td>
                    <td className="py-2 px-4 font-mono font-medium">{color.hex}</td>
                    <td className="py-2 px-4 font-mono text-[#707070] dark:text-[#9DA3AF]">{rgbDisplay}</td>
                    <td className="py-2 px-4 capitalize">{color.hueGroup}</td>
                    <td className="py-2 px-4 capitalize">{color.tone}</td>
                    <td className="py-2 px-4 font-mono text-[11px] text-[#707070] dark:text-[#9DA3AF]">
                      W: {color.contrastWithWhite}:1 | B: {color.contrastWithBlack}:1
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(color.hex)}
                          title="Copy HEX"
                          className="p-1 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(color)}
                          title="Edit"
                          className="p-1 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(color.id, color.name)}
                          title="Delete"
                          className="p-1 text-[#707070] hover:text-[#FF3B30]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex justify-between items-center text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
        <div>
          PAGE {currentPage} OF {totalPages}
        </div>
        <div className="flex gap-2">
          <KromaButton
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            iconLeft={<ChevronLeft size={13} />}
            className="!py-1 !px-2.5 !text-xs"
          >
            Prev
          </KromaButton>
          <KromaButton
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            iconRight={<ChevronRight size={13} />}
            className="!py-1 !px-2.5 !text-xs"
          >
            Next
          </KromaButton>
        </div>
      </div>

      {/* Inspect Color Modal */}
      {inspectColor && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectColor(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-md w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold">{inspectColor.name}</h2>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  Slug: {inspectColor.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectColor(null)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Specimen Field Swatch */}
            <div
              className="w-full h-32 rounded-xs flex items-end p-3 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: inspectColor.hex }}
            >
              <span
                className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs"
                style={{
                  backgroundColor: inspectColor.bestTextColor === '#FFFFFF' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                  color: inspectColor.bestTextColor,
                }}
              >
                {inspectColor.hex}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#707070]">RGB</span>
                <span>{inspectColor.rgb}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#707070]">HSL</span>
                <span>{inspectColor.hsl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#707070]">OKLCH</span>
                <span>{inspectColor.oklch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#707070]">CONTRAST (WHITE)</span>
                <span>{inspectColor.contrastWithWhite}:1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#707070]">CONTRAST (BLACK)</span>
                <span>{inspectColor.contrastWithBlack}:1</span>
              </div>
            </div>

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed">
              {inspectColor.description}
            </p>

            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopy(inspectColor.hex)}
                iconLeft={copiedHex === inspectColor.hex ? <Check size={12} /> : <Copy size={12} />}
              >
                {copiedHex === inspectColor.hex ? 'Copied' : 'Copy HEX'}
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={() => setInspectColor(null)}
              >
                Done
              </KromaButton>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Specimen Modal */}
      {(isCreating || editingColor) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsCreating(false);
            setEditingColor(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold">
                {isCreating ? 'Create Color Specimen' : `Edit Specimen: ${editingColor?.name}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingColor(null);
                }}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Live Specimen Preview Bar */}
            <div
              className="w-full h-20 rounded-xs flex items-center justify-between p-4 border border-black/10 dark:border-white/10"
              style={{ backgroundColor: formHex }}
            >
              <div
                className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs"
                style={{
                  backgroundColor: bestTextColor === '#FFFFFF' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                  color: bestTextColor,
                }}
              >
                {formHex.toUpperCase()}
              </div>

              <div
                className="text-xs font-mono px-2 py-0.5 rounded-xs"
                style={{
                  backgroundColor: bestTextColor === '#FFFFFF' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                  color: bestTextColor,
                }}
              >
                W {contrastWhite}:1 | B {contrastBlack}:1
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-sm font-sans"
                    placeholder="e.g. Cobalt Cyan"
                  />
                </div>

                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">HEX Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formHex}
                      onChange={(e) => setFormHex(e.target.value)}
                      className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-sm font-mono uppercase"
                    />
                    <input
                      type="color"
                      value={formHex}
                      onChange={(e) => setFormHex(e.target.value)}
                      className="w-10 h-9 p-0.5 border border-black/15 dark:border-white/15 rounded-xs cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Family</label>
                  <select
                    value={formFamily}
                    onChange={(e) => setFormFamily(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs"
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
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Spectrum</label>
                  <select
                    value={formHueGroup}
                    onChange={(e) => setFormHueGroup(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs"
                  >
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="teal">Teal</option>
                    <option value="cyan">Cyan</option>
                    <option value="blue">Blue</option>
                    <option value="indigo">Indigo</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                    <option value="brown">Brown</option>
                    <option value="beige">Beige</option>
                    <option value="cream">Cream</option>
                    <option value="gray">Gray</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Tone</label>
                  <select
                    value={formTone}
                    onChange={(e) => setFormTone(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                    <option value="muted">Muted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingColor(null);
                  }}
                >
                  Cancel
                </KromaButton>
                <KromaButton
                  type="submit"
                  variant="filled"
                  size="sm"
                >
                  {isCreating ? 'Create Specimen' : 'Save Changes'}
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
