'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type EducationItem } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
  onValidate: (ok: boolean, errors: string[]) => void;
  triggerValidation?: boolean;
}

export function EducationStep({
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
        institution: '',
        degree: '',
        startDate: '',
        endDate: '',
      },
    ]);

  const updateItem = (id: string, patch: Partial<EducationItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const validate = () => {
    const errors: string[] = [];
    if (items.length === 0) {
      errors.push('At least one education entry is required');
    }
    const requiredFields: (keyof EducationItem)[] = [
      'institution',
      'degree',
      'startDate',
    ];
    items.forEach((i, idx) => {
      requiredFields.forEach((f) => {
        if (!i[f]) errors.push(`Education #${idx + 1}: ${f} required`);
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
      {items.map((ed, idx) => (
        <div
          key={ed.id}
          className="relative rounded-md border p-4 space-y-3 bg-background"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Education #{idx + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(ed.id)}
              disabled={items.length === 1}
            >
              Remove
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Institution *</Label>
              <Input
                value={ed.institution}
                onChange={(e) =>
                  updateItem(ed.id, { institution: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Degree *</Label>
              <Input
                value={ed.degree}
                onChange={(e) => updateItem(ed.id, { degree: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={ed.startDate}
                onChange={(e) =>
                  updateItem(ed.id, { startDate: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>End Date</Label>
              <Input
                type="date"
                value={ed.endDate}
                onChange={(e) => updateItem(ed.id, { endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem}>
        Add Education
      </Button>
    </div>
  );
}
