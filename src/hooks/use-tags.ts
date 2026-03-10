import { useState, useCallback, useRef } from 'react';

export interface Tag {
  id: string;
  label: string;
}

interface UseTagsOptions {
  defaultTags?: Tag[];
  maxTags?: number;
  onChange?: (tags: Tag[]) => void;
}

export function useTags({ defaultTags = [], maxTags, onChange }: UseTagsOptions = {}) {
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [inputValue, setInputValue] = useState('');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const addTag = useCallback((tag: Tag) => {
    setTags(prev => {
      if (maxTags && prev.length >= maxTags) return prev;
      if (prev.find(t => t.id === tag.id)) return prev;
      const next = [...prev, tag];
      onChangeRef.current?.(next);
      return next;
    });
    setInputValue('');
  }, [maxTags]);

  const removeTag = useCallback((tagId: string) => {
    setTags(prev => {
      const next = prev.filter(t => t.id !== tagId);
      onChangeRef.current?.(next);
      return next;
    });
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
