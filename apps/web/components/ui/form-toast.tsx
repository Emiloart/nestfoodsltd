import { cn } from "@/lib/cn";

type FormToastProps = {
  tone: "info" | "success" | "error";
  message: string;
};

export function FormToast({ tone, message }: FormToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[1rem] border px-3 py-2 text-xs font-semibold leading-5 shadow-[0_10px_22px_rgba(46,18,69,0.08)]",
        tone === "success" &&
          "border-[color:color-mix(in_srgb,var(--brand-1)_28%,white)] bg-[color:var(--bg-accent-brand)] text-[color:var(--brand-1)]",
        tone === "error" && "border-red-200 bg-red-50 text-red-700",
        tone === "info" &&
          "border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-neutral-600",
      )}
    >
      {message}
    </div>
  );
}
