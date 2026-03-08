"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markFinalStretchUpsellShown } from "@/lib/actions/final-stretch";
import Link from "next/link";

interface FinalStretchUpsellModalProps {
  show: boolean;
  examProfileId: string;
  daysLeft: number;
  examName?: string;
}

/** Shows once when show is true; on dismiss marks upsell as shown so it never shows again for this profile. */
export function FinalStretchUpsellModal({
  show,
  examProfileId,
  daysLeft,
  examName = "ALE",
}: FinalStretchUpsellModalProps) {
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (show && !open) setOpen(true);
  }, [show, open]);

  async function handleDismiss() {
    setDismissing(true);
    await markFinalStretchUpsellShown(examProfileId);
    setOpen(false);
  }

  if (!show) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[400px]">
        <DialogTitle>You&apos;re {daysLeft} days from your {examName}</DialogTitle>
        <DialogDescription>
          Upgrade to Pro to unlock SRS and full analytics — the tools you need most right now.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/dashboard/settings/billing">
            <Button className="w-full" onClick={handleDismiss}>
              Upgrade to Pro
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleDismiss}
            disabled={dismissing}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
