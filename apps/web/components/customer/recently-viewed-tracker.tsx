"use client";

import { useEffect } from "react";

type RecentlyViewedTrackerProps = {
  productSlug: string;
};

export function RecentlyViewedTracker({ productSlug }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    void fetch("/api/customer/recently-viewed", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productSlug }),
    });
  }, [productSlug]);

  return null;
}
