import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SavedItem {
  id: string;
  type: 'color' | 'palette' | 'combo' | 'gradient' | 'pattern' | 'collection';
  title: string;
  slug: string;
  preview: string; // hex color, comma-separated hexes, or gradient/pattern css
  metadata?: string;
  savedAt: number;
}

interface SavedContextType {
  savedItems: SavedItem[];
  saveItem: (item: Omit<SavedItem, 'savedAt'>) => void;
  removeItem: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAll: () => void;
  likedIds: string[];
  toggleLike: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  getLikedItems: () => SavedItem[];
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const STORAGE_KEY = 'kroma_saved_specimens_v1';
const LIKES_KEY = 'kroma_liked_items_v1';

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LIKES_KEY);
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

  useEffect(() => {
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify(likedIds));
    } catch (e) {
      console.error('Failed to persist likes:', e);
    }
  }, [likedIds]);

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

  const toggleLike = (id: string): boolean => {
    let nowLiked = false;
    setLikedIds((prev) => {
      if (prev.includes(id)) {
        nowLiked = false;
        return prev.filter((i) => i !== id);
      } else {
        nowLiked = true;
        return [id, ...prev];
      }
    });
    return nowLiked;
  };

  const isLiked = (id: string) => {
    return likedIds.includes(id);
  };

  const getLikedItems = () => {
    return savedItems.filter((i) => likedIds.includes(i.id));
  };

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        saveItem,
        removeItem,
        isSaved,
        clearAll,
        likedIds,
        toggleLike,
        isLiked,
        getLikedItems,
      }}
    >
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
