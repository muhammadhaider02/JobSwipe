import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';

interface EducationEntry {
  degree: string;
  school: string;
  date: string;
}
interface ExperienceEntry {
  company: string;
  job_title: string;
  date: string;
  descriptions: string[];
}
interface ProjectEntry {
  title: string;
  description: string;
  link: string;
}
interface PersonalInfoParsed {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}
export interface ResumeParsed {
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string[];
  rawText: string;
  personal: PersonalInfoParsed;
}

const SECTION_KEYWORDS = ['EDUCATION', 'EXPERIENCE', 'SKILLS', 'PROJECTS'];
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

@Injectable()
export class ResumeService {
  private cleanLine(s: string) {
    return s
      .replace(/[\u200B\u200E\u200F\u00A0]/g, '') // invisible chars
      .replace(/\s+/g, ' ')
      .trim();
  }

  private splitLines(text: string) {
    return text
      .replace(/\r/g, '')
      .split('\n')
      .map((l) => this.cleanLine(l))
      .filter(Boolean);
  }

  private detectSections(lines: string[]) {
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

  private parseEducation(lines: string[]): EducationEntry[] {
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

  private parseExperience(lines: string[]): ExperienceEntry[] {
    const out: ExperienceEntry[] = [];
    let current: ExperienceEntry = {
      company: '',
      job_title: '',
      date: '',
      descriptions: [],
    };
    const datePattern =
      /(19|20)\d{2}(\s*[–-]\s*(19|20)\d{2}|\s*[–-]\s*Present)?/i;
    for (const raw of lines) {
      const line = raw;
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

  private parseProjects(lines: string[]): ProjectEntry[] {
    const projects: ProjectEntry[] = [];
    let current: ProjectEntry | null = null;
    const urlRegex = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/i;

    const pushCurrent = () => {
      if (!current) return;
      // Require at least a title
      if (current.title.trim()) {
        // Collapse description whitespace
        current.description = current.description.trim().replace(/\s+/g, ' ');
        projects.push(current);
      }
      current = null;
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        // Blank line ends current project
        pushCurrent();
        continue;
      }

      // New project title heuristic:
      //  - Not starting with bullet
      //  - Not all uppercase section header
      //  - Reasonable length
      if (
        !/^[•●-]/.test(line) &&
        !this.isSectionHeader(line) &&
        line.length <= 120 &&
        (!current || // start new
          (/^(?:[A-Z][A-Za-z0-9]+([\s:–-]|$))/.test(line) && // Title pattern
            current &&
            current.description.length > 0)) // previous has description
      ) {
        pushCurrent();
        current = {
          title: line.replace(/\s*[:\-–]\s*$/, ''),
          description: '',
          link: '',
        };
        // Extract inline link from title
        const m = line.match(urlRegex);
        if (m && current) current.link = m[0];
        continue;
      }

      // Bullet or continuation lines become description
      if (!current) {
        // Start a project implicitly if description appears before title
        current = { title: '', description: '', link: '' };
      }

      // Capture link if present
      if (!current.link) {
        const m = line.match(urlRegex);
        if (m) current.link = m[0];
      }

      // Strip bullet markers
      const cleaned = line.replace(/^[•●-\s]+/, '');
      current.description += (current.description ? ' ' : '') + cleaned;
    }

    pushCurrent();
    return projects;
  }

  private parseSkills(lines: string[]): string[] {
    if (!lines.length) return [];
    // Join lines first (handles wrapped skill lines)
    const joined = lines
      .map((l) => l.replace(/[|]/g, '|'))
      .join(' ')
      .replace(/\s*\|\s*/g, '|')
      .replace(/\s*,\s*/g, ',');
    const rawTokens = joined
      .split(/[|,]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of rawTokens) {
      const k = t.toLowerCase();
      if (!seen.has(k) && k.length <= 60) {
        seen.add(k);
        out.push(t);
      }
    }
    return out;
  }

  private isSectionHeader(line: string): boolean {
    const upper = line.toUpperCase().trim();
    return /^(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS?|CERTIFICATES?)$/.test(
      upper,
    );
  }

  private normalize(line: string): string {
    return (
      line
        // Replace control chars using Unicode property escape instead of explicit \x00-\x1F\x7F (fixes no-control-regex)
        .replace(/\p{Cc}/gu, '')
        // Remove unwanted symbols; hyphen no longer escaped (fixes no-useless-escape)
        .replace(/[^\w\s,@.+#&:/()'’\-|]/g, (ch) => {
          return /[|,.-]/.test(ch) ? ch : ' ';
        })
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  private looksLikeName(line: string): boolean {
    if (!line) return false;
    if (line.length > 60) return false;
    if (/@|\d/.test(line)) return false;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 6) return false;
    let capitalized = 0;
    for (const w of words) {
      if (/^[A-Z][a-z'’.-]*$/.test(w)) capitalized++;
    }
    return capitalized >= Math.min(2, words.length);
  }

  private extractPersonal(lines: string[]): PersonalInfoParsed {
    // Pre-normalize first N lines to reduce artifacts
    const firstLines = lines.slice(0, 40).map((l) => this.normalize(l));
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRegex = /(\+?\d[\d\s().-]{7,}\d)/;
    let email = '';
    let phone = '';
    let location = '';
    let fullName = '';
    let summary = '';

    // Find name: first line that looks like a name
    for (const l of firstLines.slice(0, 8)) {
      if (this.looksLikeName(l)) {
        fullName = l;
        break;
      }
    }

    // Contact lines: scan first 10
    for (const l of firstLines.slice(0, 10)) {
      if (!email && emailRegex.test(l)) {
        email = (l.match(emailRegex) || [''])[0];
      }
      if (!phone && phoneRegex.test(l)) {
        const m = l.match(phoneRegex);
        if (m && m[0].replace(/\D/g, '').length >= 8) phone = m[0].trim();
      }
    }

    // Location
    const locPattern =
      /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*),\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)$/;
    for (const l of firstLines.slice(0, 15)) {
      if (/@/.test(l)) continue;
      if (locPattern.test(l)) {
        location = l;
        break;
      }
      if (
        !location &&
        /,/.test(l) &&
        /Pakistan|USA|UK|Canada|India|Germany|France|Arabia|Emirates|Kingdom/i.test(
          l,
        )
      ) {
        location = l;
        break;
      }
    }

    // Summary extraction
    let summaryStart = -1;
    for (let i = 0; i < firstLines.length; i++) {
      const u = firstLines[i].toUpperCase();
      if (u === 'OBJECTIVE' || u === 'SUMMARY') {
        summaryStart = i + 1;
        break;
      }
    }
    if (summaryStart !== -1) {
      const collected: string[] = [];
      for (let i = summaryStart; i < firstLines.length; i++) {
        const l = firstLines[i];
        if (!l) break;
        if (this.isSectionHeader(l)) break;
        if (emailRegex.test(l) || phoneRegex.test(l)) continue;
        collected.push(l);
        if (collected.join(' ').length > 600) break;
      }
      summary = collected.join(' ');
    } else {
      let start = 0;
      if (fullName) {
        start = firstLines.findIndex((l) => l === fullName);
        if (start === -1) start = 0;
        start += 1;
      }
      const collected: string[] = [];
      for (let i = start; i < firstLines.length; i++) {
        const l = firstLines[i];
        if (!l) break;
        if (this.isSectionHeader(l)) break;
        if (emailRegex.test(l) || phoneRegex.test(l)) continue;
        if (/LinkedIn|GitHub|Portfolio/i.test(l)) continue;
        collected.push(l);
        if (collected.join(' ').length > 400) break;
      }
      summary = collected.join(' ');
    }

    return { fullName, email, phone, location, summary };
  }

  async parse(buffer: Buffer): Promise<ResumeParsed> {
    const data = await pdfParse(buffer);
    const lines = this.splitLines(data.text);
    const sections = this.detectSections(lines);
    const personal = this.extractPersonal(lines);

    return {
      education: this.parseEducation(sections['EDUCATION'] || []),
      experience: this.parseExperience(sections['EXPERIENCE'] || []),
      projects: this.parseProjects(sections['PROJECTS'] || []),
      skills: this.parseSkills(sections['SKILLS'] || []),
      rawText: data.text,
      personal,
    };
  }
}
