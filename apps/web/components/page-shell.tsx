import Link from "next/link";

type PageShellProps = {
  title: string;
  description: string;
  nextStep?: string;
};

export function PageShell({ title, description, nextStep }: PageShellProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <div className="max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
        {nextStep ? <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-500">{nextStep}</p> : null}
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
          >
            Back Home
          </Link>
          <Link
            href="/admin"
            className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white dark:bg-white dark:text-neutral-900"
          >
            Admin
          </Link>
        </div>
      </div>
    </section>
  );
}
