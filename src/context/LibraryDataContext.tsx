import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorItem, PaletteItem, ComboItem, GradientItem } from '../types';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';

interface LibraryDataContextType {
  colors: ColorItem[];
  palettes: PaletteItem[];
  combos: ComboItem[];
  gradients: GradientItem[];
  addColor: (color: ColorItem) => void;
  updateColor: (color: ColorItem) => void;
  deleteColor: (id: string) => void;
  addPalette: (palette: PaletteItem) => void;
  updatePalette: (palette: PaletteItem) => void;
  deletePalette: (id: string) => void;
  addCombo: (combo: ComboItem) => void;
  updateCombo: (combo: ComboItem) => void;
  deleteCombo: (id: string) => void;
  addGradient: (gradient: GradientItem) => void;
  updateGradient: (gradient: GradientItem) => void;
  deleteGradient: (id: string) => void;
  importBatch: (data: { colors?: ColorItem[]; palettes?: PaletteItem[]; combos?: ComboItem[]; gradients?: GradientItem[] }) => void;
}

const LibraryDataContext = createContext<LibraryDataContextType | undefined>(undefined);

export const LibraryDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colors, setColors] = useState<ColorItem[]>(() => {
    try {
      const custom = localStorage.getItem('kroma_custom_colors');
      const deleted = JSON.parse(localStorage.getItem('kroma_deleted_colors') || '[]');
      let list = [...CURATED_COLORS];
      if (deleted.length > 0) {
        list = list.filter((c) => !deleted.includes(c.id));
      }
      if (custom) {
        const parsed = JSON.parse(custom);
        return [...parsed, ...list];
      }
      return list;
    } catch {
      return CURATED_COLORS;
    }
  });

  const [palettes, setPalettes] = useState<PaletteItem[]>(() => {
    try {
      const custom = localStorage.getItem('kroma_custom_palettes');
      const deleted = JSON.parse(localStorage.getItem('kroma_deleted_palettes') || '[]');
      let list = [...CURATED_PALETTES];
      if (deleted.length > 0) {
        list = list.filter((p) => !deleted.includes(p.id));
      }
      if (custom) {
        const parsed = JSON.parse(custom);
        return [...parsed, ...list];
      }
      return list;
    } catch {
      return CURATED_PALETTES;
    }
  });

  const [combos, setCombos] = useState<ComboItem[]>(() => {
    try {
      const custom = localStorage.getItem('kroma_custom_combos');
      const deleted = JSON.parse(localStorage.getItem('kroma_deleted_combos') || '[]');
      let list = [...CURATED_COMBOS];
      if (deleted.length > 0) {
        list = list.filter((c) => !deleted.includes(c.id));
      }
      if (custom) {
        const parsed = JSON.parse(custom);
        return [...parsed, ...list];
      }
      return list;
    } catch {
      return CURATED_COMBOS;
    }
  });

  const [gradients, setGradients] = useState<GradientItem[]>(() => {
    try {
      const custom = localStorage.getItem('kroma_custom_gradients');
      const deleted = JSON.parse(localStorage.getItem('kroma_deleted_gradients') || '[]');
      let list = [...CURATED_GRADIENTS];
      if (deleted.length > 0) {
        list = list.filter((g) => !deleted.includes(g.id));
      }
      if (custom) {
        const parsed = JSON.parse(custom);
        return [...parsed, ...list];
      }
      return list;
    } catch {
      return CURATED_GRADIENTS;
    }
  });

  // Color actions
  const addColor = (color: ColorItem) => {
    setColors((prev) => {
      const updated = [color, ...prev];
      try {
        const custom = JSON.parse(localStorage.getItem('kroma_custom_colors') || '[]');
        localStorage.setItem('kroma_custom_colors', JSON.stringify([color, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updateColor = (color: ColorItem) => {
    setColors((prev) => {
      const updated = prev.map((c) => (c.id === color.id ? color : c));
      return updated;
    });
  };

  const deleteColor = (id: string) => {
    setColors((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        const deleted = JSON.parse(localStorage.getItem('kroma_deleted_colors') || '[]');
        localStorage.setItem('kroma_deleted_colors', JSON.stringify([...deleted, id]));
      } catch {}
      return updated;
    });
  };

  // Palette actions
  const addPalette = (palette: PaletteItem) => {
    setPalettes((prev) => {
      const updated = [palette, ...prev];
      try {
        const custom = JSON.parse(localStorage.getItem('kroma_custom_palettes') || '[]');
        localStorage.setItem('kroma_custom_palettes', JSON.stringify([palette, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updatePalette = (palette: PaletteItem) => {
    setPalettes((prev) => prev.map((p) => (p.id === palette.id ? palette : p)));
  };

  const deletePalette = (id: string) => {
    setPalettes((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        const deleted = JSON.parse(localStorage.getItem('kroma_deleted_palettes') || '[]');
        localStorage.setItem('kroma_deleted_palettes', JSON.stringify([...deleted, id]));
      } catch {}
      return updated;
    });
  };

  // Combo actions
  const addCombo = (combo: ComboItem) => {
    setCombos((prev) => {
      const updated = [combo, ...prev];
      try {
        const custom = JSON.parse(localStorage.getItem('kroma_custom_combos') || '[]');
        localStorage.setItem('kroma_custom_combos', JSON.stringify([combo, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updateCombo = (combo: ComboItem) => {
    setCombos((prev) => prev.map((c) => (c.id === combo.id ? combo : c)));
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        const deleted = JSON.parse(localStorage.getItem('kroma_deleted_combos') || '[]');
        localStorage.setItem('kroma_deleted_combos', JSON.stringify([...deleted, id]));
      } catch {}
      return updated;
    });
  };

  // Gradient actions
  const addGradient = (gradient: GradientItem) => {
    setGradients((prev) => {
      const updated = [gradient, ...prev];
      try {
        const custom = JSON.parse(localStorage.getItem('kroma_custom_gradients') || '[]');
        localStorage.setItem('kroma_custom_gradients', JSON.stringify([gradient, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updateGradient = (gradient: GradientItem) => {
    setGradients((prev) => prev.map((g) => (g.id === gradient.id ? gradient : g)));
  };

  const deleteGradient = (id: string) => {
    setGradients((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      try {
        const deleted = JSON.parse(localStorage.getItem('kroma_deleted_gradients') || '[]');
        localStorage.setItem('kroma_deleted_gradients', JSON.stringify([...deleted, id]));
      } catch {}
      return updated;
    });
  };

  const importBatch = (data: { colors?: ColorItem[]; palettes?: PaletteItem[]; combos?: ComboItem[]; gradients?: GradientItem[] }) => {
    if (data.colors && data.colors.length > 0) {
      setColors((prev) => [...data.colors!, ...prev]);
    }
    if (data.palettes && data.palettes.length > 0) {
      setPalettes((prev) => [...data.palettes!, ...prev]);
    }
    if (data.combos && data.combos.length > 0) {
      setCombos((prev) => [...data.combos!, ...prev]);
    }
    if (data.gradients && data.gradients.length > 0) {
      setGradients((prev) => [...data.gradients!, ...prev]);
    }
  };

  return (
    <LibraryDataContext.Provider
      value={{
        colors,
        palettes,
        combos,
        gradients,
        addColor,
        updateColor,
        deleteColor,
        addPalette,
        updatePalette,
        deletePalette,
        addCombo,
        updateCombo,
        deleteCombo,
        addGradient,
        updateGradient,
        deleteGradient,
        importBatch,
      }}
    >
      {children}
    </LibraryDataContext.Provider>
  );
};

export const useLibraryData = (): LibraryDataContextType => {
  const context = useContext(LibraryDataContext);
  if (!context) {
    throw new Error('useLibraryData must be used within a LibraryDataProvider');
  }
  return context;
};
