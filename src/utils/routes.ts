import { RouteType } from '../types';

export function routeToUrl(route: RouteType): string {
  switch (route.path) {
    case 'home':
      return '/';
    case 'explore':
      {
        const params = new URLSearchParams();
        if (route.mood) params.set('mood', route.mood);
        if (route.useCase) params.set('useCase', route.useCase);
        if (route.character) params.set('character', route.character);
        if (route.season) params.set('season', route.season);
        const qs = params.toString();
        return qs ? `/explore?${qs}` : '/explore';
      }
    case 'trending':
      return route.tab && route.tab !== 'palettes' ? `/trending?tab=${route.tab}` : '/trending';
    case 'new':
      return route.tab && route.tab !== 'palettes' ? `/new?tab=${route.tab}` : '/new';
    case 'random':
      return route.seed ? `/random?seed=${route.seed}` : '/random';
    case 'collections':
      return '/collections';
    case 'collection-detail':
      return `/collections/${route.slug}`;
    case 'creators':
      return '/creators';
    case 'creator-detail':
      return `/creators/${route.username}`;
    case 'patterns':
      return '/patterns';
    case 'pattern-detail':
      return `/patterns/${route.slug}`;
    case 'pattern-studio':
      {
        const params = new URLSearchParams();
        if (route.palette) params.set('palette', route.palette);
        if (route.type) params.set('type', route.type);
        if (route.scale) params.set('scale', route.scale);
        if (route.density) params.set('density', route.density);
        if (route.rotation) params.set('rotation', route.rotation);
        const qs = params.toString();
        return qs ? `/pattern-studio?${qs}` : '/pattern-studio';
      }
    case 'colors':
      return '/colors';
    case 'color-detail':
      return `/colors/${route.slug}`;
    case 'color-relationships':
      return `/colors/${route.slug}/relationships`;
    case 'color-of-the-day':
      return '/color-of-the-day';
    case 'palettes':
      return '/palettes';
    case 'palette-detail':
      return `/palettes/${route.slug}`;
    case 'palette-remix':
      return `/palettes/${route.slug}/remix`;
    case 'palette-of-the-day':
      return '/palette-of-the-day';
    case 'combos':
      return '/combos';
    case 'combo-detail':
      return `/combos/${route.slug}`;
    case 'gradients':
      return '/gradients';
    case 'gradient-detail':
      return `/gradients/${route.slug}`;
    case 'play':
      return route.game ? `/play/${route.game}` : '/play';
    case 'play-hexle':
      return '/play/hexle';
    case 'play-odd-one-out':
      return '/play/odd-one-out';
    case 'play-palette-match':
      return '/play/palette-match';
    case 'profile':
      return route.tab ? `/profile?tab=${route.tab}` : '/profile';
    case 'api-docs':
      return '/api';
    case 'live':
      return '/weather';
    case 'ramps':
      {
        const params = new URLSearchParams();
        if (route.b) params.set('b', route.b.replace('#', ''));
        if (route.a) params.set('a', route.a.replace('#', ''));
        if (route.a2) params.set('a2', route.a2.replace('#', ''));
        if (route.m && route.m !== 'full') params.set('m', route.m);
        if (route.s && route.s !== 'complementary') params.set('s', route.s);
        if (route.c && route.c !== 'AA') params.set('c', route.c);
        if (route.f && route.f !== 'oklch') params.set('f', route.f);
        if (route.v && route.v !== 'natural') params.set('v', route.v);
        if (route.xr) params.set('xr', route.xr);
        if (route.xt) params.set('xt', route.xt);
        const qs = params.toString();
        return qs ? `/ramps?${qs}` : '/ramps';
      }
    case 'api-palette':
      {
        const params = new URLSearchParams();
        if (route.b) params.set('b', route.b.replace('#', ''));
        if (route.m) params.set('m', route.m);
        if (route.s) params.set('s', route.s);
        if (route.c) params.set('c', route.c);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/palette?${qs}` : '/api/palette';
      }
    case 'springs':
    case 'antigravity':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.o && route.o !== 'circle') params.set('o', route.o);
        if (route.k && route.k !== '220') params.set('k', route.k);
        if (route.c && route.c !== '14') params.set('c', route.c);
        if (route.m && route.m !== '1') params.set('m', route.m);
        if (route.mode && route.mode !== 'single') params.set('mode', route.mode);
        if (route.f && route.f !== '0.04') params.set('f', route.f);
        const qs = params.toString();
        return qs ? `/springs?${qs}` : '/springs';
      }
    case 'api-springs':
    case 'api-antigravity':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.o) params.set('o', route.o);
        if (route.k) params.set('k', route.k);
        if (route.c) params.set('c', route.c);
        if (route.m) params.set('m', route.m);
        if (route.mode) params.set('mode', route.mode);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/springs?${qs}` : '/api/springs';
      }
    case 'mesh':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.s) params.set('s', route.s);
        if (route.sf) params.set('sf', route.sf);
        if (route.in) params.set('in', route.in);
        if (route.bl) params.set('bl', route.bl);
        if (route.gr) params.set('gr', route.gr);
        if (route.rot) params.set('rot', route.rot);
        if (route.sc) params.set('sc', route.sc);
        if (route.bg) params.set('bg', route.bg);
        if (route.scol) params.set('scol', route.scol);
        if (route.pts) params.set('pts', route.pts);
        const qs = params.toString();
        return qs ? `/mesh?${qs}` : '/mesh';
      }
    case 'api-mesh':
      {
        const params = new URLSearchParams();
        if (route.p) params.set('p', route.p);
        if (route.s) params.set('s', route.s);
        if (route.format) params.set('format', route.format);
        const qs = params.toString();
        return qs ? `/api/mesh?${qs}` : '/api/mesh';
      }
    case 'palette-generator':
    case 'generate':
      return route.colors ? `/generate?colors=${route.colors}` : '/generate';
    case 'create':
      return '/create';
    case 'about':
      return '/about';
    case 'search':
      return route.q ? `/search?q=${encodeURIComponent(route.q)}` : '/search';
    case 'contrast-checker':
      {
        const params = new URLSearchParams();
        if (route.fg) params.set('fg', route.fg.replace('#', ''));
        if (route.bg) params.set('bg', route.bg.replace('#', ''));
        const qs = params.toString();
        return qs ? `/contrast-checker?${qs}` : '/contrast-checker';
      }
    case 'color-picker':
      return route.hex ? `/color-picker?hex=${route.hex.replace('#', '')}` : '/color-picker';
    case 'color-name-finder':
      return route.hex ? `/color-name-finder?hex=${route.hex.replace('#', '')}` : '/color-name-finder';
    case 'extract-from-image':
      return route.imagePreset ? `/extract-from-image?preset=${route.imagePreset}` : '/extract-from-image';
    case 'brand-kit':
      {
        if (route.id) return `/brand-kit/${route.id}`;
        if (route.paletteSlug) return `/brand-kit?palette=${route.paletteSlug}`;
        return '/brand-kit';
      }
    case 'admin':
      return route.tab ? `/admin/${route.tab}` : '/admin';
    case 'saved':
      return '/saved';
    case 'not-found':
      return route.requestedUrl || '/404';
    default:
      return '/';
  }
}
