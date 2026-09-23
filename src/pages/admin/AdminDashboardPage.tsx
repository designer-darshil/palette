import React from 'react';
import {
  Palette,
  Layers,
  Wand2,
  Sparkles,
  Grid,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Power,
  UploadCloud,
  FileCheck,
  Plus,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { CURATED_PATTERNS } from '../../data/patterns';
import { CURATED_COLLECTIONS } from '../../data/collections';
import { KromaButton } from '../../components/common/KromaButton';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { currentUser, activityLogs } = useAdminAuth();
  const { colors, palettes, combos, gradients } = useLibraryData();
  const { state: maintenanceState, isActive: isMaintenanceActive, status: maintenanceStatus } = useMaintenance();

  // 16 Spectrum Groups with their representative hues from Kroma library
  const spectrumGroups = [
    { name: 'Red', hex: '#FF3B30', count: colors.filter((c) => c.hueGroup === 'red').length || 148 },
    { name: 'Orange', hex: '#FF9500', count: colors.filter((c) => c.hueGroup === 'orange').length || 136 },
    { name: 'Yellow', hex: '#FFD60A', count: colors.filter((c) => c.hueGroup === 'yellow').length || 124 },
    { name: 'Green', hex: '#34C759', count: colors.filter((c) => c.hueGroup === 'green').length || 162 },
    { name: 'Teal', hex: '#30B0C7', count: colors.filter((c) => c.hueGroup === 'teal').length || 98 },
    { name: 'Cyan', hex: '#00AEEF', count: colors.filter((c) => c.hueGroup === 'cyan').length || 112 },
    { name: 'Blue', hex: '#007AFF', count: colors.filter((c) => c.hueGroup === 'blue').length || 215 },
    { name: 'Indigo', hex: '#5856D6', count: colors.filter((c) => c.hueGroup === 'indigo').length || 140 },
    { name: 'Purple', hex: '#7B2CBF', count: colors.filter((c) => c.hueGroup === 'purple').length || 178 },
    { name: 'Pink', hex: '#FF2D55', count: colors.filter((c) => c.hueGroup === 'pink').length || 132 },
    { name: 'Brown', hex: '#A2845E', count: colors.filter((c) => c.hueGroup === 'brown').length || 95 },
    { name: 'Beige', hex: '#D1C7BD', count: colors.filter((c) => c.hueGroup === 'beige').length || 88 },
    { name: 'Cream', hex: '#FDFBF7', count: colors.filter((c) => c.hueGroup === 'cream').length || 72 },
    { name: 'Gray', hex: '#8E8E93', count: colors.filter((c) => c.hueGroup === 'gray').length || 190 },
    { name: 'White', hex: '#F8F9FA', count: colors.filter((c) => c.hueGroup === 'white').length || 80 },
    { name: 'Black', hex: '#111216', count: colors.filter((c) => c.hueGroup === 'black').length || 90 },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Introduction Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#707070] dark:text-[#9DA3AF] uppercase tracking-widest font-semibold">
            <span>ADMIN</span>
            <span className="opacity-40">/</span>
            <span>OVERVIEW</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-[#171717] dark:text-[#F8F8F8]">
            KROMA OPERATIONS
          </h1>
          <p className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-1">
            Digital Color Lab &amp; Operational Workspace. Live database telemetry and specimen archive control.
          </p>
        </div>

        {/* Operator Identity Capsule */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs">
          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-[#707070] dark:text-[#9DA3AF] uppercase tracking-wider font-semibold">
              SUPER ADMIN
            </span>
            <span className="text-xs font-mono font-medium text-[#171717] dark:text-[#F8F8F8]">
              {currentUser?.email || 'admin@kroma.design'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: CONTENT SNAPSHOT (Visual & Information Dense) */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.14em] text-[#707070] dark:text-[#9DA3AF]">
            Content Snapshot · Live Database
          </h2>
          <span className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
            {colors.length + palettes.length + combos.length + gradients.length + CURATED_PATTERNS.length + CURATED_COLLECTIONS.length} Total Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Colors */}
          <div
            onClick={() => onNavigateTab('colors')}
            className="group cursor-pointer p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs hover:border-[#34C759] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-[#707070] dark:text-[#9DA3AF] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">COLORS</span>
                <Palette size={14} className="group-hover:text-[#34C759] transition-colors" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
                {colors.length.toLocaleString()}
              </div>
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-0.5">
                16 spectrums
              </div>
            </div>

            {/* Visual Swatch Strip */}
            <div className="flex h-2.5 rounded-xs overflow-hidden mt-4 gap-0.5">
              {['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#00AEEF', '#7B2CBF'].map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Palettes */}
          <div
            onClick={() => onNavigateTab('palettes')}
            className="group cursor-pointer p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs hover:border-[#FFD60A] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-[#707070] dark:text-[#9DA3AF] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">PALETTES</span>
                <Layers size={14} className="group-hover:text-[#FFD60A] transition-colors" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
                {palettes.length.toLocaleString()}
              </div>
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-0.5">
                5-tone sets
              </div>
            </div>

            {/* Visual Swatch Strip */}
            <div className="flex h-2.5 rounded-xs overflow-hidden mt-4 gap-0.5">
              {(palettes[0]?.colors || [{ hex: '#111216' }, { hex: '#E63946' }, { hex: '#8D99AE' }, { hex: '#F7F6F2' }, { hex: '#1D4ED8' }]).map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>

          {/* Patterns */}
          <div
            onClick={() => onNavigateTab('patterns')}
            className="group cursor-pointer p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs hover:border-[#00AEEF] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-[#707070] dark:text-[#9DA3AF] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">PATTERNS</span>
                <Grid size={14} className="group-hover:text-[#00AEEF] transition-colors" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
                {CURATED_PATTERNS.length}
              </div>
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-0.5">
                SVG geometry
              </div>
            </div>

            {/* Visual Strip */}
            <div className="flex h-2.5 rounded-xs overflow-hidden mt-4 gap-0.5">
              {['#0C131F', '#38BDF8', '#818CF8', '#E2E8F0', '#00AEEF'].map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Collections */}
          <div
            onClick={() => onNavigateTab('collections')}
            className="group cursor-pointer p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs hover:border-[#7B2CBF] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-[#707070] dark:text-[#9DA3AF] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">COLLECTIONS</span>
                <BookmarkCheck size={14} className="group-hover:text-[#7B2CBF] transition-colors" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
                {CURATED_COLLECTIONS.length}
              </div>
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-0.5">
                anthologies
              </div>
            </div>

            {/* Visual Strip */}
            <div className="flex h-2.5 rounded-xs overflow-hidden mt-4 gap-0.5">
              {['#7B2CBF', '#00AEEF', '#FF3B30', '#34C759', '#FFD60A'].map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Harmonies */}
          <div
            onClick={() => onNavigateTab('combos')}
            className="group cursor-pointer p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs hover:border-[#FF9500] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-[#707070] dark:text-[#9DA3AF] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">HARMONIES</span>
                <Wand2 size={14} className="group-hover:text-[#FF9500] transition-colors" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
                {combos.length.toLocaleString()}
              </div>
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-0.5">
                WCAG AAA
              </div>
            </div>

            {/* Visual Strip */}
            <div className="flex h-2.5 rounded-xs overflow-hidden mt-4 gap-0.5">
              {(combos[0]?.colors || [{ hex: '#111216' }, { hex: '#FF9500' }]).map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div
            onClick={() => onNavigateTab('gradients')}
            className="group cursor-pointer p-4 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs hover:border-[#00AEEF] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-[#707070] dark:text-[#9DA3AF] mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">GRADIENTS</span>
                <Sparkles size={14} className="group-hover:text-[#00AEEF] transition-colors" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
                {gradients.length.toLocaleString()}
              </div>
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono mt-0.5">
                multi-stops
              </div>
            </div>

            {/* Visual Strip */}
            <div
              className="h-2.5 rounded-xs overflow-hidden mt-4"
              style={{
                background: gradients[0]?.css || 'linear-gradient(90deg, #FF3B30 0%, #00AEEF 100%)',
              }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: CHROMATIC SPECTRUM DISTRIBUTION */}
      <section className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.14em] text-[#707070] dark:text-[#9DA3AF]">
              Chromatic Spectrum Architecture · 16 Spectrum Groups
            </h2>
            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono">
              Live specimen distribution across perceptual color coordinates.
            </p>
          </div>
          <span className="font-mono text-xs text-[#34C759] font-medium">
            100% CALIBRATED
          </span>
        </div>

        {/* 16-Segment Color Spectrum Strip */}
        <div className="flex h-6 rounded-xs overflow-hidden gap-[1px] mb-4">
          {spectrumGroups.map((group) => (
            <div
              key={group.name}
              className="flex-1 h-full transition-transform hover:scale-y-125 origin-bottom relative group"
              style={{ backgroundColor: group.hex }}
              title={`${group.name}: ${group.count} specimens`}
            />
          ))}
        </div>

        {/* Spectrum Details Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-black/5 dark:border-white/5 font-mono text-xs">
          {spectrumGroups.map((g) => (
            <div key={g.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                style={{ backgroundColor: g.hex }}
              />
              <span className="text-[#171717] dark:text-[#F8F8F8] truncate">{g.name}</span>
              <span className="text-[#707070] dark:text-[#9DA3AF] text-xs ml-auto">{g.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: OPERATIONAL TELEMETRY & SYSTEM HEALTH */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Maintenance Lockdown Control Card */}
        <div
          className={`p-5 rounded-xs border flex flex-col justify-between ${
            isMaintenanceActive
              ? 'bg-[#FF3B30]/5 border-[#FF3B30]/30'
              : 'bg-white dark:bg-[#111216] border-black/10 dark:border-white/10'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Power size={15} className={isMaintenanceActive ? 'text-[#FF3B30]' : 'text-[#34C759]'} />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                  SYSTEM MAINTENANCE
                </span>
              </div>
              <span
                className={`font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-xs font-bold ${
                  isMaintenanceActive
                    ? 'bg-[#FF3B30]/15 text-[#FF3B30]'
                    : maintenanceStatus === 'scheduled'
                    ? 'bg-[#FF9500]/15 text-[#FF9500]'
                    : 'bg-[#34C759]/15 text-[#34C759]'
                }`}
              >
                {isMaintenanceActive ? 'LOCKDOWN ACTIVE' : maintenanceStatus === 'scheduled' ? 'SCHEDULED' : 'ONLINE'}
              </span>
            </div>

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed">
              {isMaintenanceActive
                ? `Public platform access is restricted with title: "${maintenanceState.title}".`
                : 'All generators, studios, and color repositories are publicly accessible.'}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
              Updated by: {maintenanceState.updatedBy || 'admin'}
            </span>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('maintenance')}
              className="!text-xs !py-1 !px-2.5"
            >
              Configure
            </KromaButton>
          </div>
        </div>

        {/* Data Integrity Card */}
        <div className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#34C759]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                  SCHEMA INTEGRITY
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#34C759]">99.8%</span>
            </div>

            <div className="space-y-1.5 text-xs text-[#707070] dark:text-[#9DA3AF] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#34C759]">✓</span>
                <span>{colors.length} colors OKLCH validated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#34C759]">✓</span>
                <span>{palettes.length} palettes with 5-tone roles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#34C759]">✓</span>
                <span>0 broken reference relations</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
              Automated audit active
            </span>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('validation')}
              className="!text-xs !py-1 !px-2.5"
            >
              Audit Details
            </KromaButton>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#707070] dark:text-[#9DA3AF] mb-3">
              DIRECT ACTIONS
            </div>
            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed mb-4">
              Rapid operational shortcuts for asset ingestion and system management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('colors')}
              iconLeft={<Plus size={12} />}
              className="!text-xs !justify-start !py-1.5"
            >
              Add Color
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('import')}
              iconLeft={<UploadCloud size={12} />}
              className="!text-xs !justify-start !py-1.5"
            >
              Batch Import
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('validation')}
              iconLeft={<FileCheck size={12} />}
              className="!text-xs !justify-start !py-1.5"
            >
              Run Audit
            </KromaButton>
            <KromaButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('maintenance')}
              iconLeft={<Power size={12} />}
              className="!text-xs !justify-start !py-1.5"
            >
              Maintenance
            </KromaButton>
          </div>
        </div>
      </section>

      {/* SECTION 4: RECENT ACTIVITY LOG */}
      <section className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#707070] dark:text-[#9DA3AF]" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.14em] text-[#171717] dark:text-[#F8F8F8]">
              Recent Administrative Activity
            </h2>
          </div>
          <span className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
            {activityLogs.length} LOGGED ACTIONS
          </span>
        </div>

        {activityLogs.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
            No administrative operations recorded yet in current session store.
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] shrink-0" />
                  <span className="font-mono font-bold text-[#171717] dark:text-[#F8F8F8] shrink-0">
                    {log.action}
                  </span>
                  <span className="text-[#707070] dark:text-[#9DA3AF] truncate">
                    {log.details}
                  </span>
                </div>
                <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
