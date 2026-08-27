import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SavedItem {
  id: string;
  type: 'color' | 'palette' | 'combo' | 'gradient';
  title: string;
  slug: string;
  preview: string; // hex color, comma-separated hexes, or gradient css
  metadata?: string;
  savedAt: number;
}

interface SavedContextType {
  savedItems: SavedItem[];
  saveItem: (item: Omit<SavedItem, 'savedAt'>) => void;
  removeItem: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAll: () => void;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const STORAGE_KEY = 'kroma_saved_specimens_v1';

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch (e) {
      console.error('Failed to persist saved items:', e);
    }
  }, [savedItems]);

  const saveItem = (item: Omit<SavedItem, 'savedAt'>) => {
    setSavedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [{ ...item, savedAt: Date.now() }, ...prev];
    });
  };

  const removeItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isSaved = (id: string) => {
    return savedItems.some((i) => i.id === id);
  };

  const clearAll = () => {
    setSavedItems([]);
  };

  return (
    <SavedContext.Provider value={{ savedItems, saveItem, removeItem, isSaved, clearAll }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};
