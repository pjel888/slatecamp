"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFESSIONS } from "@/lib/utils/constants";
import type { Profile, Profession, Theme } from "@/types/app";
import { useRouter } from "next/navigation";

interface Props {
  profile: Profile;
}

export function SettingsForm({ profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [profession, setProfession] = useState<Profession>(
    profile.profession as Profession
  );
  const [examTarget, setExamTarget] = useState(profile.exam_target ?? "");
  const [targetDate, setTargetDate] = useState(
    profile.target_exam_date ?? ""
  );
  const [theme, setTheme] = useState<Theme>(profile.preferred_theme as Theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const selectedProfession = PROFESSIONS.find((p) => p.value === profession);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        profession,
        exam_target: examTarget,
        target_exam_date: targetDate || null,
        preferred_theme: theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Profession</Label>
          <Select
            value={profession}
            onValueChange={(v) => setProfession(v as Profession)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFESSIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Exam Target</Label>
          <Select value={examTarget} onValueChange={(v) => setExamTarget(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {selectedProfession?.exams.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target-date">Exam Date</Label>
          <Input
            id="target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={theme}
            onValueChange={(v) => setTheme(v as Theme)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saved && (
          <span className="text-sm text-color-signal-green">
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
