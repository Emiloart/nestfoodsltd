"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useExperience } from "@/components/customer/experience-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Order, type Subscription } from "@/lib/commerce/types";
import { SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/intl/config";
import { type CustomerPreferences, type CustomerProfile } from "@/lib/customer/types";

type CustomerSessionResponse = {
  authenticated: boolean;
  profile?: CustomerProfile;
};

type ProfileResponse = {
  profile: CustomerProfile;
};

type PreferencesResponse = {
  preferences: CustomerPreferences;
};

type OrdersResponse = {
  orders: Order[];
};

type SubscriptionsResponse = {
  subscriptions: Subscription[];
};

type WishlistResponse = {
  wishlist: {
    slug: string;
    name: string;
    category: string;
    imageUrl: string;
  }[];
};

type RecommendationsResponse = {
  recommendations: {
    id: string;
    reason: string;
    product: {
      slug: string;
      name: string;
      category: string;
      imageUrl: string;
    };
  }[];
};

type RecentlyViewedResponse = {
  recentlyViewed: {
    slug: string;
    name: string;
    category: string;
    imageUrl: string;
    shortDescription: string;
  }[];
};

export function AccountPageClient() {
  const { formatMinorAmount, setCurrency, setLocale } = useExperience();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready.");

  const [loginEmail, setLoginEmail] = useState("customer@example.com");
  const [loginName, setLoginName] = useState("Demo Customer");

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileAddressInput, setProfileAddressInput] = useState("");
  const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [wishlist, setWishlist] = useState<WishlistResponse["wishlist"]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse["recommendations"]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedResponse["recentlyViewed"]>([]);

  const preferencesInterests = useMemo(() => preferences?.interests.join(", ") ?? "", [preferences?.interests]);
  const preferencesDietaryTags = useMemo(() => preferences?.dietaryTags.join(", ") ?? "", [preferences?.dietaryTags]);
  const newsletterTopics = useMemo(() => preferences?.newsletter.topics.join(", ") ?? "", [preferences?.newsletter.topics]);

  useEffect(() => {
    async function loadSession() {
      const response = await fetch("/api/customer/session");
      if (!response.ok) {
        setAuthenticated(false);
        setProfile(null);
        setAuthChecked(true);
        return;
      }

      const data = (await response.json()) as CustomerSessionResponse;
      if (!data.authenticated || !data.profile) {
        setAuthenticated(false);
        setProfile(null);
        setAuthChecked(true);
        return;
      }

      setAuthenticated(true);
      setProfile(data.profile);
      setProfileAddressInput(data.profile.addresses.join("\n"));
      setLoginEmail(data.profile.email);
      setStatus("Session restored.");
      setAuthChecked(true);
      await loadAccountData();
    }

    void loadSession();
  }, []);

  async function loadAccountData() {
    setLoading(true);
    const responses = await Promise.all([
      fetch("/api/customer/profile"),
      fetch("/api/customer/preferences"),
      fetch("/api/customer/orders"),
      fetch("/api/customer/subscriptions"),
      fetch("/api/customer/wishlist"),
      fetch("/api/customer/recommendations"),
      fetch("/api/customer/recently-viewed"),
    ]);

    if (responses.some((response) => !response.ok)) {
      setStatus("Failed to load one or more account sections.");
      setLoading(false);
      return;
    }

    const [profileData, preferencesData, ordersData, subscriptionsData, wishlistData, recommendationsData, recentlyViewedData] =
      (await Promise.all(responses.map((response) => response.json()))) as [
        ProfileResponse,
        PreferencesResponse,
        OrdersResponse,
        SubscriptionsResponse,
        WishlistResponse,
        RecommendationsResponse,
        RecentlyViewedResponse,
      ];

    setProfile(profileData.profile);
    setProfileAddressInput(profileData.profile.addresses.join("\n"));
    setPreferences(preferencesData.preferences);
    setOrders(ordersData.orders);
    setSubscriptions(subscriptionsData.subscriptions);
    setWishlist(wishlistData.wishlist);
    setRecommendations(recommendationsData.recommendations);
    setRecentlyViewed(recentlyViewedData.recentlyViewed);
    setLocale(preferencesData.preferences.locale);
    setCurrency(preferencesData.preferences.currency);
    setStatus("Account synchronized.");
    setLoading(false);
  }

  async function signIn() {
    if (!loginEmail.trim()) {
      return;
    }

    setLoading(true);
    setStatus("Signing in...");
    const response = await fetch("/api/customer/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: loginEmail, fullName: loginName || undefined }),
    });

    if (!response.ok) {
      setStatus("Sign in failed.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as CustomerSessionResponse;
    setAuthenticated(Boolean(data.authenticated));
    if (data.profile) {
      setProfile(data.profile);
      setProfileAddressInput(data.profile.addresses.join("\n"));
    }
    await loadAccountData();
    setLoading(false);
  }

  async function signOut() {
    await fetch("/api/customer/session", { method: "DELETE" });
    setAuthenticated(false);
    setProfile(null);
    setPreferences(null);
    setOrders([]);
    setSubscriptions([]);
    setWishlist([]);
    setRecommendations([]);
    setRecentlyViewed([]);
    setStatus("Signed out.");
  }

  async function saveProfile() {
    if (!profile) {
      return;
    }

    const addresses = profileAddressInput
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);

    const response = await fetch("/api/customer/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: profile.fullName || undefined,
        phone: profile.phone || undefined,
        addresses,
      }),
    });

    if (!response.ok) {
      setStatus("Failed to update profile.");
      return;
    }

    const data = (await response.json()) as ProfileResponse;
    setProfile(data.profile);
    setStatus("Profile updated.");
  }

  async function savePreferences() {
    if (!preferences) {
      return;
    }

    const response = await fetch("/api/customer/preferences", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      setStatus("Failed to update preferences.");
      return;
    }

    const data = (await response.json()) as PreferencesResponse;
    setPreferences(data.preferences);
    setLocale(data.preferences.locale);
    setCurrency(data.preferences.currency);
    setStatus("Preferences updated.");
  }

  async function reorder(orderId: string, paymentProvider: "paystack" | "flutterwave") {
    const response = await fetch(`/api/customer/orders/${orderId}/reorder`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentProvider }),
    });
    if (!response.ok) {
      setStatus("Reorder failed.");
      return;
    }

    setStatus("Reorder created.");
    await loadAccountData();
  }

  async function removeWishlistItem(productSlug: string) {
    const response = await fetch("/api/customer/wishlist", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productSlug }),
    });
    if (!response.ok) {
      setStatus("Failed to remove wishlist item.");
      return;
    }
    const data = (await response.json()) as WishlistResponse;
    setWishlist(data.wishlist);
    setStatus("Wishlist updated.");
  }

  if (!authChecked) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <Card>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Loading customer account session...</p>
        </Card>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Customer Account
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Sign in with email to access profile, orders, wishlist, and personalization.
          </p>
        </div>
        <Card className="space-y-3">
          <Input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} type="email" placeholder="Email" />
          <Input value={loginName} onChange={(event) => setLoginName(event.target.value)} placeholder="Full name (optional)" />
          <Button onClick={signIn} disabled={loading || !loginEmail}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Account Dashboard
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Manage your profile, preferences, orders, subscriptions, and wishlist.
          </p>
        </div>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Profile</p>
          <Input
            value={profile?.fullName ?? ""}
            onChange={(event) =>
              setProfile((current) => (current ? { ...current, fullName: event.target.value || undefined } : current))
            }
            placeholder="Full name"
          />
          <Input
            value={profile?.phone ?? ""}
            onChange={(event) =>
              setProfile((current) => (current ? { ...current, phone: event.target.value || undefined } : current))
            }
            placeholder="Phone number"
          />
          <textarea
            value={profileAddressInput}
            onChange={(event) => setProfileAddressInput(event.target.value)}
            placeholder="One address per line"
            className="min-h-24 w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <Button onClick={saveProfile}>Save Profile</Button>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Preferences</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Language</span>
              <select
                value={preferences?.locale ?? "en-NG"}
                onChange={(event) =>
                  setPreferences((current) =>
                    current ? { ...current, locale: event.target.value as CustomerPreferences["locale"] } : current,
                  )
                }
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                {SUPPORTED_LOCALES.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Currency</span>
              <select
                value={preferences?.currency ?? "NGN"}
                onChange={(event) =>
                  setPreferences((current) =>
                    current ? { ...current, currency: event.target.value as CustomerPreferences["currency"] } : current,
                  )
                }
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                {SUPPORTED_CURRENCIES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Input
            value={preferencesDietaryTags}
            onChange={(event) =>
              setPreferences((current) =>
                current
                  ? {
                      ...current,
                      dietaryTags: event.target.value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                    }
                  : current,
              )
            }
            placeholder="Dietary tags (comma separated)"
          />
          <Input
            value={preferencesInterests}
            onChange={(event) =>
              setPreferences((current) =>
                current
                  ? {
                      ...current,
                      interests: event.target.value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                    }
                  : current,
              )
            }
            placeholder="Newsletter interests (comma separated)"
          />
          <Input
            value={newsletterTopics}
            onChange={(event) =>
              setPreferences((current) =>
                current
                  ? {
                      ...current,
                      newsletter: {
                        ...current.newsletter,
                        topics: event.target.value
                          .split(",")
                          .map((entry) => entry.trim())
                          .filter(Boolean),
                      },
                    }
                  : current,
              )
            }
            placeholder="Newsletter topics (comma separated)"
          />
          <label className="flex items-center justify-between text-sm">
            <span>Order updates</span>
            <input
              type="checkbox"
              checked={preferences?.notifications.orderUpdates ?? false}
              onChange={(event) =>
                setPreferences((current) =>
                  current
                    ? {
                        ...current,
                        notifications: {
                          ...current.notifications,
                          orderUpdates: event.target.checked,
                        },
                      }
                    : current,
                )
              }
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Marketing emails</span>
            <input
              type="checkbox"
              checked={preferences?.notifications.marketingEmails ?? false}
              onChange={(event) =>
                setPreferences((current) =>
                  current
                    ? {
                        ...current,
                        notifications: {
                          ...current.notifications,
                          marketingEmails: event.target.checked,
                        },
                      }
                    : current,
                )
              }
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>SMS alerts</span>
            <input
              type="checkbox"
              checked={preferences?.notifications.smsAlerts ?? false}
              onChange={(event) =>
                setPreferences((current) =>
                  current
                    ? {
                        ...current,
                        notifications: {
                          ...current.notifications,
                          smsAlerts: event.target.checked,
                        },
                      }
                    : current,
                )
              }
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Newsletter subscribed</span>
            <input
              type="checkbox"
              checked={preferences?.newsletter.subscribed ?? false}
              onChange={(event) =>
                setPreferences((current) =>
                  current
                    ? {
                        ...current,
                        newsletter: {
                          ...current.newsletter,
                          subscribed: event.target.checked,
                        },
                      }
                    : current,
                )
              }
            />
          </label>
          <Button onClick={savePreferences}>Save Preferences</Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Orders</p>
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{order.orderNumber}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{order.status}</p>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-200">
                    Total: {formatMinorAmount(order.summary.totalMinor, order.summary.currency)}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => reorder(order.id, order.paymentProvider)}
                  >
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Subscriptions</p>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No active subscriptions.</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Variant: {entry.variantId}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.frequency} · {entry.status} · next charge{" "}
                    {new Date(entry.nextChargeAt).toLocaleDateString("en-NG")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Wishlist</p>
          {wishlist.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No saved products.</p>
          ) : (
            <div className="space-y-2">
              {wishlist.map((entry) => (
                <div key={entry.slug} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <Link href={`/products/${entry.slug}`} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {entry.name}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.category}</p>
                  <Button size="sm" variant="ghost" onClick={() => removeWishlistItem(entry.slug)} className="mt-2">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Recommended</p>
          {recommendations.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No recommendations yet.</p>
          ) : (
            <div className="space-y-2">
              {recommendations.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/products/${entry.product.slug}`}
                  className="block rounded-xl border border-neutral-200 p-3 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{entry.product.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.reason}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Recently Viewed</p>
          {recentlyViewed.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No recent products yet.</p>
          ) : (
            <div className="space-y-2">
              {recentlyViewed.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/products/${entry.slug}`}
                  className="block rounded-xl border border-neutral-200 p-3 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{entry.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.category}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{loading ? "Syncing..." : status}</p>
    </section>
  );
}
