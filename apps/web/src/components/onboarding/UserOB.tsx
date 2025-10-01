'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  type ResumeOnboardingData,
  type ExperienceItem,
  type EducationItem,
  type ProjectItem,
  type SkillItem,
  type CertificateItem,
} from './types';
import { PersonalInfoStep } from './steps/personalinfo';
import { ExperienceStep } from './steps/experience';
import { EducationStep } from './steps/education';
import { ProjectsStep } from './steps/projects';
import { SkillsStep } from './steps/skills';
import { CertificatesStep } from './steps/certifcates';
import { submitResume } from '@/lib/api/onboarding';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { SubmitResumePayload } from '@/lib/api/onboarding';

const TOTAL_STEPS = 6;

const initialData: ResumeOnboardingData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    jobTitle: '',
    website: '',
    github: '',
    linkedin: '',
    profilePictureFile: null,
    profilePicturePreview: null,
  },
  experience: [
    {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      link: '',
    },
  ],
  skills: [{ id: crypto.randomUUID(), name: '', proficiency: '' }],
  certificates: [
    { id: crypto.randomUUID(), title: '', issuer: '', issueDate: '' },
  ],
};

function splitDateRange(dateStr: string | undefined): {
  startDate: string;
  endDate: string;
} {
  if (!dateStr) return { startDate: '', endDate: '' };
  const cleaned = dateStr.replace(/–/g, '-').trim();
  const parts = cleaned.split('-').map((p) => p.trim());
  if (parts.length === 2) return { startDate: parts[0], endDate: parts[1] };
  return { startDate: cleaned, endDate: '' };
}

export interface ResumeOnboardingWizardProps {
  prefill?: {
    education: { degree: string; school: string; date: string }[];
    experience: {
      company: string;
      job_title: string;
      date: string;
      descriptions: string[];
    }[];
    skills: string[];
    rawText: string;
    personal?: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
    };
  } | null;
}

