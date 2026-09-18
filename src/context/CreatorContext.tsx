import React, { createContext, useContext, useState, useEffect } from 'react';
import { CreatorItem, PaletteItem } from '../types';
import { CURATED_CREATORS } from '../data/creators';

interface CreatorContextType {
  creators: CreatorItem[];
  getCreatorByUsername: (username: string) => CreatorItem | undefined;
  publishCreatorPalette: (palette: PaletteItem) => void;
  myPublishedPalettes: PaletteItem[];
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);
const PUBLISHED_KEY = 'kroma_user_published_palettes_v1';

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creators] = useState<CreatorItem[]>(CURATED_CREATORS);
  const [myPublishedPalettes, setMyPublishedPalettes] = useState<PaletteItem[]>(() => {
    try {
      const stored = localStorage.getItem(PUBLISHED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(myPublishedPalettes));
    } catch (e) {
      console.error('Failed to persist published palettes:', e);
    }
  }, [myPublishedPalettes]);

  const publishCreatorPalette = (palette: PaletteItem) => {
    setMyPublishedPalettes((prev) => {
      const exists = prev.some((p) => p.id === palette.id);
      if (exists) {
        return prev.map((p) => (p.id === palette.id ? palette : p));
      }
      return [palette, ...prev];
    });
  };

  const getCreatorByUsername = (username: string) => {
    const clean = username.toLowerCase();
    return creators.find((c) => c.username.toLowerCase() === clean || c.id.toLowerCase() === clean);
  };

  return (
    <CreatorContext.Provider
      value={{
        creators,
        getCreatorByUsername,
        publishCreatorPalette,
        myPublishedPalettes,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreators = (): CreatorContextType => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreators must be used within a CreatorProvider');
  }
  return context;
};
