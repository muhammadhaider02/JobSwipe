import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, SupabaseAuthGuard],
})
export class OnboardingModule {}
