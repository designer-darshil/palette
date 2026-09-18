import React, { useState } from 'react';
import { Copy, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { ColorRelationshipProfile, RelationalNode } from '../utils/colorRelationshipEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { RouteType } from '../types';
import { Link } from './common/Link';

interface ColorRelationshipDiagramProps {
  profile: ColorRelationshipProfile;
  onNavigate: (route: RouteType) => void;
}

export const ColorRelationshipDiagram: React.FC<ColorRelationshipDiagramProps> = ({
  profile,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [activeHarmonicTab, setActiveHarmonicTab] = useState<
    'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'splitComplementary' | 'monochromatic'
  >('complementary');
  const [selectedNode, setSelectedNode] = useState<RelationalNode>(
    profile.harmonies.complementary[0] || profile.nodes[0]
  );

  const handleCopyHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const activeNodes = profile.harmonies[activeHarmonicTab] || [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md shadow-sm">
      {/* Harmonic Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { key: 'complementary', label: 'Complementary (180°)' },
              { key: 'analogous', label: 'Analogous (±30°)' },
              { key: 'triadic', label: 'Triadic (120°)' },
              { key: 'tetradic', label: 'Tetradic (90°)' },
              { key: 'splitComplementary', label: 'Split Complementary' },
              { key: 'monochromatic', label: 'Monochromatic Tints/Shades' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveHarmonicTab(tab.key);
                if (profile.harmonies[tab.key]?.[0]) {
                  setSelectedNode(profile.harmonies[tab.key][0]);
                }
              }}
              className={`filter-pill text-xs px-2.5 py-1 ${activeHarmonicTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Relationship Interactive Wheel / Map (SVG) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-[var(--bg-surface-2)] rounded-md relative border border-[var(--border-subtle)]">
          <svg viewBox="0 0 360 360" className="w-full max-w-[320px] aspect-square">
            {/* Center Outer Orbit Rings */}
            <circle cx="180" cy="180" r="140" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="180" cy="180" r="90" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />

            {/* Connecting Geometric Lines to Active Harmonic Nodes */}
            {activeNodes.map((node, i) => {
              const rad = ((profile.baseHsl.h + node.angleDelta - 90) * Math.PI) / 180;
              const x = 180 + 140 * Math.cos(rad);
              const y = 180 + 140 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1="180"
                  y1="180"
                  x2={x}
                  y2={y}
                  stroke={node.hex}
                  strokeWidth="2"
                  strokeOpacity="0.75"
                />
              );
            })}

            {/* Central Base Node */}
            <circle
              cx="180"
              cy="180"
              r="34"
              fill={profile.baseHex}
              stroke="white"
              strokeWidth="3"
              className="shadow-md"
            />
            <text
              x="180"
              y="184"
              textAnchor="middle"
              fill={profile.contrastWithBlack >= profile.contrastWithWhite ? '#000000' : '#FFFFFF'}
              fontSize="10"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              BASE
            </text>

            {/* Orbiting Harmonic Nodes */}
            {activeNodes.map((node, i) => {
              const rad = ((profile.baseHsl.h + node.angleDelta - 90) * Math.PI) / 180;
              const x = 180 + 140 * Math.cos(rad);
              const y = 180 + 140 * Math.sin(rad);
              const isSelected = selectedNode.hex === node.hex;

              return (
                <g
                  key={i}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "22" : "18"}
                    fill={node.hex}
                    stroke={isSelected ? "var(--accent-gold)" : "rgba(255,255,255,0.4)"}
                    strokeWidth={isSelected ? "3" : "1.5"}
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fill={node.contrastWithBase >= 4.5 ? profile.baseHex : '#FFFFFF'}
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    {node.angleDelta > 0 ? `+${node.angleDelta}°` : `${node.angleDelta}°`}
                  </text>
                </g>
              );
            })}
          </svg>

          <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase mt-2">
            Chromatic Angular Coordinate Map
          </span>
        </div>

        {/* Selected Harmonic Node Details */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[var(--accent-gold)] uppercase font-semibold">
                {selectedNode.label}
              </span>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">
                Contrast {selectedNode.contrastWithBase}:1 on Base
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-sm border border-[var(--border-subtle)] shadow-inner cursor-pointer"
                style={{ backgroundColor: selectedNode.hex }}
                onClick={() => handleCopyHex(selectedNode.hex, selectedNode.name)}
                title="Click to copy HEX"
              />
              <div>
                <h4 className="text-xl font-extrabold text-[var(--text-primary)]">
                  {selectedNode.name}
                </h4>
                <div className="font-mono text-sm text-[var(--text-secondary)] font-bold">
                  {selectedNode.hex}
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-2 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs">
                <span className="text-[var(--text-tertiary)] block text-[10px] font-mono">
                  HSL Coordinates
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  hsl({selectedNode.hsl.h}, {selectedNode.hsl.s}%, {selectedNode.hsl.l}%)
                </span>
              </div>
              <div className="p-2 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs">
                <span className="text-[var(--text-tertiary)] block text-[10px] font-mono">
                  Color Temperature
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {selectedNode.temperature.classification} ({selectedNode.temperature.kelvin}K)
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] flex-wrap">
            <button
              onClick={() => handleCopyHex(selectedNode.hex, selectedNode.name)}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Copy size={13} />
              <span>Copy {selectedNode.hex}</span>
            </button>

            <Link
              to={{
                path: 'palette-generator',
                colors: `${profile.baseHex.replace('#', '')}-${selectedNode.hex.replace('#', '')}`,
              }}
              onNavigate={onNavigate}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Create Palette with Pair</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
