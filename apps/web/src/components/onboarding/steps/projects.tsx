'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type ProjectItem } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
  onValidate: (ok: boolean, errors: string[]) => void;
  triggerValidation?: boolean;
}

export function ProjectsStep({
  items,
  onChange,
  onValidate,
  triggerValidation,
}: Props) {
  const validatedRef = useRef(false);

  const addItem = () =>
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        link: '',
      },
    ]);

  const updateItem = (id: string, patch: Partial<ProjectItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const validate = () => {
    const errors: string[] = [];
    if (items.length === 0) {
      errors.push('At least one project entry is required');
    }
    items.forEach((i, idx) => {
      if (!i.title) errors.push(`Project #${idx + 1}: title required`);
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
      {items.map((p, idx) => (
        <div
          key={p.id}
          className="relative rounded-md border p-4 space-y-3 bg-background"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Project #{idx + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(p.id)}
              disabled={items.length === 1}
            >
              Remove
            </Button>
          </div>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label>Title *</Label>
              <Input
                value={p.title}
                onChange={(e) => updateItem(p.id, { title: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Description</Label>
              <textarea
                className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={p.description}
                onChange={(e) =>
                  updateItem(p.id, { description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Link</Label>
              <Input
                value={p.link}
                onChange={(e) => updateItem(p.id, { link: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem}>
        Add Project
      </Button>
    </div>
  );
}
