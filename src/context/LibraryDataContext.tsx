import React, { createContext, useContext, useState } from 'react';
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
      const custom: ColorItem[] = JSON.parse(localStorage.getItem('kroma_custom_colors') || '[]');
      const modified: Record<string, ColorItem> = JSON.parse(localStorage.getItem('kroma_modified_colors') || '{}');
      const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_colors') || '[]');
      
      let list = CURATED_COLORS.map((c) => modified[c.id] || c);
      if (deleted.length > 0) {
        list = list.filter((c) => !deleted.includes(c.id));
      }
      const customWithModified = custom.map((c) => modified[c.id] || c);
      return [...customWithModified, ...list];
    } catch {
      return CURATED_COLORS;
    }
  });

  const [palettes, setPalettes] = useState<PaletteItem[]>(() => {
    try {
      const custom: PaletteItem[] = JSON.parse(localStorage.getItem('kroma_custom_palettes') || '[]');
      const modified: Record<string, PaletteItem> = JSON.parse(localStorage.getItem('kroma_modified_palettes') || '{}');
      const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_palettes') || '[]');
      
      let list = CURATED_PALETTES.map((p) => modified[p.id] || p);
      if (deleted.length > 0) {
        list = list.filter((p) => !deleted.includes(p.id));
      }
      const customWithModified = custom.map((p) => modified[p.id] || p);
      return [...customWithModified, ...list];
    } catch {
      return CURATED_PALETTES;
    }
  });

  const [combos, setCombos] = useState<ComboItem[]>(() => {
    try {
      const custom: ComboItem[] = JSON.parse(localStorage.getItem('kroma_custom_combos') || '[]');
      const modified: Record<string, ComboItem> = JSON.parse(localStorage.getItem('kroma_modified_combos') || '{}');
      const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_combos') || '[]');
      
      let list = CURATED_COMBOS.map((cb) => modified[cb.id] || cb);
      if (deleted.length > 0) {
        list = list.filter((cb) => !deleted.includes(cb.id));
      }
      const customWithModified = custom.map((cb) => modified[cb.id] || cb);
      return [...customWithModified, ...list];
    } catch {
      return CURATED_COMBOS;
    }
  });

  const [gradients, setGradients] = useState<GradientItem[]>(() => {
    try {
      const custom: GradientItem[] = JSON.parse(localStorage.getItem('kroma_custom_gradients') || '[]');
      const modified: Record<string, GradientItem> = JSON.parse(localStorage.getItem('kroma_modified_gradients') || '{}');
      const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_gradients') || '[]');
      
      let list = CURATED_GRADIENTS.map((g) => modified[g.id] || g);
      if (deleted.length > 0) {
        list = list.filter((g) => !deleted.includes(g.id));
      }
      const customWithModified = custom.map((g) => modified[g.id] || g);
      return [...customWithModified, ...list];
    } catch {
      return CURATED_GRADIENTS;
    }
  });

  // Color actions
  const addColor = (color: ColorItem) => {
    setColors((prev) => {
      const updated = [color, ...prev];
      try {
        const custom: ColorItem[] = JSON.parse(localStorage.getItem('kroma_custom_colors') || '[]');
        localStorage.setItem('kroma_custom_colors', JSON.stringify([color, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updateColor = (color: ColorItem) => {
    setColors((prev) => {
      const updated = prev.map((c) => (c.id === color.id ? color : c));
      try {
        const modified: Record<string, ColorItem> = JSON.parse(localStorage.getItem('kroma_modified_colors') || '{}');
        modified[color.id] = color;
        localStorage.setItem('kroma_modified_colors', JSON.stringify(modified));

        // If it was a custom color, also update it in kroma_custom_colors
        const custom: ColorItem[] = JSON.parse(localStorage.getItem('kroma_custom_colors') || '[]');
        const updatedCustom = custom.map((c) => (c.id === color.id ? color : c));
        localStorage.setItem('kroma_custom_colors', JSON.stringify(updatedCustom));
      } catch {}
      return updated;
    });
  };

  const deleteColor = (id: string) => {
    setColors((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_colors') || '[]');
        if (!deleted.includes(id)) {
          localStorage.setItem('kroma_deleted_colors', JSON.stringify([...deleted, id]));
        }
        // Remove from custom if exists
        const custom: ColorItem[] = JSON.parse(localStorage.getItem('kroma_custom_colors') || '[]');
        localStorage.setItem('kroma_custom_colors', JSON.stringify(custom.filter((c) => c.id !== id)));
      } catch {}
      return updated;
    });
  };

  // Palette actions
  const addPalette = (palette: PaletteItem) => {
    setPalettes((prev) => {
      const updated = [palette, ...prev];
      try {
        const custom: PaletteItem[] = JSON.parse(localStorage.getItem('kroma_custom_palettes') || '[]');
        localStorage.setItem('kroma_custom_palettes', JSON.stringify([palette, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updatePalette = (palette: PaletteItem) => {
    setPalettes((prev) => {
      const updated = prev.map((p) => (p.id === palette.id ? palette : p));
      try {
        const modified: Record<string, PaletteItem> = JSON.parse(localStorage.getItem('kroma_modified_palettes') || '{}');
        modified[palette.id] = palette;
        localStorage.setItem('kroma_modified_palettes', JSON.stringify(modified));

        const custom: PaletteItem[] = JSON.parse(localStorage.getItem('kroma_custom_palettes') || '[]');
        const updatedCustom = custom.map((p) => (p.id === palette.id ? palette : p));
        localStorage.setItem('kroma_custom_palettes', JSON.stringify(updatedCustom));
      } catch {}
      return updated;
    });
  };

  const deletePalette = (id: string) => {
    setPalettes((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_palettes') || '[]');
        if (!deleted.includes(id)) {
          localStorage.setItem('kroma_deleted_palettes', JSON.stringify([...deleted, id]));
        }
        const custom: PaletteItem[] = JSON.parse(localStorage.getItem('kroma_custom_palettes') || '[]');
        localStorage.setItem('kroma_custom_palettes', JSON.stringify(custom.filter((p) => p.id !== id)));
      } catch {}
      return updated;
    });
  };

  // Combo actions
  const addCombo = (combo: ComboItem) => {
    setCombos((prev) => {
      const updated = [combo, ...prev];
      try {
        const custom: ComboItem[] = JSON.parse(localStorage.getItem('kroma_custom_combos') || '[]');
        localStorage.setItem('kroma_custom_combos', JSON.stringify([combo, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updateCombo = (combo: ComboItem) => {
    setCombos((prev) => {
      const updated = prev.map((c) => (c.id === combo.id ? combo : c));
      try {
        const modified: Record<string, ComboItem> = JSON.parse(localStorage.getItem('kroma_modified_combos') || '{}');
        modified[combo.id] = combo;
        localStorage.setItem('kroma_modified_combos', JSON.stringify(modified));

        const custom: ComboItem[] = JSON.parse(localStorage.getItem('kroma_custom_combos') || '[]');
        const updatedCustom = custom.map((c) => (c.id === combo.id ? combo : c));
        localStorage.setItem('kroma_custom_combos', JSON.stringify(updatedCustom));
      } catch {}
      return updated;
    });
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_combos') || '[]');
        if (!deleted.includes(id)) {
          localStorage.setItem('kroma_deleted_combos', JSON.stringify([...deleted, id]));
        }
        const custom: ComboItem[] = JSON.parse(localStorage.getItem('kroma_custom_combos') || '[]');
        localStorage.setItem('kroma_custom_combos', JSON.stringify(custom.filter((c) => c.id !== id)));
      } catch {}
      return updated;
    });
  };

  // Gradient actions
  const addGradient = (gradient: GradientItem) => {
    setGradients((prev) => {
      const updated = [gradient, ...prev];
      try {
        const custom: GradientItem[] = JSON.parse(localStorage.getItem('kroma_custom_gradients') || '[]');
        localStorage.setItem('kroma_custom_gradients', JSON.stringify([gradient, ...custom]));
      } catch {}
      return updated;
    });
  };

  const updateGradient = (gradient: GradientItem) => {
    setGradients((prev) => {
      const updated = prev.map((g) => (g.id === gradient.id ? gradient : g));
      try {
        const modified: Record<string, GradientItem> = JSON.parse(localStorage.getItem('kroma_modified_gradients') || '{}');
        modified[gradient.id] = gradient;
        localStorage.setItem('kroma_modified_gradients', JSON.stringify(modified));

        const custom: GradientItem[] = JSON.parse(localStorage.getItem('kroma_custom_gradients') || '[]');
        const updatedCustom = custom.map((g) => (g.id === gradient.id ? gradient : g));
        localStorage.setItem('kroma_custom_gradients', JSON.stringify(updatedCustom));
      } catch {}
      return updated;
    });
  };

  const deleteGradient = (id: string) => {
    setGradients((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('kroma_deleted_gradients') || '[]');
        if (!deleted.includes(id)) {
          localStorage.setItem('kroma_deleted_gradients', JSON.stringify([...deleted, id]));
        }
        const custom: GradientItem[] = JSON.parse(localStorage.getItem('kroma_custom_gradients') || '[]');
        localStorage.setItem('kroma_custom_gradients', JSON.stringify(custom.filter((g) => g.id !== id)));
      } catch {}
      return updated;
    });
  };

  const importBatch = (data: { colors?: ColorItem[]; palettes?: PaletteItem[]; combos?: ComboItem[]; gradients?: GradientItem[] }) => {
    if (data.colors && data.colors.length > 0) {
      setColors((prev) => {
        const updated = [...data.colors!, ...prev];
        try {
          const custom: ColorItem[] = JSON.parse(localStorage.getItem('kroma_custom_colors') || '[]');
          localStorage.setItem('kroma_custom_colors', JSON.stringify([...data.colors!, ...custom]));
        } catch {}
        return updated;
      });
    }
    if (data.palettes && data.palettes.length > 0) {
      setPalettes((prev) => {
        const updated = [...data.palettes!, ...prev];
        try {
          const custom: PaletteItem[] = JSON.parse(localStorage.getItem('kroma_custom_palettes') || '[]');
          localStorage.setItem('kroma_custom_palettes', JSON.stringify([...data.palettes!, ...custom]));
        } catch {}
        return updated;
      });
    }
    if (data.combos && data.combos.length > 0) {
      setCombos((prev) => {
        const updated = [...data.combos!, ...prev];
        try {
          const custom: ComboItem[] = JSON.parse(localStorage.getItem('kroma_custom_combos') || '[]');
          localStorage.setItem('kroma_custom_combos', JSON.stringify([...data.combos!, ...custom]));
        } catch {}
        return updated;
      });
    }
    if (data.gradients && data.gradients.length > 0) {
      setGradients((prev) => {
        const updated = [...data.gradients!, ...prev];
        try {
          const custom: GradientItem[] = JSON.parse(localStorage.getItem('kroma_custom_gradients') || '[]');
          localStorage.setItem('kroma_custom_gradients', JSON.stringify([...data.gradients!, ...custom]));
        } catch {}
        return updated;
      });
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
