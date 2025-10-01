'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type SkillItem } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  items: SkillItem[];
  onChange: (items: SkillItem[]) => void;
  onValidate: (ok: boolean, errors: string[]) => void;
  triggerValidation?: boolean;
}

export function SkillsStep({
  items,
  onChange,
  onValidate,
  triggerValidation,
}: Props) {
  const validatedRef = useRef(false);

  const addItem = () =>
    onChange([
      ...items,
      { id: crypto.randomUUID(), name: '', proficiency: '' },
    ]);

  const updateItem = (id: string, patch: Partial<SkillItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const validate = () => {
    const errors: string[] = [];
    if (items.length === 0) errors.push('At least one skill required');
    items.forEach((i, idx) => {
      if (!i.name) errors.push(`Skill #${idx + 1}: name required`);
    });
    onValidate(errors.length === 0, errors);
  };

  useEffect(() => {
    if (triggerValidation && !validatedRef.current) {
      validatedRef.current = true;
      validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerValidation]);

  return (
    <div className="space-y-6">
      {items.map((s, idx) => (
        <div
          key={s.id}
          className="rounded-md border p-4 space-y-3 bg-background"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Skill #{idx + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(s.id)}
              disabled={items.length === 1}
            >
              Remove
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Name *</Label>
              <Input
                value={s.name}
                onChange={(e) => updateItem(s.id, { name: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Proficiency</Label>
              <Input
                placeholder="e.g. Beginner / Intermediate / Advanced"
                value={s.proficiency}
                onChange={(e) =>
                  updateItem(s.id, { proficiency: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem}>
        Add Skill
      </Button>
    </div>
  );
}
