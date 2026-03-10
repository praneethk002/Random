import { useState, useCallback, useEffect } from 'react';

export interface Tag {
  id: string;
  label: string;
}

interface UseTagsOptions {
  defaultTags?: Tag[];
  maxTags?: number;
  onChange?: (tags: Tag[]) => void;
  /** When provided, overrides internal state with this tag list */
  controlledTags?: Tag[];
}

export function useTags({ defaultTags = [], maxTags, onChange, controlledTags }: UseTagsOptions = {}) {
  const [tags, setTags] = useState<Tag[]>(defaultTags);

  useEffect(() => {
    if (controlledTags !== undefined) {
      setTags(controlledTags);
    }
  }, [controlledTags]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    onChange?.(tags);
  }, [tags]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = useCallback((tag: Tag) => {
    if (maxTags && tags.length >= maxTags) return;
    if (tags.find(t => t.id === tag.id)) return;
    setTags(prev => [...prev, tag]);
    setInputValue('');
  }, [tags, maxTags]);

  const removeTag = useCallback((tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, suggestions: Tag[]) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const match = suggestions.find(s => s.label.toLowerCase() === inputValue.trim().toLowerCase());
      if (match) {
        addTag(match);
      } else {
        addTag({ id: inputValue.trim().toLowerCase().replace(/\s+/g, '-'), label: inputValue.trim() });
      }
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  }, [inputValue, tags, addTag, removeTag]);

  return { tags, inputValue, addTag, removeTag, handleInputChange, handleKeyDown };
}
