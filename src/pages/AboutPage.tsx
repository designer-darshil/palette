import React from 'react';
import { Sparkles, Layers, ShieldCheck, Compass, Wand2, Grid, ArrowRight, BookOpen, Code2, Heart } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { Link } from '../components/common/Link';
import { Button } from '../components/common/Button';

interface AboutPageProps {
  onNavigate: (route: RouteType) => void;
}

const PILLARS = [
  {
    index: '01',
    title: 'Perceptually Uniform Color Space',
    badge: 'OKLCH Science',
    color: '#FF3B30',
    description:
      'Engineered around modern Oklch color space for linear lightness and uniform chroma steps, ensuring predictable contrast and harmony across light and dark interfaces.',
    icon: Layers,
  },
  {
    index: '02',
    title: '44,000+ Calibrated Pigments',
    badge: 'Pigment Database',
    color: '#FF9500',
    description:
      'The largest digital pigment library indexing classical fine art pigments, industrial minerals, CIELAB delta-E coordinates, and cultural naming traditions.',
    icon: BookOpen,
  },
  {
    index: '03',
    title: 'Generative Creative Studios',
    badge: 'Real-time Engines',
    color: '#FFD60A',
    description:
      'From 2D Newtonian gravity physics simulations to multi-point mesh gradient fluid vectors and algorithmic SVG vector pattern generators.',
    icon: Wand2,
  },
  {
    index: '04',
    title: 'Accessibility & WCAG AAA Standards',
    badge: 'Compliance',
    color: '#34C759',
    description:
      'Built-in contrast matrix engines, color vision deficiency simulation (Protanopia, Deuteranopia, Tritanopia), and automatic lightness nudge remediation.',
    icon: ShieldCheck,
  },
  {
    index: '05',
    title: 'Design Tokens & DTCG Standards',
    badge: 'Developer First',
    color: '#00AEEF',
    description:
      'One-click export to CSS Custom Properties, Tailwind CSS 4 configurations, Figma DTCG Design Tokens, JSON AST, and REST API endpoints.',
    icon: Code2,
  },
  {
    index: '06',
    title: 'Curator Community & Daily Specimen',
    badge: 'Living System',
    color: '#7B2CBF',
    description:
      'Daily color discoveries, atmospheric daylight tracking, community collections, and tactile sensory games to hone chromatic acuity.',
    icon: Heart,
  },
];

const STATS = [
  { value: '44,000+', label: 'Pigment Specimens', accent: '#FF3B30' },
  { value: '100%', label: 'WCAG AAA Verified', accent: '#FF9500' },
  { value: '10+', label: 'Generative Studios', accent: '#34C759' },
  { value: '0ms', label: 'Client-side Latency', accent: '#00AEEF' },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="about-page w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-16 md:gap-24">
      <SEOHead
        title="About KROMA — Digital Color Library & Chromatic Engineering"
        description="Learn about KROMA's chromatic design philosophy, perceptual OKLCH color engineering, generative studios, and curated digital pigment library."
        canonicalPath="/about"
      />

      {/* Hero Statement */}
      <section className="about-hero flex flex-col gap-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] w-fit">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
          <span>The Chromatic Studio</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.08]">
          Color is the first syntax of visual design.
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed font-normal">
          KROMA is a modern color system, algorithmic creation laboratory, and curated design specimen reference calibrated for digital product designers, creative technologists, and engineers.
        </p>

        {/* Rainbow Accent Strip */}
        <div className="h-1.5 w-full rounded-full flex overflow-hidden shadow-xs">
          <div className="flex-1 bg-[#FF3B30]" />
          <div className="flex-1 bg-[#FF9500]" />
          <div className="flex-1 bg-[#FFD60A]" />
          <div className="flex-1 bg-[#34C759]" />
          <div className="flex-1 bg-[#00AEEF]" />
          <div className="flex-1 bg-[#7B2CBF]" />
        </div>
      </section>

      {/* Key Metrics */}
      <section className="about-stats grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-[4px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between gap-3 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]"
          >
            <div className="w-6 h-1 rounded-[1px]" style={{ backgroundColor: stat.accent }} />
            <div>
              <span
                className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans block mb-1"
                style={{ color: stat.accent }}
              >
                {stat.value}
              </span>
              <span className="font-mono text-xs text-[#707070] dark:text-[#909090] uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Core Architectural Pillars */}
      <section className="about-pillars flex flex-col gap-8">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#707070] dark:text-[#909090]">ARCHITECTURE &amp; SCIENCE</span>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
            Engineered for precision and play.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.index}
                className="rounded-[4px] bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col justify-between transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] group"
              >
                {/* Chromatic Identity Top Stripe */}
                <div className="h-1.5 w-full" style={{ backgroundColor: pillar.color }} />

                <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090]">
                      {pillar.index}
                    </span>
                    <span
                      className="font-mono text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[2px] border"
                      style={{
                        color: pillar.color,
                        borderColor: `${pillar.color}40`,
                        backgroundColor: `${pillar.color}10`,
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[#171717] dark:text-white">
                    <Icon size={18} strokeWidth={2.2} style={{ color: pillar.color }} className="flex-shrink-0" />
                    <h3 className="font-sans text-[17px] font-bold tracking-tight text-[#171717] dark:text-white m-0">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="font-sans text-xs sm:text-[13px] text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Navigation CTA */}
      <section className="about-cta p-8 sm:p-12 rounded-3xl bg-[var(--bg-surface-2)] border border-[var(--border-medium)] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Explore the Chromatic Universe
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Step directly into our creative studios, generate harmonious palettes, or browse the curated collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => onNavigate({ path: 'explore' })}
            className="flex items-center gap-2"
          >
            <span>Explore Library</span>
            <ArrowRight size={15} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => onNavigate({ path: 'generate' })}
          >
            <span>Generate Palettes</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate({ path: 'create' })}
          >
            <span>Studio Tools</span>
          </Button>
        </div>
      </section>
    </div>
  );
};
