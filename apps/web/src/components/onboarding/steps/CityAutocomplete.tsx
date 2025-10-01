'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { CITIES } from '@/data/cities';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing a city...',
  label = 'Location (City)',
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const matches = useMemo(() => {
    const term = input.trim().toLowerCase();
    if (!term) return [];
    return CITIES.filter((c) => c.toLowerCase().startsWith(term)).slice(0, 10);
  }, [input]);

  const pick = (city: string) => {
    onChange(city);
    setInput(city);
    setOpen(false);
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          value={input}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            onChange(''); // clear until selected
          }}
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          placeholder={placeholder}
          autoComplete="off"
        />
        {open && matches.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow text-sm">
            {matches.map((m) => (
              <li
                key={m}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(m);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                {m}
              </li>
            ))}
          </ul>
        )}
        {open && input && matches.length === 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover text-muted-foreground shadow text-xs px-3 py-2">
            No matches
          </div>
        )}
      </div>
    </div>
  );
}
