"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

type ProductPreview = {
  slug: string;
  name: string;
  category: string;
};

type Recommendation = {
  id: string;
  reason: string;
  product: ProductPreview;
};

type RecentlyViewed = ProductPreview & {
  shortDescription: string;
};

export function PersonalizedRail() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);

  useEffect(() => {
    async function load() {
      const recommendationsResponse = await fetch("/api/customer/recommendations");
      if (recommendationsResponse.ok) {
        const recommendationsData = (await recommendationsResponse.json()) as { recommendations: Recommendation[] };
        setRecommendations(recommendationsData.recommendations);
      }

      const recentlyViewedResponse = await fetch("/api/customer/recently-viewed");
      if (recentlyViewedResponse.ok) {
        const recentlyViewedData = (await recentlyViewedResponse.json()) as { recentlyViewed: RecentlyViewed[] };
        setRecentlyViewed(recentlyViewedData.recentlyViewed);
      }
    }

    void load();
  }, []);

  if (recommendations.length === 0 && recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-20 md:grid-cols-2 md:px-6">
      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
          Personalized Picks
        </p>
        {recommendations.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Sign in to unlock recommendations.</p>
        ) : (
          <div className="space-y-2">
            {recommendations.slice(0, 4).map((entry) => (
              <Link
                key={entry.id}
                href={`/products/${entry.product.slug}`}
                className="block rounded-xl border border-neutral-200 px-3 py-2 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{entry.product.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.reason}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Recently Viewed</p>
        {recentlyViewed.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            View products while signed in to build your quick-access list.
          </p>
        ) : (
          <div className="space-y-2">
            {recentlyViewed.slice(0, 4).map((entry) => (
              <Link
                key={entry.slug}
                href={`/products/${entry.slug}`}
                className="block rounded-xl border border-neutral-200 px-3 py-2 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{entry.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.category}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
