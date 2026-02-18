import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/careers", label: "Careers" },
  { href: "/sustainability", label: "Sustainability" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Nest Foods Ltd
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Enterprise-ready food commerce platform.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md text-xs text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
