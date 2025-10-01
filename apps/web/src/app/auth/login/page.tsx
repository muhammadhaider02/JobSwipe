import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // MUST await per Next.js message
  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === 'string' && params.redirect.length > 0
      ? params.redirect
      : '/protected/onboarding';

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}

// 'use client';

// import { useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { createBrowserClient } from '@/lib/supabase/browser';
// import { LoginForm } from '@/components/auth/login-form';

// export default function LoginPage() {
//   const sp = useSearchParams();
//   const redirectParam = sp.get('redirect');
//   const redirectTo =
//     redirectParam && redirectParam.length > 0
//       ? redirectParam
//       : '/protected/onboarding';

//   // Step 1: log existing session token snippet (debug)
//   useEffect(() => {
//     (async () => {
//       const supabase = createBrowserClient();
//       const { data, error } = await supabase.auth.getSession();

//       if (error) {
//         console.error('[login][step1] error getting session:', error);
//         return;
//       }

//       const token = data.session?.access_token;
//       console.log('[login][step1] access token:', token);
//     })();
//   }, []);

//   return (
//     <div className="mx-auto max-w-md py-10">
//       <h1 className="text-xl font-semibold mb-4">Login</h1>
//       <LoginForm redirectTo={redirectTo} />
//     </div>
//   );
// }
