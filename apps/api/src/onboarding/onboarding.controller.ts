import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OnboardingService } from './onboarding.service';
import { plainToInstance, Type } from 'class-transformer';
import {
  validate,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpsertResumeDto } from './dto/resume.dto';
import { memoryStorage } from 'multer';
import type { Request } from 'express';

// DTOs
class CertificateItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

class CertificatesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateItemDto)
  certificates!: CertificateItemDto[];
}

// Extend request to include user set by SupabaseAuthGuard
interface ResumeRequest extends Request {
  user: { id: string };
}

@Controller('onboarding')
@UseGuards(SupabaseAuthGuard)
export class OnboardingController {
  constructor(private service: OnboardingService) {}

  @Get()
  async getMine(@Req() req: ResumeRequest) {
    return this.service.get(req.user.id);
  }

  @Post()
  create(@Req() req: ResumeRequest, @Body() body: UpsertResumeDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing user id');
    }
    return this.service.create(body, userId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(), // keep in memory before uploading to Supabase storage
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file && !file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upsert(
    @Req() req: ResumeRequest,
    @Body() body: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Accept raw JSON or multipart with "payload"
    let raw: unknown = body;

    if (
      raw &&
      typeof raw === 'object' &&
      'payload' in (raw as Record<string, unknown>)
    ) {
      const payloadString = (raw as Record<string, unknown>).payload;
      if (typeof payloadString !== 'string') {
        throw new BadRequestException('payload must be a JSON string');
      }
      try {
        raw = JSON.parse(payloadString);
      } catch {
        throw new BadRequestException('Invalid JSON in payload');
      }
    }

    const dto = plainToInstance(UpsertResumeDto, raw);
    const errors = await validate(dto, {
      whitelist: true,
      forbidUnknownValues: true,
    });
    if (errors.length) {
      const message = errors
        .map((e) => Object.values(e.constraints ?? {}))
        .flat()
        .join('; ');
      throw new BadRequestException(message || 'Validation failed');
    }

    return this.service.upsert(req.user.id, dto, file);
  }

  @Post('certificates')
  async addCertificates(
    @Req() req: ResumeRequest,
    @Body() body: CertificatesDto,
  ): Promise<{ success: true }> {
    await this.service.saveCertificates(req.user.id, body.certificates);
    return { success: true };
  }
}
