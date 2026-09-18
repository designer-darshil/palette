import React, { createContext, useContext, useState, useEffect } from 'react';
import { CollectionItem, CollectionElement } from '../types';
import { CURATED_COLLECTIONS } from '../data/collections';

interface CollectionContextType {
  collections: CollectionItem[];
  createCollection: (title: string, description: string, tags?: string[], isPublic?: boolean) => CollectionItem;
  updateCollection: (id: string, updates: Partial<Omit<CollectionItem, 'id' | 'items'>>) => void;
  deleteCollection: (id: string) => void;
  addItemToCollection: (collectionId: string, item: Omit<CollectionElement, 'id' | 'addedAt'>) => void;
  removeItemFromCollection: (collectionId: string, elementId: string) => void;
  reorderItems: (collectionId: string, items: CollectionElement[]) => void;
  duplicateCollection: (id: string) => CollectionItem | null;
  getCollectionBySlug: (slug: string) => CollectionItem | undefined;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);
const STORAGE_KEY = 'kroma_custom_collections_v1';

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CollectionItem[] = JSON.parse(stored);
        // Combine with curated
        const existingIds = new Set(parsed.map((c) => c.id));
        const defaultUnsaved = CURATED_COLLECTIONS.filter((c) => !existingIds.has(c.id));
        return [...parsed, ...defaultUnsaved];
      }
      return CURATED_COLLECTIONS;
    } catch {
      return CURATED_COLLECTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (e) {
      console.error('Failed to persist collections:', e);
    }
  }, [collections]);

  const createCollection = (title: string, description: string, tags: string[] = [], isPublic = true): CollectionItem => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const newCol: CollectionItem = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      description,
      items: [],
      creator: {
        name: 'You (Creator Workspace)',
        username: 'user',
      },
      visibility: isPublic ? 'public' : 'private',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags,
      likes: 0,
    };

    setCollections((prev) => [newCol, ...prev]);
    return newCol;
  };

  const updateCollection = (id: string, updates: Partial<Omit<CollectionItem, 'id' | 'items'>>) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c))
    );
  };

  const deleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const addItemToCollection = (collectionId: string, item: Omit<CollectionElement, 'id' | 'addedAt'>) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id !== collectionId) return col;
        // Avoid duplicate additions of same resource
        if (col.items.some((i) => i.refId === item.refId && i.type === item.type)) {
          return col;
        }
        const newElem: CollectionElement = {
          ...item,
          id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          addedAt: Date.now(),
        };
        const updatedItems = [newElem, ...col.items];
        const cover = updatedItems.slice(0, 5).map((i) => i.preview).join(',');
        return {
          ...col,
          items: updatedItems,
          coverPreview: cover || col.coverPreview,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const removeItemFromCollection = (collectionId: string, elementId: string) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id !== collectionId) return col;
        const updatedItems = col.items.filter((i) => i.id !== elementId && i.refId !== elementId);
        return {
          ...col,
          items: updatedItems,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const reorderItems = (collectionId: string, items: CollectionElement[]) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === collectionId ? { ...col, items, updatedAt: Date.now() } : col))
    );
  };

  const duplicateCollection = (id: string): CollectionItem | null => {
    const existing = collections.find((c) => c.id === id);
    if (!existing) return null;
    const duplicated: CollectionItem = {
      ...existing,
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: `${existing.slug}-copy-${Math.random().toString(36).substring(2, 4)}`,
      title: `${existing.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: 0,
      items: existing.items.map((it) => ({
        ...it,
        id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        addedAt: Date.now(),
      })),
    };
    setCollections((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const getCollectionBySlug = (slug: string) => {
    const clean = slug.toLowerCase();
    return collections.find((c) => c.slug.toLowerCase() === clean || c.id.toLowerCase() === clean);
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        createCollection,
        updateCollection,
        deleteCollection,
        addItemToCollection,
        removeItemFromCollection,
        reorderItems,
        duplicateCollection,
        getCollectionBySlug,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollections = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
};
