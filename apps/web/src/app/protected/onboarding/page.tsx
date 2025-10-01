'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ResumeOnboardingWizard } from '@/components/onboarding/UserOB';

interface ResumeParsed {
  education: { degree: string; school: string; date: string }[];
  experience: {
    company: string;
    job_title: string;
    date: string;
    descriptions: string[];
  }[];
  skills: string[];
  rawText: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
}

function isResumeParsedResponse(v: unknown): v is { parsed: ResumeParsed } {
  if (typeof v !== 'object' || v === null) return false;
  if (!('parsed' in v)) return false;
  const root = v as Record<string, unknown>;
  const parsed = root.parsed;
  if (typeof parsed !== 'object' || parsed === null) return false;
  const p = parsed as Record<string, unknown>;
  return (
    typeof p.rawText === 'string' &&
    Array.isArray(p.skills) &&
    Array.isArray(p.education) &&
    Array.isArray(p.experience) &&
    typeof p.personal === 'object' &&
    p.personal !== null
  );
}

interface ErrorResponseShape {
  error: string;
  [k: string]: unknown;
}
function isErrorResponse(v: unknown): v is ErrorResponseShape {
  return (
    typeof v === 'object' &&
    v !== null &&
    'error' in v &&
    typeof (v as Record<string, unknown>).error === 'string'
  );
}

export default function ResumeOnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ResumeParsed | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data.user) {
          router.replace('/auth/login?redirect=/protected/onboarding');
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        router.replace('/auth/login?redirect=/protected/onboarding');
      });
  }, [supabase, router]);

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setResumeFile(f);
      void parseAndPrefill(f);
    }
  };

  async function parseAndPrefill(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const rawErr: unknown = await res.json().catch(() => null);
        let message = 'Upload failed';
        if (isErrorResponse(rawErr)) {
          message = rawErr.error;
        }
        throw new Error(message);
      }

      const bodyUnknown: unknown = await res.json();
      if (!isResumeParsedResponse(bodyUnknown)) {
        throw new Error('Malformed response from parser');
      }
      setParsed(bodyUnknown.parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="p-6">Checking session...</p>;

  return (
    <div className="flex flex-col items-center w-full gap-8 py-10 px-4">
      <h1 className="text-2xl font-bold tracking-tight">Resume Onboarding</h1>
      <p className="text-sm text-muted-foreground max-w-xl text-center">
        Upload a resume to prefill your details. Review and complete any missing
        fields.
      </p>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleResumeSelect}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => resumeInputRef.current?.click()}
          className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-md shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium disabled:opacity-60"
        >
          {uploading
            ? 'Parsing...'
            : resumeFile
              ? 'Re-upload Resume'
              : 'Upload Resume'}
        </button>
        {resumeFile && !uploading && (
          <span className="text-xs text-muted-foreground">
            {parsed ? 'Parsed successfully' : 'Selected: ' + resumeFile.name}
          </span>
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <ResumeOnboardingWizard
        key={parsed ? parsed.rawText.length : 0}
        prefill={parsed}
      />
    </div>
  );
}
