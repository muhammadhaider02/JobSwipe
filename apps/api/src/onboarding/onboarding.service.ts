import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UpsertResumeDto,
  ResumeResponse,
  ResumeInfoRow,
  ResumeExperienceRow,
  ResumeEducationRow,
  ResumeProjectRow,
  ResumeSkillRow,
  ResumeCertificateRow,
} from './dto/resume.dto';

@Injectable()
export class OnboardingService {
  private supabase: SupabaseClient;
  private bucket = 'resume-profile-images';

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'Missing Supabase env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // service role for full access
      { auth: { persistSession: false } },
    );
  }

  private assertUUID(v: string) {
    if (typeof v !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(v)) {
      throw new BadRequestException('Invalid userId: ' + v);
    }
  }

  async ensureBucket() {}

  async get(userId: string): Promise<ResumeResponse> {
    const info = await this.supabase
      .from('resume_info')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle<ResumeInfoRow>();
    if (info.error) throw new BadRequestException(info.error.message);
    if (!info.data) throw new NotFoundException('No resume data found');

    const exp = await this.supabase
      .from('resume_experiences')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .returns<ResumeExperienceRow[]>();
    if (exp.error) throw new BadRequestException(exp.error.message);

    const edu = await this.supabase
      .from('resume_education')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .returns<ResumeEducationRow[]>();
    if (edu.error) throw new BadRequestException(edu.error.message);

    const proj = await this.supabase
      .from('resume_projects')
      .select('*')
      .eq('user_id', userId)
      .returns<ResumeProjectRow[]>();
    if (proj.error) throw new BadRequestException(proj.error.message);

    const skills = await this.supabase
      .from('resume_skills')
      .select('*')
      .eq('user_id', userId)
      .returns<ResumeSkillRow[]>();
    if (skills.error) throw new BadRequestException(skills.error.message);

    const certs = await this.supabase
      .from('resume_certificates')
      .select('*')
      .eq('user_id', userId)
      .returns<ResumeCertificateRow[]>();
    if (certs.error) throw new BadRequestException(certs.error.message);

    return {
      personalInfo: info.data,
      experiences: exp.data ?? [],
      education: edu.data ?? [],
      projects: proj.data ?? [],
      skills: skills.data ?? [],
      certificates: certs.data ?? [],
    };
  }

  async upsert(
    userId: string,
    dto: UpsertResumeDto,
    profileFile?: Express.Multer.File,
  ): Promise<ResumeResponse> {
    // Required checks
    if (
      !dto.personalInfo.fullName ||
      !dto.personalInfo.email ||
      !dto.personalInfo.jobTitle
    ) {
      throw new BadRequestException(
        'fullName, email, and jobTitle are required',
      );
    }

    let profileImageUrl = dto.personalInfo.profileImageUrl ?? null;

    if (profileFile) {
      const ext = profileFile.originalname.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const upload = await this.supabase.storage
        .from(this.bucket)
        .upload(path, profileFile.buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: profileFile.mimetype,
        });
      if (upload.error) {
        throw new BadRequestException(
          `Profile image upload failed: ${upload.error.message}`,
        );
      }
      const pub = this.supabase.storage.from(this.bucket).getPublicUrl(path);
      profileImageUrl = pub.data.publicUrl;
    }

    // Upsert resume_info
    const infoPayload = {
      user_id: userId,
      full_name: dto.personalInfo.fullName,
      email: dto.personalInfo.email,
      phone: dto.personalInfo.phone ?? null,
      location: dto.personalInfo.location ?? null,
      summary: dto.personalInfo.summary ?? null,
      job_title: dto.personalInfo.jobTitle,
      profile_image_url: profileImageUrl,
      website: dto.personalInfo.website ?? null,
      github: dto.personalInfo.github ?? null,
      linkedin: dto.personalInfo.linkedin ?? null,
    };

    const infoRes = await this.supabase
      .from('resume_info')
      .upsert(infoPayload, { onConflict: 'user_id' })
      .select()
      .single<ResumeInfoRow>();
    if (infoRes.error) {
      throw new BadRequestException(infoRes.error.message);
    }

    // Clear existing related rows (simple replace strategy)
    const tables = [
      'resume_experiences',
      'resume_education',
      'resume_projects',
      'resume_skills',
      'resume_certificates',
    ];
    for (const t of tables) {
      const del = await this.supabase.from(t).delete().eq('user_id', userId);
      if (del.error) throw new BadRequestException(del.error.message);
    }

    // Insert new sets (conditionally)
    if (dto.experiences.length) {
      const ins = await this.supabase.from('resume_experiences').insert(
        dto.experiences.map((e) => ({
          user_id: userId,
          company: e.company,
          role: e.role,
          start_date: e.startDate ?? null,
          end_date: e.endDate ?? null,
          description: e.description ?? null,
        })),
      );
      if (ins.error) throw new BadRequestException(ins.error.message);
    }

    if (dto.education.length) {
      const ins = await this.supabase.from('resume_education').insert(
        dto.education.map((e) => ({
          user_id: userId,
          institution: e.institution,
          degree: e.degree,
          start_date: e.startDate ?? null,
          end_date: e.endDate ?? null,
        })),
      );
      if (ins.error) throw new BadRequestException(ins.error.message);
    }

    if (dto.projects.length) {
      const ins = await this.supabase.from('resume_projects').insert(
        dto.projects.map((p) => ({
          user_id: userId,
          title: p.title,
          description: p.description ?? null,
          link: p.link ?? null,
        })),
      );
      if (ins.error) throw new BadRequestException(ins.error.message);
    }

    if (dto.skills.length) {
      const ins = await this.supabase.from('resume_skills').insert(
        dto.skills.map((s) => ({
          user_id: userId,
          skill_name: s.skillName,
          proficiency: s.proficiency ?? null,
        })),
      );
      if (ins.error) throw new BadRequestException(ins.error.message);
    }

    if (dto.certificates.length) {
      const ins = await this.supabase.from('resume_certificates').insert(
        dto.certificates.map((c) => ({
          user_id: userId,
          title: c.title,
          issuer: c.issuer ?? null,
          issue_date: c.issueDate ?? null,
        })),
      );
      if (ins.error) throw new BadRequestException(ins.error.message);
    }

    return this.get(userId);
  }

  async saveCertificates(
    userId: string,
    certs: { name: string; issuer?: string; date?: string }[],
  ): Promise<void> {
    if (!Array.isArray(certs)) {
      throw new Error('certificates must be an array');
    }
    const rows = certs.map((c) => ({
      user_id: userId,
      name: c.name,
      issuer: c.issuer ?? null,
      date: c.date ?? null,
    }));
    const { error } = await this.supabase.from('certificates').insert(rows);
    if (error) {
      throw new Error(`Insert certificates failed: ${error.message}`);
    }
  }

  async create(dto: UpsertResumeDto, userId: string) {
    this.assertUUID(userId);
    return this.upsert(userId, dto);
  }
}
