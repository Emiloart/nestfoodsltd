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
    <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker">Account Intelligence</p>
          <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            Continue from where your last order journey stopped.
          </h2>
        </div>
        <p className="pretty-text max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          Recommendations and recently viewed products stay visible so returning customers can move
          faster on both mobile and desktop.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Personalized Picks</p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Products boosted from your browsing and wishlist activity.
            </p>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Sign in to unlock recommendations.
            </p>
          ) : (
            <div className="space-y-2">
              {recommendations.slice(0, 4).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/products/${entry.product.slug}`}
                  className="block rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {entry.product.name}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.reason}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Recently Viewed</p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Quick return points for products you inspected most recently.
            </p>
          </div>
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
                  className="block rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {entry.name}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.category}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
