import React, { useState } from 'react';
import { X, Plus, Check, Layers } from 'lucide-react';
import { useCollections } from '../context/CollectionContext';
import { useToast } from '../context/ToastContext';
import { KromaButton } from './common/KromaButton';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    type: 'palette' | 'color' | 'gradient' | 'combo' | 'pattern';
    refId: string;
    slug: string;
    title: string;
    preview: string;
    metadata?: string;
  };
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { collections, addItemToCollection, createCollection } = useCollections();
  const { showToast } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (colId: string, colTitle: string) => {
    addItemToCollection(colId, item);
    showToast(`Added to "${colTitle}"`, item.title);
    onClose();
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newCol = createCollection(newTitle.trim(), 'Custom user collection');
    addItemToCollection(newCol.id, item);
    showToast(`Created & added to "${newCol.title}"`, item.title);
    setNewTitle('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[var(--color-primary)]" />
            <span className="font-bold text-sm text-[var(--text-primary)]">
              Add to Collection
            </span>
          </div>
          <KromaButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-7 h-7 min-h-[28px] p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Close dialog"
          >
            <X size={16} />
          </KromaButton>
        </div>

        {/* Item Preview */}
        <div className="flex items-center gap-3 p-2.5 bg-[var(--bg-surface-2)] rounded-xs border border-[var(--border-subtle)]">
          <div
            className="w-10 h-10 rounded-xs flex-shrink-0 border border-black/10 shadow-inner"
            style={{
              backgroundColor: item.preview.split(',')[0]?.startsWith('#') ? item.preview.split(',')[0] : '#111215',
            }}
          />
          <div className="min-w-0">
            <div className="font-bold text-xs text-[var(--text-primary)] truncate">{item.title}</div>
            <div className="font-mono text-xs text-[var(--text-tertiary)] uppercase">{item.type}</div>
          </div>
        </div>

        {/* Collections List */}
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
          {collections.map((col) => {
            const alreadyIn = col.items.some((i) => i.refId === item.refId);
            return (
              <KromaButton
                key={col.id}
                type="button"
                variant="subtle"
                onClick={() => handleAdd(col.id, col.title)}
                className="w-full flex items-center justify-between p-2.5 rounded-xs border border-[var(--border-subtle)] transition-colors text-left normal-case min-h-[44px]"
              >
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">{col.title}</div>
                  <div className="text-xs text-[var(--text-tertiary)] font-mono font-normal">{col.items.length} items</div>
                </div>
                {alreadyIn ? (
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <Plus size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
                )}
              </KromaButton>
            );
          })}
        </div>

        {/* Create New Collection Inline */}
        {isCreating ? (
          <form onSubmit={handleCreateAndAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Collection name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 text-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xs px-3 py-1.5"
              autoFocus
            />
            <KromaButton type="submit" variant="filled" size="sm">
              Create &amp; Add
            </KromaButton>
          </form>
        ) : (
          <KromaButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="text-xs text-[var(--color-primary)] flex items-center gap-1 font-semibold"
            iconLeft={<Plus size={13} />}
          >
            <span>Create new collection</span>
          </KromaButton>
        )}
      </div>
    </div>
  );
};
