'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type PersonalInfo } from '../types';
import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CityAutocomplete } from './CityAutocomplete';

const REQUIRED_FIELDS: (keyof PersonalInfo)[] = [
  'fullName',
  'email',
  'phone',
  'location',
  'summary',
  'jobTitle',
];

interface Props {
  value: PersonalInfo;
  onChange: (v: Partial<PersonalInfo>) => void;
  onValidate: (ok: boolean, errors: string[]) => void;
  triggerValidation?: boolean;
}

export function PersonalInfoStep({
  value,
  onChange,
  onValidate,
  triggerValidation,
}: Props) {
  const validatedRef = useRef(false);

  const runValidation = useCallback(() => {
    const errors: string[] = [];
    REQUIRED_FIELDS.forEach((f) => {
      if (
        !value[f] ||
        (typeof value[f] === 'string' && value[f].trim() === '')
      ) {
        errors.push(`${f} is required`);
      }
    });
    onValidate(errors.length === 0, errors);
  }, [value, onValidate]);

  useEffect(() => {
    if (triggerValidation) {
      validatedRef.current = true;
      runValidation();
    }
  }, [triggerValidation, runValidation]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <CityAutocomplete
            value={value.location}
            onChange={(loc) => onChange({ location: loc })}
            label="Location (City)"
            placeholder="Type a city name..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            value={value.jobTitle}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="summary">Summary *</Label>
        <textarea
          id="summary"
          className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={value.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
        />
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={value.website ?? ''}
            onChange={(e) => onChange({ website: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            value={value.github ?? ''}
            onChange={(e) => onChange({ github: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={value.linkedin ?? ''}
            onChange={(e) => onChange({ linkedin: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profilePicture">Profile Picture</Label>
        <Input
          id="profilePicture"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const preview = URL.createObjectURL(file);
              onChange({
                profilePictureFile: file,
                profilePicturePreview: preview,
              });
            } else {
              onChange({
                profilePictureFile: null,
                profilePicturePreview: null,
              });
            }
          }}
        />
        {value.profilePicturePreview && (
          <Image
            src={value.profilePicturePreview}
            alt="Profile preview"
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 rounded-full object-cover border"
          />
        )}
      </div>
    </div>
  );
}
