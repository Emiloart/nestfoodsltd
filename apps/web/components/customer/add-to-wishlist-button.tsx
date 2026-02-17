"use client";

import { Heart } from "lucide-react";
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
      <Heart size={14} className="mr-1.5" />
      {saving ? "Saving..." : label}
    </Button>
  );
}
