import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-24 text-center md:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">404</p>
      <h1 className="display-heading mt-4 text-4xl text-neutral-900 dark:text-neutral-100">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
        The requested page is unavailable. Return to the platform home.
      </p>
      <Link
        href="/"
        className={buttonClassName({ variant: "primary", className: "mt-6" })}
      >
        Go home
      </Link>
    </section>
  );
}
