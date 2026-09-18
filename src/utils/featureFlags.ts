export interface FeatureFlags {
  enableExplore: boolean;
  enableTrending: boolean;
  enableNew: boolean;
  enableCollections: boolean;
  enableRemix: boolean;
  enableCreators: boolean;
  enablePatterns: boolean;
  enableGames: boolean;
  enableDailyContent: boolean;
  enablePublicPublishing: boolean;
  enableTokenExport: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  enableExplore: true,
  enableTrending: true,
  enableNew: true,
  enableCollections: true,
  enableRemix: true,
  enableCreators: true,
  enablePatterns: true,
  enableGames: true,
  enableDailyContent: true,
  enablePublicPublishing: true,
  enableTokenExport: true,
};

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[flag] ?? true;
}
