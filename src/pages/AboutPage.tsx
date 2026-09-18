import React from 'react';
import { ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';

interface AboutPageProps {
  onNavigate: (route: RouteType) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="About KROMA — Editorial Color Philosophy & Archive"
        description="Learn about the design philosophy, curation methodology, and Swiss grid systems powering the KROMA digital color archive."
        canonicalPath="/about"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* 1. Large Editorial Statement & Architectural Arch Photograph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center mb-8 md:mb-10">
          <div className="lg:col-span-7">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-2">
              EDITORIAL MANIFESTO
            </div>
            <h1 className="font-serif text-[38px] md:text-[50px] leading-[1.0] tracking-[-0.025em] text-[var(--kroma-ink)] mb-3 font-normal">
              Color is more than<br />
              a visual choice.
            </h1>
            <p className="font-sans text-xs md:text-sm text-[var(--kroma-muted)] max-w-lg leading-relaxed font-light">
              KROMA is a curated digital color archive for designers, artists and creative teams. Built on Swiss typography, disciplined proportions, and real-world architectural references.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] bg-[#0D0D0C]">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85"
                alt="Architectural arch overlooking sunlight and stone"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* 2. Three Editorial Columns (Why KROMA, How We Curate, For Designers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-6 md:py-8 border-y border-[var(--kroma-border)] mb-8 md:mb-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] mb-3 font-bold">
              01 / WHY KROMA
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-normal text-[var(--kroma-ink)] tracking-[-0.02em] mb-2">
              Curated, not countless.
            </h3>
            <p className="font-sans text-xs text-[var(--kroma-muted)] leading-relaxed font-light">
              Quality over quantity. Rather than generating millions of arbitrary algorithmic hex codes, every palette in KROMA is calibrated for real-world print, branding, fashion, and digital applications.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] mb-3 font-bold">
              02 / HOW WE CURATE
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-normal text-[var(--kroma-ink)] tracking-[-0.02em] mb-2">
              Inspired by real-world design.
            </h3>
            <p className="font-sans text-xs text-[var(--kroma-muted)] leading-relaxed font-light">
              We select palettes with purpose, inspired by Mediterranean plaster, brutalist architecture, Japanese sumi ink, runway textiles, and modernist publication archives.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] mb-3 font-bold">
              03 / FOR DESIGNERS
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-normal text-[var(--kroma-ink)] tracking-[-0.02em] mb-2">
              Tools, inspiration and resources.
            </h3>
            <p className="font-sans text-xs text-[var(--kroma-muted)] leading-relaxed font-light">
              Tools, inspiration and resources to bring your ideas to life. Export ready-to-use tokens across CSS custom properties, Tailwind tokens, RGB, HSL, and OKLCH scales with automated WCAG AAA contrast guarantees.
            </p>
          </div>
        </div>

        {/* 3. Bottom Wide Scenic Photograph (Coastal Cliffs & Ocean) */}
        <div className="relative w-full h-[260px] md:h-[340px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] bg-[#0D0D0C] mb-12">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            alt="Scenic coastal cliffs and open ocean horizon"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 md:left-8 text-white">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/70 block mb-1">
              PROPORTIONAL ORDER &amp; ATMOSPHERE
            </span>
            <div className="font-sans text-xl md:text-2xl font-medium text-white tracking-[-0.02em]">
              Color is the content.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
