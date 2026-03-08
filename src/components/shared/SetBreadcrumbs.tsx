"use client";

import { useEffect } from "react";
import type { BreadcrumbItem } from "@/lib/context/breadcrumb-context";
import { useBreadcrumb } from "@/lib/context/breadcrumb-context";

type Props = { items: BreadcrumbItem[] };

export function SetBreadcrumbs({ items }: Props) {
  const ctx = useBreadcrumb();
  useEffect(() => {
    ctx?.setBreadcrumbs(items);
    return () => ctx?.setBreadcrumbs(null);
  }, [items, ctx]);
  return null;
}
