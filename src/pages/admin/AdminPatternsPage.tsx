import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, Eye, X, Copy, Check } from 'lucide-react';
import { PatternItem, PatternType } from '../../types';
import { CURATED_PATTERNS } from '../../data/patterns';
import { generatePatternSvg, generatePatternCss } from '../../utils/patternEngine';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { KromaButton } from '../../components/common/KromaButton';
import { copyToClipboard } from '../../utils/colorUtils';

export const AdminPatternsPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const [patterns, setPatterns] = useState<PatternItem[]>(() => {
    try {
      const stored = localStorage.getItem('kroma_admin_patterns');
      if (stored) return JSON.parse(stored);
    } catch {}
    return CURATED_PATTERNS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Modals
  const [inspectPattern, setInspectPattern] = useState<PatternItem | null>(null);
  const [editingPattern, setEditingPattern] = useState<PatternItem | null>(null);
  const [copiedCss, setCopiedCss] = useState(false);

  // Edit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Editorial');
  const [formType, setFormType] = useState<PatternType>('grid');
  const [formScale, setFormScale] = useState(40);
  const [formDensity, setFormDensity] = useState(60);
  const [formRotation, setFormRotation] = useState(0);
  const [formStrokeWidth, setFormStrokeWidth] = useState(1.5);
  const [formOpacity, setFormOpacity] = useState(0.85);

  const filtered = useMemo(() => {
    return patterns.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [patterns, selectedCategory, selectedType, searchQuery]);

  const persistPatterns = (next: PatternItem[]) => {
    setPatterns(next);
    localStorage.setItem('kroma_admin_patterns', JSON.stringify(next));
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove pattern "${title}"?`)) {
      const next = patterns.filter((p) => p.id !== id);
      persistPatterns(next);
      logActivity('Deleted Pattern', `Removed pattern "${title}"`);
    }
  };

  const handleOpenEdit = (p: PatternItem) => {
    setEditingPattern(p);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormType(p.type);
    setFormScale(p.scale);
    setFormDensity(p.density);
    setFormRotation(p.rotation);
    setFormStrokeWidth(p.strokeWidth ?? 1.5);
    setFormOpacity(p.opacity ?? 0.85);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPattern) return;

    const updated: PatternItem = {
      ...editingPattern,
      title: formTitle.trim(),
      category: formCategory,
      type: formType,
      scale: formScale,
      density: formDensity,
      rotation: formRotation,
      strokeWidth: formStrokeWidth,
      opacity: formOpacity,
    };

    const next = patterns.map((p) => (p.id === updated.id ? updated : p));
    persistPatterns(next);
    logActivity('Updated Pattern', `Modified pattern specs for "${updated.title}"`);
    setEditingPattern(null);
  };

  const handleCopyCss = async (p: PatternItem) => {
    const css = generatePatternCss({
      type: p.type,
      palette: p.palette,
      scale: p.scale,
      density: p.density,
      rotation: p.rotation,
      strokeWidth: p.strokeWidth,
      opacity: p.opacity,
    });
    await copyToClipboard(css);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Pattern Management
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
            Direct mathematical SVG rendering and specifications for {patterns.length} curated patterns.
          </p>
        </div>

        <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
          {filtered.length} PATTERNS ACTIVE
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#707070]" />
            <input
              type="text"
              placeholder="Search pattern title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Editorial">Editorial</option>
            <option value="Organic">Organic</option>
            <option value="Modernist">Modernist</option>
            <option value="Craft">Craft</option>
            <option value="Architectural">Architectural</option>
            <option value="Minimal">Minimal</option>
            <option value="Optical">Optical</option>
            <option value="Technical">Technical</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Geometry Types</option>
            <option value="grid">Grid</option>
            <option value="dots">Dots</option>
            <option value="waves">Waves</option>
            <option value="isometric">Isometric</option>
            <option value="tessellation">Tessellation</option>
            <option value="topography">Topography</option>
            <option value="geometric">Geometric</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <span className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono">
            No patterns found
          </span>
        )}
      </div>

      {/* Visual Pattern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((pattern) => {
          // Render real SVG preview
          const svgString = generatePatternSvg(
            {
              type: pattern.type,
              palette: pattern.palette,
              scale: pattern.scale,
              density: pattern.density,
              rotation: pattern.rotation,
              strokeWidth: pattern.strokeWidth,
              opacity: pattern.opacity,
            },
            360,
            160
          );

          return (
            <div
              key={pattern.id}
              className="bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Pattern Visual Preview */}
              <div
                className="w-full h-36 border-b border-black/10 dark:border-white/10 overflow-hidden relative cursor-pointer group"
                onClick={() => setInspectPattern(pattern)}
                dangerouslySetInnerHTML={{ __html: svgString }}
              />

              {/* Metadata & Actions */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#F8F8F8] leading-snug">
                      {pattern.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-[#707070] dark:text-[#9DA3AF]">
                      <span className="uppercase">{pattern.category}</span>
                      <span>•</span>
                      <span className="capitalize">{pattern.type}</span>
                    </div>
                  </div>

                  {/* Swatches Strip */}
                  <div className="flex rounded-xs overflow-hidden border border-black/10 dark:border-white/10 shrink-0">
                    {pattern.palette.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Technical Specs Row */}
                <div className="flex justify-between items-center text-[10px] font-mono text-[#707070] dark:text-[#9DA3AF] pt-2 border-t border-black/5 dark:border-white/5">
                  <span>SCALE: {pattern.scale}%</span>
                  <span>DENSITY: {pattern.density}%</span>
                  <span>ROT: {pattern.rotation}°</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectPattern(pattern)}
                    iconLeft={<Eye size={12} />}
                    className="!text-xs !py-1 !px-2.5 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                  >
                    View
                  </KromaButton>
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(pattern)}
                    iconLeft={<Edit2 size={12} />}
                    className="!text-xs !py-1 !px-2.5 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                  >
                    Edit
                  </KromaButton>
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pattern.id, pattern.title)}
                    iconLeft={<Trash2 size={12} />}
                    className="!text-xs !py-1 !px-2.5 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  >
                    Delete
                  </KromaButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Pattern Modal */}
      {inspectPattern && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectPattern(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-xl w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">{inspectPattern.title}</h2>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  {inspectPattern.category} · {inspectPattern.type}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectPattern(null)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Large Real SVG Preview */}
            <div
              className="w-full h-64 border border-black/10 dark:border-white/10 rounded-xs overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: generatePatternSvg(
                  {
                    type: inspectPattern.type,
                    palette: inspectPattern.palette,
                    scale: inspectPattern.scale,
                    density: inspectPattern.density,
                    rotation: inspectPattern.rotation,
                    strokeWidth: inspectPattern.strokeWidth,
                    opacity: inspectPattern.opacity,
                  },
                  560,
                  260
                ),
              }}
            />

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed">
              {inspectPattern.description}
            </p>

            <div className="flex justify-between items-center pt-2">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopyCss(inspectPattern)}
                iconLeft={copiedCss ? <Check size={12} /> : <Copy size={12} />}
              >
                {copiedCss ? 'Copied CSS' : 'Copy CSS Background'}
              </KromaButton>

              <KromaButton
                variant="filled"
                size="sm"
                onClick={() => setInspectPattern(null)}
              >
                Done
              </KromaButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pattern Modal */}
      {editingPattern && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingPattern(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold">Edit Pattern: {editingPattern.title}</h2>
              <button
                type="button"
                onClick={() => setEditingPattern(null)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-mono">
              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-sm font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs"
                  >
                    <option value="Editorial">Editorial</option>
                    <option value="Organic">Organic</option>
                    <option value="Modernist">Modernist</option>
                    <option value="Craft">Craft</option>
                    <option value="Architectural">Architectural</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Optical">Optical</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Geometry Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PatternType)}
                    className="w-full px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs"
                  >
                    <option value="grid">Grid</option>
                    <option value="dots">Dots</option>
                    <option value="waves">Waves</option>
                    <option value="geometry">Geometry</option>
                    <option value="stripes">Stripes</option>
                    <option value="lines">Lines</option>
                    <option value="shapes">Shapes</option>
                    <option value="noise">Noise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Scale ({formScale}%)</label>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={formScale}
                    onChange={(e) => setFormScale(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Density ({formDensity}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={formDensity}
                    onChange={(e) => setFormDensity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Rotation ({formRotation}°)</label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="15"
                    value={formRotation}
                    onChange={(e) => setFormRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPattern(null)}
                >
                  Cancel
                </KromaButton>
                <KromaButton
                  type="submit"
                  variant="filled"
                  size="sm"
                >
                  Save Changes
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
