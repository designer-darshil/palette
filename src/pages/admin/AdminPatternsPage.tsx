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
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  // Form State
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

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingPattern(null);
    setFormTitle('New Procedural Pattern');
    setFormCategory('Editorial');
    setFormType('grid');
    setFormScale(40);
    setFormDensity(60);
    setFormRotation(0);
    setFormStrokeWidth(1.5);
    setFormOpacity(0.85);
  };

  const handleOpenEdit = (p: PatternItem) => {
    setIsCreating(false);
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

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const slug =
      formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
      `pattern-${Date.now()}`;

    if (isCreating) {
      const newPattern: PatternItem = {
        id: `pat-custom-${Date.now()}`,
        slug,
        title: formTitle.trim(),
        category: formCategory,
        type: formType,
        scale: formScale,
        density: formDensity,
        rotation: formRotation,
        strokeWidth: formStrokeWidth,
        opacity: formOpacity,
        palette: ['#171717', '#FF3B30', '#34C759', '#00AEEF', '#F8F8F8'],
        description: 'Algorithmic geometric vector motif for architectural surface design.',
        tags: ['geometric', 'procedural', formCategory.toLowerCase()],
        likes: 0,
      };
      const next = [newPattern, ...patterns];
      persistPatterns(next);
      logActivity('Created Pattern', `Added pattern "${newPattern.title}"`);
    } else if (editingPattern) {
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
    }

    setIsCreating(false);
    setEditingPattern(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove pattern "${title}"?`)) {
      const next = patterns.filter((p) => p.id !== id);
      persistPatterns(next);
      logActivity('Deleted Pattern', `Removed pattern "${title}"`);
    }
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

        <div className="flex items-center gap-3">
          <KromaButton
            onClick={handleOpenCreate}
            variant="filled"
            size="sm"
            iconLeft={<Plus size={14} />}
          >
            New Pattern
          </KromaButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#707070] dark:text-[#9DA3AF]" />
            <input
              type="text"
              placeholder="Search pattern title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] dark:placeholder-[#9DA3AF] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
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

        <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
          {filtered.length} PATTERNS ACTIVE
        </div>
      </div>

      {/* Visual Pattern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((pattern) => {
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
              {/* SVG Live Preview Container */}
              <div
                className="w-full h-36 bg-black/[0.03] dark:bg-black/30 border-b border-black/10 dark:border-white/10 cursor-pointer overflow-hidden flex items-center justify-center relative group"
                onClick={() => setInspectPattern(pattern)}
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              </div>

              {/* Pattern Metadata */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#F8F8F8]">
                      {pattern.title}
                    </h3>
                    <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF] mt-0.5">
                      {pattern.category} · {pattern.type.toUpperCase()}
                    </div>
                  </div>

                  <span className="font-mono text-xs uppercase px-1.5 py-0.5 rounded-xs bg-black/[0.04] dark:bg-white/[0.06] text-[#707070] dark:text-[#9DA3AF]">
                    #{pattern.slug}
                  </span>
                </div>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs text-[#707070] dark:text-[#9DA3AF] pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="p-1 bg-black/[0.02] dark:bg-white/[0.04] rounded-xs text-center">
                    SCALE: {pattern.scale}%
                  </div>
                  <div className="p-1 bg-black/[0.02] dark:bg-white/[0.04] rounded-xs text-center">
                    DENSITY: {pattern.density}%
                  </div>
                  <div className="p-1 bg-black/[0.02] dark:bg-white/[0.04] rounded-xs text-center">
                    ROT: {pattern.rotation}°
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <KromaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCss(pattern)}
                    iconLeft={<Copy size={12} />}
                    className="!text-xs !py-1 !px-2 text-[#707070] dark:text-[#9DA3AF]"
                  >
                    Copy CSS
                  </KromaButton>

                  <div className="flex items-center gap-1">
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(pattern)}
                      iconLeft={<Edit2 size={12} />}
                      className="!text-xs !py-1 !px-2 text-[#707070] dark:text-[#9DA3AF]"
                    >
                      Edit
                    </KromaButton>
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectPattern(pattern)}
                      iconLeft={<Eye size={12} />}
                      className="!text-xs !py-1 !px-2 text-[#707070] dark:text-[#9DA3AF]"
                    >
                      Inspect
                    </KromaButton>
                    <KromaButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pattern.id, pattern.title)}
                      iconLeft={<Trash2 size={12} />}
                      className="!text-xs !py-1 !px-2 text-[#D70015] dark:text-[#FF453A] hover:bg-[#FF3B30]/10"
                    >
                      Delete
                    </KromaButton>
                  </div>
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
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8]">{inspectPattern.title}</h2>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                  Category: {inspectPattern.category} · Slug: {inspectPattern.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectPattern(null)}
                aria-label="Close"
                className="text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* High-res SVG Preview */}
            <div
              className="w-full h-44 rounded-xs border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/40"
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
                  500,
                  180
                ),
              }}
            />

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed">
              {inspectPattern.description}
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => handleCopyCss(inspectPattern)}
                iconLeft={copiedCss ? <Check size={12} /> : <Copy size={12} />}
              >
                {copiedCss ? 'Copied CSS' : 'Copy CSS Background'}
              </KromaButton>

              <div className="flex gap-2">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toEdit = inspectPattern;
                    setInspectPattern(null);
                    handleOpenEdit(toEdit);
                  }}
                  iconLeft={<Edit2 size={12} />}
                >
                  Edit
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
        </div>
      )}

      {/* Create / Edit Pattern Modal */}
      {(isCreating || editingPattern) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsCreating(false);
            setEditingPattern(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8]">
                {isCreating ? 'Create Pattern Specification' : `Edit Pattern: ${editingPattern?.title}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPattern(null);
                }}
                aria-label="Close"
                className="text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Live Interactive SVG Preview in Modal */}
            <div
              className="w-full h-32 rounded-xs border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/40"
              dangerouslySetInnerHTML={{
                __html: generatePatternSvg(
                  {
                    type: formType,
                    palette: ['#171717', '#FF3B30', '#34C759', '#00AEEF', '#F8F8F8'],
                    scale: formScale,
                    density: formDensity,
                    rotation: formRotation,
                    strokeWidth: formStrokeWidth,
                    opacity: formOpacity,
                  },
                  440,
                  130
                ),
              }}
            />

            <form onSubmit={handleSaveForm} className="flex flex-col gap-4 text-xs font-mono">
              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-sm font-sans text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
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
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
                    Geometry Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PatternType)}
                    className="w-full px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
                  >
                    <option value="grid">Grid</option>
                    <option value="dots">Dots</option>
                    <option value="waves">Waves</option>
                    <option value="isometric">Isometric</option>
                    <option value="tessellation">Tessellation</option>
                    <option value="topography">Topography</option>
                    <option value="geometric">Geometric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">
                    Scale ({formScale}%)
                  </label>
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
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">
                    Density ({formDensity}%)
                  </label>
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
                  <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">
                    Rotation ({formRotation}°)
                  </label>
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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPattern(null);
                  }}
                >
                  Cancel
                </KromaButton>
                <KromaButton type="submit" variant="filled" size="sm">
                  {isCreating ? 'Create Pattern' : 'Save Changes'}
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
