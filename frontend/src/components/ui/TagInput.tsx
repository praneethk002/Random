import { useState, useRef } from 'react';
import { useTags } from '../../hooks/use-tags';
import type { Tag } from '../../hooks/use-tags';
import { useClickOutside } from '../../hooks/use-click-outside';
import './TagInput.css';

interface TagInputProps {
  label: string;
  placeholder?: string;
  suggestions: Tag[];
  defaultTags?: Tag[];
  maxTags?: number;
  onChange?: (tags: Tag[]) => void;
  /** When provided, syncs internal tag state to this list */
  controlledTags?: Tag[];
}

export function TagInput({
  label,
  placeholder,
  suggestions,
  defaultTags = [],
  maxTags,
  onChange,
  controlledTags,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { tags, inputValue, addTag, removeTag, handleInputChange, handleKeyDown } = useTags({
    defaultTags,
    maxTags,
    onChange,
    controlledTags,
  });

  useClickOutside(containerRef, () => setIsOpen(false));

  const filteredSuggestions = suggestions
    .filter(s => s.label.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="tag-input">
      <label className="tag-input__label">{label}</label>
      <div className="tag-input__field" ref={containerRef}>
        <div className="tag-input__tags">
          {tags.map(tag => (
            <span key={tag.id} className="tag-input__tag">
              <span className="tag-input__tag-label">{tag.label}</span>
              <button
                type="button"
                className="tag-input__tag-remove"
                onClick={() => removeTag(tag.id)}
                aria-label={`Remove ${tag.label}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
          <input
            className="tag-input__input"
            type="text"
            value={inputValue}
            onChange={e => {
              handleInputChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={e => handleKeyDown(e, suggestions)}
            placeholder={tags.length === 0 ? placeholder : ''}
          />
        </div>
        {isOpen && filteredSuggestions.length > 0 && (
          <ul className="tag-input__dropdown" role="listbox">
            {filteredSuggestions.map(s => (
              <li
                key={s.id}
                className="tag-input__dropdown-item"
                role="option"
                aria-selected={!!tags.find(t => t.id === s.id)}
                onClick={() => {
                  addTag(s);
                  setIsOpen(false);
                }}
              >
                <span className="tag-input__dropdown-check">
                  {tags.find(t => t.id === s.id) ? '✓' : ''}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
