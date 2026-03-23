"use client";

import { useState } from "react";

import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  variantId: string;
  quantity?: number;
  label?: string;
  disabled?: boolean;
};

export function AddToCartButton({
  variantId,
  quantity = 1,
  label,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      onClick={() => {
        addItem(variantId, quantity);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      disabled={disabled}
    >
      {added ? "Added" : (label ?? "Add to cart")}
    </Button>
  );
}
