export interface SubmitResumePayload {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    jobTitle: string;
    website: string;
    github: string;
    linkedin: string;
    profileImageUrl?: string;
  };
  experiences: {
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  education: {
    institution: string;
    degree: string;
    startDate?: string;
    endDate?: string;
  }[];
  projects: {
    title: string;
    description?: string;
    link?: string;
  }[];
  skills: {
    skillName: string;
    proficiency?: string;
  }[];
  certificates: {
    title: string;
    issuer?: string;
    issueDate?: string;
  }[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3002';

console.log('[onboarding] API_BASE =', API_BASE);

function isJsonObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export async function submitResume<
  TResp extends Record<string, unknown> = Record<string, unknown>,
>(token: string, payload: SubmitResumePayload): Promise<TResp> {
  if (!token) throw new Error('Missing auth token (not logged in)');

  const res = await fetch(`${API_BASE}/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errBody: unknown = await res.json();
      if (isJsonObject(errBody)) {
        if (typeof errBody.message === 'string') detail = errBody.message;
        else if (typeof errBody.error === 'string') detail = errBody.error;
        else detail = JSON.stringify(errBody);
      } else {
        detail = JSON.stringify(errBody);
      }
    } catch {
      try {
        detail = await res.text();
      } catch {
        detail = 'Unknown error';
      }
    }
    throw new Error(`Onboarding failed (${res.status}): ${detail}`);
  }

  const successBody: unknown = await res.json().catch(() => ({}));
  if (isJsonObject(successBody)) {
    return successBody as TResp;
  }
  return {} as TResp;
}
