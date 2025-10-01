'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type CertificateItem } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  items: CertificateItem[];
  onChange: (items: CertificateItem[]) => void;
  onValidate: (ok: boolean, errors: string[]) => void;
  triggerValidation?: boolean;
}

export function CertificatesStep({
  items,
  onChange,
  onValidate,
  triggerValidation,
}: Props) {
  const validatedRef = useRef(false);

  const addItem = () =>
    onChange([
      ...items,
      { id: crypto.randomUUID(), title: '', issuer: '', issueDate: '' },
    ]);

  const updateItem = (id: string, patch: Partial<CertificateItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const validate = () => {
    const errors: string[] = [];
    // Certificates optional; only validate filled ones need title/issuer
    items.forEach((i, idx) => {
      if (i.title && !i.issuer)
        errors.push(`Certificate #${idx + 1}: issuer required with title`);
      if (i.issuer && !i.title)
        errors.push(`Certificate #${idx + 1}: title required with issuer`);
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
      {items.map((c, idx) => (
        <div
          key={c.id}
          className="rounded-md border p-4 space-y-3 bg-background"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Certificate #{idx + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(c.id)}
              disabled={items.length === 1}
            >
              Remove
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-1">
              <Label>Title</Label>
              <Input
                value={c.title}
                onChange={(e) => updateItem(c.id, { title: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Issuer</Label>
              <Input
                value={c.issuer}
                onChange={(e) => updateItem(c.id, { issuer: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={c.issueDate}
                onChange={(e) =>
                  updateItem(c.id, { issueDate: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem}>
        Add Certificate
      </Button>
      <p className="text-xs text-muted-foreground">
        Certificates are optional. You can leave this step empty.
      </p>
    </div>
  );
}
