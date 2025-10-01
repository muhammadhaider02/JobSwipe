// apps/web/src/lib/resume/parse.ts

// ---- Interfaces ----
export interface EducationEntry {
  degree: string;
  school: string;
  date: string;
}

export interface ExperienceEntry {
  company: string;
  job_title: string;
  date: string;
  descriptions: string[];
}

export interface ResumeParsed {
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  rawText: string;
}

// ---- Constants ----
const SECTION_KEYWORDS = ['EDUCATION', 'EXPERIENCE', 'SKILLS'];
const DEGREE_KEYWORDS = [
  'BS',
  'BSC',
  'BACHELOR',
  'MS',
  'MSC',
  'MASTER',
  'PHD',
  'ASSOCIATE',
  'DIPLOMA',
];

// ---- Helpers ----
function cleanLine(s: string): string {
  return s
    .replace(/[\u200b\u200e\u200f\xa0]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitLines(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map(cleanLine)
    .filter((l) => l.length > 0);
}

function detectSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let current: string | null = null;

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (
      SECTION_KEYWORDS.includes(upper) ||
      (/^[A-Z\s]+$/.test(upper) &&
        upper.length < 45 &&
        SECTION_KEYWORDS.some((k) => upper.includes(k)))
    ) {
      const key = SECTION_KEYWORDS.find((k) => upper.includes(k)) || upper;
      current = key;
      if (!sections[current]) sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }

  return sections;
}

// ---- Parsing ----
function parseEducation(lines: string[]): EducationEntry[] {
  const out: EducationEntry[] = [];
  let current: EducationEntry = { degree: '', school: '', date: '' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hasDegree = DEGREE_KEYWORDS.some((d) =>
      line.toUpperCase().includes(d),
    );

    if (hasDegree) {
      current.degree = current.degree || line;
      const next = lines[i + 1] || '';
      const dateMatch = next.match(
        /(19|20)\d{2}(\s*[–-]\s*(19|20)\d{2}|\s*[–-]\s*Present)?/i,
      );
      if (dateMatch) {
        current.date = dateMatch[0];
        current.school = next.replace(dateMatch[0], '').trim();
      } else if (/university|college|school/i.test(next)) {
        current.school = next;
      }
    } else if (/university|college|school/i.test(line) && !current.school) {
      const dateMatch = line.match(
        /(19|20)\d{2}(\s*[–-]\s*(19|20)\d{2}|\s*[–-]\s*Present)?/i,
      );
      if (dateMatch) current.date = dateMatch[0];
      current.school = line;
    }

    if (current.degree && current.school) {
      out.push({ ...current });
      current = { degree: '', school: '', date: '' };
    }
  }

  if (current.degree && current.school) out.push(current);
  return out;
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  const out: ExperienceEntry[] = [];
  let current: ExperienceEntry = {
    company: '',
    job_title: '',
    date: '',
    descriptions: [],
  };
  const datePattern =
    /(19|20)\d{2}.*?(19|20)\d{2}|(19|20)\d{2}.*?Present|Present/i;

  for (const line of lines) {
    if (datePattern.test(line) && /[-–]|Present/i.test(line)) {
      if (current.company) {
        out.push({ ...current });
        current = { company: '', job_title: '', date: '', descriptions: [] };
      }
      current.date = line;
      continue;
    }

    if (
      /engineer|developer|intern|manager|scientist|designer|analyst/i.test(
        line,
      ) &&
      !current.job_title
    ) {
      current.job_title = line;
      continue;
    }

    if (/^[•●-]/.test(line)) {
      current.descriptions.push(line.replace(/^[•●-]\s?/, '').trim());
      continue;
    }

    if (!current.company && line.length < 80) {
      current.company = line;
    } else if (!current.job_title && line.length < 80) {
      current.job_title = line;
    }
  }

  if (current.company) out.push({ ...current });
  return out;
}

function parseSkills(lines: string[]): string[] {
  const all: string[] = [];

  for (const line of lines) {
    const cleaned = line.replace(
      /^(Programming & Tools:|Domains:|Certifications:)\s*/i,
      '',
    );
    const parts = cleaned
      .split(/,|\s{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    all.push(...parts);
  }

  const seen = new Set<string>();
  return all.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---- Public API ----
export {
  cleanLine,
  splitLines,
  detectSections,
  parseEducation,
  parseExperience,
  parseSkills,
};
