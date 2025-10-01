import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-2xl mb-2">Next Steps</h2>
        <p className="text-sm text-muted-foreground">
          Complete your resume onboarding to unlock personalized features.
        </p>
        <Link
          href="/protected/onboarding"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-fit"
        >
          Start Resume Onboarding
        </Link>
      </div>
    </div>
  );
}
