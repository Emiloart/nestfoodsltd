"use client";

import { useState } from "react";

import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  variantId: string;
  disabled?: boolean;
};

export function AddToCartButton({ variantId, disabled = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      onClick={() => {
        addItem(variantId, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      disabled={disabled}
    >
      {added ? "Added" : "Add to cart"}
    </Button>
  );
}
