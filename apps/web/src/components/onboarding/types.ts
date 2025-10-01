export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  jobTitle: string;
  website?: string;
  github?: string;
  linkedin?: string;
  profilePictureFile?: File | null;
  profilePicturePreview?: string | null;
};

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  link?: string;
};

export type SkillItem = {
  id: string;
  name: string;
  proficiency: string;
};

export type CertificateItem = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
};

export type ResumeOnboardingData = {
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certificates: CertificateItem[];
};
