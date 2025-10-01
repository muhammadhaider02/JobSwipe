import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayNotEmpty,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PersonalInfoDto {
  @IsString() @MaxLength(120) fullName!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
  @IsOptional() @IsString() summary?: string;
  @IsString() jobTitle!: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() github?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() profileImageUrl?: string;
}

export class ExperienceItemDto {
  @IsString() company!: string;
  @IsString() role!: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() description?: string;
}

export class EducationItemDto {
  @IsString() institution!: string;
  @IsString() degree!: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}

export class ProjectItemDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() link?: string;
}

export class SkillItemDto {
  @IsString() skillName!: string;
  @IsOptional() @IsString() proficiency?: string;
}

export class CertificateItemDto {
  @IsString() title!: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsDateString() issueDate?: string;
}

export class UpsertResumeDto {
  @ValidateNested() @Type(() => PersonalInfoDto) personalInfo!: PersonalInfoDto;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experiences!: ExperienceItemDto[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EducationItemDto)
  education!: EducationItemDto[];

  @ValidateNested({ each: true })
  @Type(() => ProjectItemDto)
  projects!: ProjectItemDto[];
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills!: SkillItemDto[];
  @ValidateNested({ each: true })
  @Type(() => CertificateItemDto)
  certificates!: CertificateItemDto[];
}

export class ResumeDto {
  @ValidateNested() @Type(() => PersonalInfoDto) personalInfo!: PersonalInfoDto;
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experiences!: ExperienceItemDto[];
  // ...other arrays...
  @IsOptional() @IsString() user_id?: string; // optional (ignored)
}

// Row response interfaces (adjust if you generate types elsewhere)
export interface ResumeInfoRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  summary: string | null;
  job_title: string | null;
  profile_image_url: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  created_at: string;
}

export interface ResumeExperienceRow {
  id: string;
  user_id: string;
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface ResumeEducationRow {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ResumeProjectRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  link: string | null;
}

export interface ResumeSkillRow {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency: string | null;
}

export interface ResumeCertificateRow {
  id: string;
  user_id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
}

export interface ResumeResponse {
  personalInfo: ResumeInfoRow;
  experiences: ResumeExperienceRow[];
  education: ResumeEducationRow[];
  projects: ResumeProjectRow[];
  skills: ResumeSkillRow[];
  certificates: ResumeCertificateRow[];
}
