"use client";

import { useEffect } from "react";
import type { BreadcrumbItem } from "@/lib/context/breadcrumb-context";
import { useBreadcrumb } from "@/lib/context/breadcrumb-context";

type Props = { items: BreadcrumbItem[] };

export function SetBreadcrumbs({ items }: Props) {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs(items);
    return () => setBreadcrumbs(null);
  }, [items, setBreadcrumbs]);
  return null;
}
