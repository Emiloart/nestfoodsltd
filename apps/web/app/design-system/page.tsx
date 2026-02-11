"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function DesignSystemPage() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Design System</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">UI Foundations</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Shared components and interaction primitives for a consistent premium interface.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Card>
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Inputs</h2>
          <Input placeholder="Search products..." />
        </Card>
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Premium</Badge>
            <Badge className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300">Organic</Badge>
            <Badge className="border-blue-500/50 text-blue-700 dark:text-blue-300">New</Badge>
          </div>
        </Card>
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Skeleton</h2>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Modal</h2>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open Modal
        </Button>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Design System Modal">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          This modal is reusable for confirmations, details, and guided actions.
        </p>
      </Modal>
    </section>
  );
}
