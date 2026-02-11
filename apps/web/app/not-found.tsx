import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-24 text-center md:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Page not found</h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
        The requested page is unavailable. Return to the platform home.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
      >
        Go home
      </Link>
    </section>
  );
}
