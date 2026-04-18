'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/forms/input';
import { useClickOutside } from '@/hooks/ui/use-click-outside';
import { useEducationProviders } from '@/hooks/schools/use-education-providers';
import { cn } from '@/lib/core/utils';

interface SchoolAutocompleteInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface SchoolOption {
  name: string;
  logoUrl: string;
  normalized: string;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeText = (value: string) => stripHtml(value).toLowerCase();
const MAX_RESULTS = 40;

export function SchoolAutocompleteInput({
  id,
  value,
  onChange,
  placeholder,
  className,
}: SchoolAutocompleteInputProps) {
  const { schools } = useEducationProviders();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id}-school-options`;

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  });

  const schoolOptions = useMemo(() => {
    const deduped = new Map<string, SchoolOption>();

    schools.forEach((school) => {
      const name = stripHtml(school.university);
      const normalized = normalizeText(name);
      if (!normalized) return;

      const existing = deduped.get(normalized);
      if (!existing || (!existing.logoUrl && school.logoUrl)) {
        deduped.set(normalized, {
          name,
          normalized,
          logoUrl: school.logoUrl || '',
        });
      }
    });

    return Array.from(deduped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [schools]);

  const filteredOptions = useMemo(() => {
    const query = normalizeText(value);
    if (!query) return schoolOptions.slice(0, MAX_RESULTS);
    return schoolOptions.filter((option) => option.normalized.includes(query)).slice(0, MAX_RESULTS);
  }, [schoolOptions, value]);

  const selectOption = useCallback((option: SchoolOption) => {
    onChange(option.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
      event.preventDefault();
      selectOption(filteredOptions[highlightedIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('pr-9', className)}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
      />

      <button
        type="button"
        aria-label={isOpen ? 'Hide school suggestions' : 'Show school suggestions'}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setHighlightedIndex(-1);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-slate-100"
      >
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            <ul id={listboxId} role="listbox" className="max-h-72 overflow-auto py-1">
              {filteredOptions.map((option, index) => {
                const isHighlighted = highlightedIndex === index;

                return (
                  <li key={option.normalized} role="option" aria-selected={isHighlighted}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-slate-900',
                        isHighlighted ? 'bg-slate-100' : 'hover:bg-slate-50',
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOption(option)}
                    >
                      {option.logoUrl ? (
                        <img
                          src={option.logoUrl}
                          alt={`${option.name} logo`}
                          className="h-6 w-6 rounded-full border border-slate-200 bg-white object-contain"
                        />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004097]/10 text-[11px] font-semibold text-[#004097]">
                          {option.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="truncate">{option.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No school match. You can still type any school name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
