import { AuthButton } from '@/components/auth/auth-button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={'/'}>JobSwipe</Link>
            </div>
            <AuthButton />
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <div className="flex flex-col gap-8 items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to <span className="text-primary">JobSwipe</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Your platform to discover opportunities, grow your career and land
              the right job. Join our community of job seekers and career
              experts to unlock new opportunities.
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Get Started
              </Link>
              <Link
                href="/protected"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-6 border rounded-lg">
              <h3 className="text-xl font-semibold">Apply</h3>
              <p className="text-muted-foreground">
                Discover tailored job opportunities and submit applications with
                ease.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-6 border rounded-lg">
              <h3 className="text-xl font-semibold">Network</h3>
              <p className="text-muted-foreground">
                Build connections with recruiters and professionals in your
                field.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-6 border rounded-lg">
              <h3 className="text-xl font-semibold">Advance</h3>
              <p className="text-muted-foreground">
                Enhance your career prospects and unlock growth opportunities.
              </p>
            </div>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>Built with ❤️ by JobSwipe</p>
        </footer>
      </div>
    </main>
  );
}
