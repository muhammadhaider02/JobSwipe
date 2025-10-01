'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type ExperienceItem } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
  onValidate: (ok: boolean, errors: string[]) => void;
  triggerValidation?: boolean;
}

export function ExperienceStep({
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
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);

  const updateItem = (id: string, patch: Partial<ExperienceItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const validate = () => {
    const errors: string[] = [];
    if (items.length === 0) {
      errors.push('At least one experience entry is required');
    }
    const requiredFields: (keyof ExperienceItem)[] = [
      'company',
      'role',
      'startDate',
    ];
    items.forEach((i, idx) => {
      requiredFields.forEach((f) => {
        if (!i[f]) errors.push(`Experience #${idx + 1}: ${f} required`);
      });
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
      {items.map((exp, idx) => (
        <div
          key={exp.id}
          className="relative rounded-md border p-4 space-y-3 bg-background"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Experience #{idx + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(exp.id)}
              disabled={items.length === 1}
            >
              Remove
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Company *</Label>
              <Input
                value={exp.company}
                onChange={(e) =>
                  updateItem(exp.id, { company: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Role *</Label>
              <Input
                value={exp.role}
                onChange={(e) => updateItem(exp.id, { role: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={exp.startDate}
                onChange={(e) =>
                  updateItem(exp.id, { startDate: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>End Date</Label>
              <Input
                type="date"
                value={exp.endDate}
                onChange={(e) =>
                  updateItem(exp.id, { endDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Description</Label>
            <textarea
              className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={exp.description}
              onChange={(e) =>
                updateItem(exp.id, { description: e.target.value })
              }
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem}>
        Add Experience
      </Button>
    </div>
  );
}
