export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const message = params.error || 'Authentication error';
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-xl font-semibold mb-4">Auth Error</h1>
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}
