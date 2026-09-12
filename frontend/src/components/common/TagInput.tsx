import React, { useMemo, useState } from 'react';
import { CrossIcon } from '../icons';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

/** Pill-based tag entry with autocomplete against known tags — Enter/comma commits, Backspace on an empty input removes the last pill. */
export const TagInput: React.FC<TagInputProps> = ({ value, onChange, suggestions = [], placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizedValue = useMemo(() => new Set(value.map((v) => v.toLowerCase())), [value]);

  const filteredSuggestions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    return suggestions
      .filter((s) => !normalizedValue.has(s.toLowerCase()))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, 6);
  }, [suggestions, inputValue, normalizedValue]);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || normalizedValue.has(tag.toLowerCase())) {
      setInputValue('');
      return;
    }
    onChange([...value, tag]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className="w-full min-h-10 px-2.5 py-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border bg-white border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-100/70 px-2 py-0.5 text-xs font-medium text-brand-700"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-brand-900"
              aria-label={`Remove tag ${tag}`}
            >
              <CrossIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] text-sm outline-hidden bg-transparent py-1"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg py-1 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(s)}
              className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
