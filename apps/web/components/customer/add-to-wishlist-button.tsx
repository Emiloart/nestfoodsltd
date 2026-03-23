"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type AddToWishlistButtonProps = {
  productSlug: string;
  size?: "sm" | "md" | "lg";
};

export function AddToWishlistButton({ productSlug, size = "sm" }: AddToWishlistButtonProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "auth_required" | "error">("idle");

  async function handleSave() {
    setSaving(true);
    const response = await fetch("/api/customer/wishlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productSlug }),
    });

    if (response.status === 401) {
      setStatus("auth_required");
      setSaving(false);
      return;
    }
    if (!response.ok) {
      setStatus("error");
      setSaving(false);
      return;
    }

    setStatus("saved");
    setSaving(false);
  }

  const label =
    status === "saved"
      ? "Saved"
      : status === "auth_required"
        ? "Sign in required"
        : status === "error"
          ? "Retry"
          : "Wishlist";

  return (
    <Button variant="secondary" size={size} onClick={handleSave} disabled={saving || status === "saved"}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mr-1.5 h-3.5 w-3.5">
        <path
          d="M12 20s-6.8-4.4-9-8.2C1.2 8.6 3.2 5 6.9 5c2 0 3.1 1.2 4.1 2.5C12 6.2 13.1 5 15.1 5 18.8 5 20.8 8.6 21 11.8 18.8 15.6 12 20 12 20Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {saving ? "Saving..." : label}
    </Button>
  );
}