export function ResumeOnboardingWizard({
  prefill,
}: ResumeOnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ResumeOnboardingData>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [validateTrigger, setValidateTrigger] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastValidationOk, setLastValidationOk] = useState(true);
  const prefillAppliedRef = useRef(false);

  useEffect(() => {
    if (!prefill || prefillAppliedRef.current) return;
    setData((prev) => {
      const next = { ...prev };

      if (prefill.experience?.length) {
        next.experience = prefill.experience.map((e) => {
          const { startDate, endDate } = splitDateRange(e.date);
          return {
            id: crypto.randomUUID(),
            company: e.company || '',
            role: e.job_title || '',
            startDate,
            endDate,
            description: (e.descriptions || []).join('\n'),
          };
        });
      }

      if (prefill.education?.length) {
        next.education = prefill.education.map((ed) => {
          const { startDate, endDate } = splitDateRange(ed.date);
          return {
            id: crypto.randomUUID(),
            institution: ed.school || '',
            degree: ed.degree || '',
            startDate,
            endDate,
          };
        });
      }

      if (prefill.skills?.length) {
        next.skills = prefill.skills.map((s) => ({
          id: crypto.randomUUID(),
          name: s,
          proficiency: '',
        }));
      }

      if (prefill.personal) {
        const p = prefill.personal;
        const pi = { ...next.personalInfo };
        if (!pi.fullName && p.fullName) pi.fullName = p.fullName;
        if (!pi.email && p.email) pi.email = p.email;
        if (!pi.phone && p.phone) pi.phone = p.phone;
        if (!pi.summary && p.summary) pi.summary = p.summary;
        if (!pi.jobTitle && prefill.experience?.[0]?.job_title) {
          pi.jobTitle = prefill.experience[0].job_title;
        }
        next.personalInfo = pi;
      }

      return next;
    });
    prefillAppliedRef.current = true;
  }, [prefill]);

  const stepLabels = [
    'Personal Info',
    'Experience',
    'Education',
    'Projects',
    'Skills',
    'Certificates',
  ];

  const onStepValidate = (ok: boolean, errs: string[]) => {
    setErrors(errs);
    setLastValidationOk(ok);
  };

  const goNext = () => {
    setValidateTrigger(true);
    setTimeout(() => {
      if (lastValidationOk) {
        setErrors([]);
        setValidateTrigger(false);
        setStep((s) => Math.min(TOTAL_STEPS, s + 1));
      } else {
        setValidateTrigger(false);
      }
    }, 0);
  };

  const goBack = () => {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1));
  };

  function validateAll(d: ResumeOnboardingData): string[] {
    const errs: string[] = [];
    const nonEmptyExp = d.experience.filter(
      (e) => e.company?.trim() || e.role?.trim(),
    );
    const nonEmptyEdu = d.education.filter(
      (e) => e.institution?.trim() || e.degree?.trim(),
    );
    const nonEmptySkills = d.skills.filter((s) => s.name.trim());

    if (!d.personalInfo.fullName.trim()) errs.push('Full name is required');
    if (!d.personalInfo.email.trim()) errs.push('Email is required');
    if (nonEmptyExp.length === 0)
      errs.push('Add at least one experience entry');
    if (nonEmptyEdu.length === 0) errs.push('Add at least one education entry');
    if (nonEmptySkills.length === 0) errs.push('Add at least one skill');

    return errs;
  }

  function buildApiPayload(d: ResumeOnboardingData): SubmitResumePayload {
    const isoDate = (raw?: string) => {
      const v = raw?.trim();
      if (!v) return undefined;
      // Accept YYYY-MM-DD only; otherwise drop (to satisfy @IsDateString)
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
    };

    const experiences = d.experience
      .filter((e) => e.company?.trim() || e.role?.trim())
      .map((e) => ({
        company: e.company.trim(),
        role: e.role.trim(), // was job_title
        startDate: isoDate(e.startDate),
        endDate: isoDate(e.endDate),
        description: e.description?.trim() || undefined, // collapse array if you had one
      }))
      .filter((e) => e.company || e.role);

    const education = d.education
      .filter((e) => e.institution?.trim() || e.degree?.trim())
      .map((e) => ({
        institution: e.institution.trim(),
        degree: e.degree.trim(),
        startDate: isoDate(e.startDate),
        endDate: isoDate(e.endDate),
      }));

    const projects = d.projects
      .filter((p) => p.title?.trim() || p.description?.trim() || p.link?.trim())
      .map((p) => ({
        title: p.title?.trim() ?? '',
        description: p.description?.trim() || undefined,
        link: p.link?.trim() || undefined,
      }));

    const skills = d.skills
      .filter((s) => s.name?.trim())
      .map((s) => ({ skillName: s.name.trim() })); // DTO wants skillName

    const certificates = d.certificates
      .filter((c) => c.title?.trim() || c.issuer?.trim())
      .map((c) => ({
        title: c.title?.trim() ?? '',
        issuer: c.issuer?.trim() || undefined,
        issueDate: isoDate(c.issueDate),
      }));

    return {
      personalInfo: {
        fullName: d.personalInfo.fullName.trim(),
        email: d.personalInfo.email.trim(),
        phone: d.personalInfo.phone.trim(),
        location: d.personalInfo.location.trim(),
        summary: d.personalInfo.summary.trim(),
        jobTitle: d.personalInfo.jobTitle.trim(),
        website: d.personalInfo.website?.trim() ?? '',
        github: d.personalInfo.github?.trim() ?? '',
        linkedin: d.personalInfo.linkedin?.trim() ?? '',
      },
      experiences,
      education,
      projects,
      skills,
      certificates,
    };
  }

  const handleSubmit = async () => {
    const finalErrors = validateAll(data);
    if (finalErrors.length) {
      setErrors(finalErrors);
      setLastValidationOk(false);
      return;
    }
    setErrors([]);
    setLastValidationOk(true);

    try {
      setSubmitting(true);
      const supabase = createBrowserClient();
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const payload = buildApiPayload(data);
      console.log(
        '[submit] API payload experiences:',
        payload.experiences.length,
      );
      console.log('[submit] token snippet:', token?.slice(0, 12));
      await submitResume(token, payload);
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrors([msg]);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle>Onboarding Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your onboarding data has been submitted.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setData(initialData);
            }}
          >
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          {stepLabels.map((label, idx) => {
            const index = idx + 1;
            const active = index === step;
            const completed = index < step;
            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : completed
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index}
                </div>
                <span
                  className={`mt-1 text-[10px] uppercase tracking-wide ${
                    active
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 w-full rounded bg-muted overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>
            {step}. {stepLabels[step - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.length > 0 && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700 space-y-1">
              {errors.map((e) => (
                <div key={e}>• {e}</div>
              ))}
            </div>
          )}

          {step === 1 && (
            <PersonalInfoStep
              value={data.personalInfo}
              onChange={(v) =>
                setData((d) => ({
                  ...d,
                  personalInfo: { ...d.personalInfo, ...v },
                }))
              }
              onValidate={onStepValidate}
              triggerValidation={validateTrigger}
            />
          )}
          {step === 2 && (
            <ExperienceStep
              items={data.experience}
              onChange={(items: ExperienceItem[]) =>
                setData((d) => ({ ...d, experience: items }))
              }
              onValidate={onStepValidate}
              triggerValidation={validateTrigger}
            />
          )}
          {step === 3 && (
            <EducationStep
              items={data.education}
              onChange={(items: EducationItem[]) =>
                setData((d) => ({ ...d, education: items }))
              }
              onValidate={onStepValidate}
              triggerValidation={validateTrigger}
            />
          )}
          {step === 4 && (
            <ProjectsStep
              items={data.projects}
              onChange={(items: ProjectItem[]) =>
                setData((d) => ({ ...d, projects: items }))
              }
              onValidate={onStepValidate}
              triggerValidation={validateTrigger}
            />
          )}
          {step === 5 && (
            <SkillsStep
              items={data.skills}
              onChange={(items: SkillItem[]) =>
                setData((d) => ({ ...d, skills: items }))
              }
              onValidate={onStepValidate}
              triggerValidation={validateTrigger}
            />
          )}
          {step === 6 && (
            <CertificatesStep
              items={data.certificates}
              onChange={(items: CertificateItem[]) =>
                setData((d) => ({ ...d, certificates: items }))
              }
              onValidate={onStepValidate}
              triggerValidation={validateTrigger}
            />
          )}

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < TOTAL_STEPS && (
              <Button type="button" onClick={goNext}>
                Next
              </Button>
            )}
            {step === TOTAL_STEPS && (
              <Button
                type="button"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Submit'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
