import React, { useState, useMemo } from 'react';
import { useMaintenance } from '../context/MaintenanceContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';
import { RefreshCw, ArrowRight, ExternalLink } from 'lucide-react';

interface MaintenancePageProps {
  isPreview?: boolean;
  onExitPreview?: () => void;
  onNavigateAdmin?: () => void;
}

interface SpecimenColor {
  index: string;
  name: string;
  hex: string;
  oklch: string;
  wavelength: string;
  role: string;
  widthPercent: number;
  heightDesktop: number;
  heightMobile: number;
}

const CALIBRATION_SPECIMENS: SpecimenColor[] = [
  {
    index: '01',
    name: 'Chromatic Red',
    hex: '#FF3B30',
    oklch: 'oklch(0.63 0.24 28)',
    wavelength: '630 nm',
    role: 'Anchor Primary',
    widthPercent: 18,
    heightDesktop: 250,
    heightMobile: 140,
  },
  {
    index: '02',
    name: 'Spectral Amber',
    hex: '#FF9500',
    oklch: 'oklch(0.74 0.19 55)',
    wavelength: '600 nm',
    role: 'Solar Midtone',
    widthPercent: 14,
    heightDesktop: 220,
    heightMobile: 120,
  },
  {
    index: '03',
    name: 'Solar Yellow',
    hex: '#FFD60A',
    oklch: 'oklch(0.87 0.18 95)',
    wavelength: '575 nm',
    role: 'High Luma Accent',
    widthPercent: 22,
    heightDesktop: 270,
    heightMobile: 160,
  },
  {
    index: '04',
    name: 'Pure Emerald',
    hex: '#34C759',
    oklch: 'oklch(0.74 0.19 142)',
    wavelength: '530 nm',
    role: 'Equatorial Green',
    widthPercent: 15,
    heightDesktop: 235,
    heightMobile: 130,
  },
  {
    index: '05',
    name: 'Vivid Cyan',
    hex: '#00AEEF',
    oklch: 'oklch(0.72 0.16 230)',
    wavelength: '480 nm',
    role: 'Atmospheric Cool',
    widthPercent: 15,
    heightDesktop: 260,
    heightMobile: 150,
  },
  {
    index: '06',
    name: 'Ultra Violet',
    hex: '#7B2CBF',
    oklch: 'oklch(0.48 0.25 305)',
    wavelength: '415 nm',
    role: 'Deep Spectrum Floor',
    widthPercent: 16,
    heightDesktop: 210,
    heightMobile: 110,
  },
];

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  isPreview = false,
  onExitPreview,
  onNavigateAdmin,
}) => {
  const { state, refresh } = useMaintenance();
  const { isAuthenticated } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSpecimen, setActiveSpecimen] = useState<SpecimenColor>(CALIBRATION_SPECIMENS[2]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formattedReturnTime = useMemo(() => {
    const raw = state.scheduledEnd || state.estimatedReturn;
    if (!raw) return null;
    try {
      const date = new Date(raw);
      if (isNaN(date.getTime())) return raw;
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(date);
    } catch {
      return raw;
    }
  }, [state.scheduledEnd, state.estimatedReturn]);

  return (
    <>
      <SEOHead
        title="Studio Recalibration | KROMA Digital Color Laboratory"
        description="Kroma is temporarily recalibrating the color space. The digital color laboratory will resume shortly."
        noindex={true}
        nofollow={true}
      />

      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-between bg-[#F8F8F8] dark:bg-[#090A0C] text-[#171717] dark:text-[#F8F8F8] p-5 sm:p-8 lg:p-12 font-sans relative overflow-x-hidden selection:bg-[#171717] selection:text-white dark:selection:bg-[#F8F8F8] dark:selection:text-[#171717]">
        {/* Subtle Architectural Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-xs font-mono text-black/20 dark:text-white/20 select-none pointer-events-none">
          +
        </div>
        <div className="absolute top-3 right-3 text-xs font-mono text-black/20 dark:text-white/20 select-none pointer-events-none">
          +
        </div>
        <div className="absolute bottom-3 left-3 text-xs font-mono text-black/20 dark:text-white/20 select-none pointer-events-none">
          +
        </div>
        <div className="absolute bottom-3 right-3 text-xs font-mono text-black/20 dark:text-white/20 select-none pointer-events-none">
          +
        </div>

        {/* ─── Minimal Studio Header ─── */}
        <header className="w-full flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10 z-10">
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs sm:text-sm font-extrabold tracking-[0.22em] uppercase text-[#171717] dark:text-[#F8F8F8]">
              KROMA
            </span>
            <span className="h-3 w-[1px] bg-black/20 dark:bg-white/20" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#595959] dark:text-[#9DA3AF] hidden sm:inline">
              COLOR LABORATORY
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isPreview ? (
              <span className="px-2 py-0.5 rounded-xs bg-[#B35300]/10 border border-[#B35300]/30 text-[#B35300] dark:text-[#FF9500] font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B35300] dark:bg-[#FF9500] animate-pulse" />
                ADMIN PREVIEW
              </span>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-[#595959] dark:text-[#9DA3AF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B35300] dark:bg-[#FF9500] animate-pulse" />
                <span>STUDIO RECALIBRATION</span>
              </div>
            )}

            {isAuthenticated && (
              <KromaButton
                variant="outline"
                size="sm"
                iconRight={<ArrowRight size={12} />}
                onClick={onNavigateAdmin || (() => { window.location.href = '/admin'; })}
                className="!text-xs !py-1 !px-2.5"
              >
                Admin Hub
              </KromaButton>
            )}

            {isPreview && onExitPreview && (
              <KromaButton
                variant="filled"
                size="sm"
                onClick={onExitPreview}
                className="!text-xs !py-1 !px-2.5"
              >
                Exit Preview
              </KromaButton>
            )}
          </div>
        </header>

        {/* ─── Main Spatial Composition (Editorial + Color Specimen) ─── */}
        <main className="w-full my-auto py-8 sm:py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
          
          {/* Left Anchor: Typographic & Technical Directive */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Small Editorial Eyebrow */}
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#595959] dark:text-[#9DA3AF] mb-3">
              COLOR STUDIO // TEMPORARILY OFFLINE
            </div>

            {/* Main Headline in General Sans */}
            <h1 className="font-sans font-extrabold tracking-tight text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.05] text-[#171717] dark:text-[#F8F8F8] uppercase mb-5">
              WE'RE<br />
              RECALIBRATING<br />
              THE COLOR SPACE.
            </h1>

            {/* Concise Supporting Copy */}
            <p className="font-sans text-sm sm:text-base text-[#595959] dark:text-[#9DA3AF] leading-relaxed max-w-md mb-6">
              Kroma is temporarily offline while we tune the studio. We'll be back shortly.
            </p>

            {/* If custom non-default message exists from admin, present it sparsely */}
            {state.message && !state.message.includes('undergoing scheduled system upgrades') && (
              <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] border-l-2 border-[#171717] dark:border-[#F8F8F8] font-mono text-xs text-[#595959] dark:text-[#9DA3AF] mb-6 max-w-md">
                {state.message}
              </div>
            )}

            {/* Real Status Information (No fake countdowns or percentages) */}
            <div className="font-mono text-xs text-[#595959] dark:text-[#9DA3AF] mb-6 flex flex-col gap-1 border-t border-black/5 dark:border-white/5 pt-4 w-full max-w-md">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-xs">ESTIMATED WINDOW:</span>
                <span className="font-semibold text-[#171717] dark:text-[#F8F8F8]">
                  {formattedReturnTime ? formattedReturnTime : 'THE STUDIO WILL RETURN SHORTLY'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-xs">CORE ENGINE:</span>
                <span className="font-semibold text-[#1B8738] dark:text-[#34C759]">ALL SPECIMENS INTACT</span>
              </div>
            </div>

            {/* Legitimate Action Button (Single Icon, Existing KromaButton) */}
            <div className="flex items-center gap-3">
              <KromaButton
                variant="filled"
                size="md"
                iconLeft={<RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />}
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Checking Engine...' : 'Check Status'}
              </KromaButton>

              {state.supportUrl && (
                <KromaButton
                  variant="outline"
                  size="md"
                  iconLeft={<ExternalLink size={13} />}
                  onClick={() => {
                    if (state.supportUrl) window.open(state.supportUrl, '_blank');
                  }}
                >
                  Contact Studio
                </KromaButton>
              )}
            </div>
          </div>

          {/* Right Anchor: The Digital Color Calibration Specimen */}
          <div className="lg:col-span-7 w-full flex flex-col gap-3">
            
            {/* Calibration Specimen Frame */}
            <div className="relative p-4 sm:p-6 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs shadow-xs overflow-hidden">
              
              {/* Technical Specimen Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10 font-mono text-xs uppercase tracking-wider text-[#595959] dark:text-[#9DA3AF]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-[#F8F8F8]" />
                  <span>SPECIMEN CALIBRATION // 01</span>
                </div>
                <div className="hidden sm:block">
                  <span>OKLCH D65 EQUATORIAL SPACE</span>
                </div>
                <div className="text-right">
                  <span className="text-[#1B8738] dark:text-[#34C759] font-bold">ΔE &lt; 0.8 STABLE</span>
                </div>
              </div>

              {/* Solid Color Specimen Strip with Asymmetrical Rhythms */}
              <div className="relative w-full flex items-end justify-between gap-1 sm:gap-1.5 pt-2 pb-2 overflow-hidden">
                
                {/* Precision Ambient Scan Line (Sweeps across the solid color fields) */}
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-[#171717] dark:bg-[#F8F8F8] shadow-sm z-20 pointer-events-none animate-calibration-scan"
                  style={{ willChange: 'left, opacity' }}
                >
                  <span className="absolute -top-1 -left-1 w-2.5 h-1 bg-[#171717] dark:bg-[#F8F8F8]" />
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-1 bg-[#171717] dark:bg-[#F8F8F8]" />
                </div>

                {/* The 6 Solid Color Blocks */}
                {CALIBRATION_SPECIMENS.map((specimen) => {
                  const isHovered = activeSpecimen.index === specimen.index;
                  return (
                    <div
                      key={specimen.index}
                      onMouseEnter={() => setActiveSpecimen(specimen)}
                      onClick={() => setActiveSpecimen(specimen)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${specimen.name}: ${specimen.hex}`}
                      className="group relative flex-1 flex flex-col justify-between p-2 sm:p-2.5 cursor-pointer transition-all duration-300 ease-out border border-black/5 dark:border-white/5"
                      style={{
                        backgroundColor: specimen.hex,
                        height: typeof window !== 'undefined' && window.innerWidth < 640
                          ? `${specimen.heightMobile}px`
                          : `${specimen.heightDesktop}px`,
                        opacity: isHovered ? 1 : 0.92,
                        transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                        transformOrigin: 'bottom',
                      }}
                    >
                      {/* Top Specimen Index */}
                      <span className="font-mono text-xs font-bold text-white/90 drop-shadow-xs">
                        {specimen.index}
                      </span>

                      {/* Bottom Wavelength λ label */}
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-white/95 truncate">
                          {specimen.hex}
                        </span>
                        <span className="font-mono text-xs text-white/75 hidden sm:inline">
                          {specimen.wavelength}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Probe Readout Area */}
              <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between font-mono text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-xs border border-black/10 dark:border-white/10 shrink-0"
                    style={{ backgroundColor: activeSpecimen.hex }}
                  />
                  <span className="font-bold text-[#171717] dark:text-[#F8F8F8]">
                    {activeSpecimen.name}
                  </span>
                  <span className="text-[#595959] dark:text-[#9DA3AF]">
                    {activeSpecimen.hex}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[#595959] dark:text-[#9DA3AF] text-xs">
                  <span>{activeSpecimen.oklch}</span>
                  <span className="hidden md:inline">λ {activeSpecimen.wavelength}</span>
                  <span className="px-1.5 py-0.5 rounded-xs bg-black/[0.04] dark:bg-white/[0.05] font-semibold text-[#171717] dark:text-[#F8F8F8]">
                    {activeSpecimen.role}
                  </span>
                </div>
              </div>

              {/* Corner crosshairs on the specimen card */}
              <span className="absolute top-1 left-1.5 text-xs font-mono text-black/30 dark:text-white/30">+</span>
              <span className="absolute top-1 right-1.5 text-xs font-mono text-black/30 dark:text-white/30">+</span>
              <span className="absolute bottom-1 left-1.5 text-xs font-mono text-black/30 dark:text-white/30">+</span>
              <span className="absolute bottom-1 right-1.5 text-xs font-mono text-black/30 dark:text-white/30">+</span>
            </div>

            {/* Specimen Subtitle Note */}
            <div className="flex items-center justify-between font-mono text-xs text-[#595959] dark:text-[#9DA3AF] px-1">
              <span>CHROMATIC ANCHOR SPECTRUM // 6-PHASE HARMONIC ARRAY</span>
              <span>CALIBRATION CYCLE: CONTINUOUS</span>
            </div>
          </div>
        </main>

        {/* ─── Minimal Technical Footer ─── */}
        <footer className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-[#595959] dark:text-[#9DA3AF] pt-4 border-t border-black/10 dark:border-white/10 gap-2 z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span>01 / COLOR ENGINE: RECALIBRATING</span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span>02 / PUBLIC STUDIO: PAUSED</span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span>03 / DATA LAYER: INTACT</span>
          </div>

          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} KROMA DIGITAL COLOR STUDIO</span>
          </div>
        </footer>
      </div>
    </>
  );
};
