// 'use client';
// import { useState } from 'react';
// import { createClient } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';

// interface LoginFormProps {
//   redirectTo: string;
// }

// export function LoginForm({ redirectTo }: LoginFormProps) {
//   const supabase = createClient();
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [pw, setPw] = useState('');
//   const [err, setErr] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr(null);
//     setLoading(true);
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
//     setLoading(false);
//     if (error) { setErr(error.message); return; }
//     if (data.session) router.replace(redirectTo);
//   }

//   return (
//     <form onSubmit={onSubmit} className="space-y-4 max-w-sm">
//       <input type="email" required className="border p-2 w-full"
//              value={email} onChange={e=>setEmail(e.target.value)} />
//       <input type="password" required className="border p-2 w-full"
//              value={pw} onChange={e=>setPw(e.target.value)} />
//       {err && <p className="text-sm text-red-500">{err}</p>}
//       <button type="submit" disabled={loading}
//               className="bg-blue-600 text-white w-full py-2 rounded">
//         {loading ? 'Logging in...' : 'Login'}
//       </button>
//     </form>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {
  redirectTo?: string;
}

export function LoginForm({
  redirectTo = '/protected/onboarding',
  className,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsPasswordLoading(false);
    }
  }

  async function handleMagicLink() {
    setError(null);
    setIsMagicLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(
            redirectTo,
          )}`,
        },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Magic link failed');
    } finally {
      setIsMagicLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(
            redirectTo,
          )}`,
          skipBrowserRedirect: true, // manual control
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error('No redirect URL returned from OAuth');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handlePasswordLogin(e);
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {magicSent && (
                <p className="text-sm text-green-600">
                  Magic link sent. Check your inbox.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? 'Logging in...' : 'Login'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isGoogleLoading}
                onClick={() => {
                  void handleGoogle();
                }}
              >
                {isGoogleLoading ? 'Redirecting…' : 'Login with Google'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isMagicLoading || !email}
                onClick={() => {
                  void handleMagicLink();
                }}
              >
                {isMagicLoading
                  ? 'Sending magic link…'
                  : 'Login with Magic Link'}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
