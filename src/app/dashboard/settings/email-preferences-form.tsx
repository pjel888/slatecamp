"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateEmailPreferences } from "@/lib/actions/email-preferences";
import { useRouter } from "next/navigation";

interface EmailPreferencesFormProps {
  finalStretchDaily: boolean;
}

export function EmailPreferencesForm({ finalStretchDaily }: EmailPreferencesFormProps) {
  const [enabled, setEnabled] = useState(finalStretchDaily);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleToggle(checked: boolean) {
    setEnabled(checked);
    setSaving(true);
    await updateEmailPreferences({ final_stretch_daily: checked });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor="final-stretch-email" className="text-sm font-medium">
          Final Stretch daily summary
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          When your exam is within 30 days, receive a daily email with readiness and focus tips (7 AM PH time).
        </p>
      </div>
      <Switch
        id="final-stretch-email"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={saving}
      />
    </div>
  );
}
