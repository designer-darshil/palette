/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GTM_ID?: string;
  readonly VITE_GA_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __RAINBOW_LOADER_COMPLETE__?: () => void;
}
