import React from 'react';
import { Tag } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const taxonomies = [
    {
      title: 'Color Spectrum Groups',
      subtitle: '16 Gamut Anchors',
      items: [
        { name: 'Red', color: '#FF3B30' },
        { name: 'Orange', color: '#FF9500' },
        { name: 'Yellow', color: '#FFD60A' },
        { name: 'Green', color: '#34C759' },
        { name: 'Teal', color: '#30B0C7' },
        { name: 'Cyan', color: '#00AEEF' },
        { name: 'Blue', color: '#007AFF' },
        { name: 'Indigo', color: '#5856D6' },
        { name: 'Purple', color: '#7B2CBF' },
        { name: 'Pink', color: '#FF2D55' },
        { name: 'Brown', color: '#A2845E' },
        { name: 'Beige', color: '#D1C7BD' },
        { name: 'Cream', color: '#FDFBF7' },
        { name: 'Gray', color: '#8E8E93' },
        { name: 'White', color: '#F8F9FA' },
        { name: 'Black', color: '#111216' },
      ],
      count: '2,288 Associated Specimens',
    },
    {
      title: 'Palette Aesthetics & Disciplines',
      subtitle: '8 Stylistic Categories',
      items: [
        { name: 'Editorial', color: '#FF3B30' },
        { name: 'Minimal', color: '#8E8E93' },
        { name: 'Nature', color: '#34C759' },
        { name: 'Architectural', color: '#00AEEF' },
        { name: 'Vintage', color: '#FF9500' },
        { name: 'Vibrant', color: '#FFD60A' },
        { name: 'Monochrome', color: '#111216' },
        { name: 'Dark Mode', color: '#7B2CBF' },
      ],
      count: '1,210 Associated Palettes',
    },
    {
      title: 'Relational Harmonies',
      subtitle: '8 Geometric Formulations',
      items: [
        { name: 'Complementary', color: '#FF3B30' },
        { name: 'Analogous', color: '#FF9500' },
        { name: 'Triadic', color: '#FFD60A' },
        { name: 'Split Complementary', color: '#34C759' },
        { name: 'Monochromatic', color: '#8E8E93' },
        { name: 'Warm & Cool', color: '#00AEEF' },
        { name: 'High Contrast', color: '#7B2CBF' },
        { name: 'Editorial Balance', color: '#111216' },
      ],
      count: '810 Associated Pairings',
    },
    {
      title: 'Continuous Atmospheres',
      subtitle: '7 Gradient Categories',
      items: [
        { name: 'Atmospheric', color: '#00AEEF' },
        { name: 'Sunset', color: '#FF9500' },
        { name: 'Holographic', color: '#7B2CBF' },
        { name: 'Deep Space', color: '#111216' },
        { name: 'Organic', color: '#34C759' },
        { name: 'Editorial Metal', color: '#8E8E93' },
        { name: 'Minimal', color: '#F8F9FA' },
      ],
      count: '810 Associated Spectra',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
          Classification Vocabularies
        </h1>
        <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
          Controlled taxonomy boundaries, chromatic classifications, and aesthetic disciplines.
        </p>
      </div>

      {/* Taxonomies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {taxonomies.map((tax) => (
          <div
            key={tax.title}
            className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start pb-3 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-sm font-bold text-[#171717] dark:text-[#F8F8F8]">
                    {tax.title}
                  </h2>
                  <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
                    {tax.subtitle}
                  </div>
                </div>
                <span className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF] px-1.5 py-0.5 rounded-xs bg-black/[0.03] dark:bg-white/[0.04]">
                  {tax.count}
                </span>
              </div>

              {/* Items Chips */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {tax.items.map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs font-mono text-xs text-[#171717] dark:text-[#F8F8F8]"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
              <span>ACTIVE TAXONOMY ENTITIES: {tax.items.length}</span>
              <span>100% UNIFORM SCHEMA</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
