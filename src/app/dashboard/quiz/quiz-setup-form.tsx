"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuizSession, createCustomBank } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UserTier, SessionType } from "@/types/app";
import {
  Lock,
  Brain,
  Clock,
  Zap,
  Target,
  Info,
  ShieldCheck,
  User,
  Plus,
  ChevronUp,
  ChevronDown,
  Check,
  ImageIcon,
  Sparkles,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  brain: Brain,
  clock: Clock,
  zap: Zap,
  target: Target,
};

interface QuizModeDetails {
  howItWorks: string[];
  bestFor: string;
}

interface QuizMode {
  id: string;
  label: string;
  desc: string;
  iconName: string;
  tier: UserTier;
  details: QuizModeDetails;
}

interface BankItem {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  is_official: boolean;
}

interface Props {
  userId: string;
  userTier: UserTier;
  banks: BankItem[];
  domains: { id: string; name: string; slug: string }[];
  quizModes: QuizMode[];
}

const TIER_RANK: Record<UserTier, number> = { free: 0, pro: 1, max: 2 };

export function QuizSetupForm({
  userId,
  userTier,
  banks: initialBanks,
  domains,
  quizModes,
}: Props) {
  const [mode, setMode] = useState<string>("practice");
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [domainId, setDomainId] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [timedMinutes, setTimedMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showCreateBank, setShowCreateBank] = useState(false);
  const [banks, setBanks] = useState<BankItem[]>(initialBanks);
  const router = useRouter();

  const officialBanks = banks.filter((b) => b.is_official);
  const userBanks = banks.filter((b) => !b.is_official);

  function toggleBank(id: string) {
    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function moveBank(bankId: string, direction: "up" | "down") {
    setSelectedBankIds((prev) => {
      const idx = prev.indexOf(bankId);
      if (idx === -1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return arr;
    });
  }

  async function handleStart() {
    setLoading(true);
    const bankId = selectedBankIds.length === 1 ? selectedBankIds[0] : null;
    const session = await createQuizSession({
      userId,
      bankId,
      domainId: domainId === "all" ? null : domainId,
      mode,
      questionCount,
    });

    if (session?.id) {
      const params = new URLSearchParams();
      if (mode === "timed_test") params.set("timer", String(timedMinutes));
      const qs = params.toString();
      router.push(`/dashboard/quiz/${session.id}${qs ? `?${qs}` : ""}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Quiz Mode Selection ── */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Quiz Mode
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quizModes.map((qm) => {
            const locked = TIER_RANK[userTier] < TIER_RANK[qm.tier];
            const selected = mode === qm.id;
            const Icon = ICON_MAP[qm.iconName] ?? Brain;
            return (
              <div key={qm.id} className="relative">
                <button
                  disabled={locked}
                  onClick={() => setMode(qm.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                    selected
                      ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5 shadow-sm"
                      : locked
                        ? "cursor-not-allowed border-border/40 opacity-40"
                        : "border-border/60 hover:border-muted-foreground/50 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selected
                        ? "bg-[var(--color-signal-amber)]/15 text-[var(--color-signal-amber)]"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{qm.label}</span>
                      {qm.tier !== "free" && (
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {qm.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {qm.desc}
                    </p>
                  </div>
                  {locked && (
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {/* Rich info popover */}
                <Popover>
                  <PopoverTrigger
                    render={
                      <button className="absolute right-3 bottom-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-secondary hover:text-muted-foreground">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    }
                  />
                  <PopoverContent side="bottom" align="end" sideOffset={8} className="w-80 p-0">
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-signal-amber)]/10 text-[var(--color-signal-amber)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{qm.label}</p>
                          <p className="text-[11px] text-muted-foreground">{qm.tier === "free" ? "Available to all" : `Requires ${qm.tier.toUpperCase()} plan`}</p>
                        </div>
                      </div>

                      {/* Preview placeholder */}
                      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border/60 bg-secondary/30">
                        <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
                          <ImageIcon className="h-5 w-5" />
                          <span className="text-[10px]">Preview</span>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          How it works
                        </p>
                        <ul className="space-y-1">
                          {qm.details.howItWorks.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-foreground/80">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-signal-amber)]" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-[var(--color-signal-blue)]/5 px-3 py-2">
                        <p className="text-[11px] text-[var(--color-signal-blue)]">
                          <Sparkles className="mr-1 inline h-3 w-3" />
                          <strong>Best for:</strong> {qm.details.bestFor}
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Question Banks ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Question Banks
          </h2>
          <button
            onClick={() => setShowCreateBank(true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--color-signal-blue)] transition-colors hover:bg-[var(--color-signal-blue)]/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Bank
          </button>
        </div>

        {selectedBankIds.length === 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            No banks selected — questions will be drawn from all available banks.
          </p>
        )}

        {/* Official banks */}
        {officialBanks.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-signal-green)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-signal-green)]">
                Official
              </span>
            </div>
            <div className="space-y-2">
              {officialBanks.map((bank) => (
                <BankCard
                  key={bank.id}
                  bank={bank}
                  isSelected={selectedBankIds.includes(bank.id)}
                  onToggle={() => toggleBank(bank.id)}
                  canMoveUp={selectedBankIds.indexOf(bank.id) > 0}
                  canMoveDown={
                    selectedBankIds.includes(bank.id) &&
                    selectedBankIds.indexOf(bank.id) < selectedBankIds.length - 1
                  }
                  onMoveUp={() => moveBank(bank.id, "up")}
                  onMoveDown={() => moveBank(bank.id, "down")}
                />
              ))}
            </div>
          </div>
        )}

        {/* User-created banks */}
        {userBanks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Your Banks
              </span>
            </div>
            <div className="space-y-2">
              {userBanks.map((bank) => (
                <BankCard
                  key={bank.id}
                  bank={bank}
                  isSelected={selectedBankIds.includes(bank.id)}
                  onToggle={() => toggleBank(bank.id)}
                  canMoveUp={selectedBankIds.indexOf(bank.id) > 0}
                  canMoveDown={
                    selectedBankIds.includes(bank.id) &&
                    selectedBankIds.indexOf(bank.id) < selectedBankIds.length - 1
                  }
                  onMoveUp={() => moveBank(bank.id, "up")}
                  onMoveDown={() => moveBank(bank.id, "down")}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Configuration ── */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Configuration
        </h2>
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Domain Focus</Label>
              <Select value={domainId} onValueChange={(v) => setDomainId(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                min={5}
                max={100}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>

            {mode === "timed_test" && (
              <div className="space-y-2">
                <Label htmlFor="timer">Time Limit (minutes)</Label>
                <Input
                  id="timer"
                  type="number"
                  min={5}
                  max={180}
                  value={timedMinutes}
                  onChange={(e) => setTimedMinutes(Number(e.target.value))}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Start ── */}
      <Button
        onClick={handleStart}
        disabled={loading}
        size="lg"
        className="h-12 w-full rounded-xl sm:w-auto sm:px-12"
      >
        {loading ? "Preparing..." : "Start Quiz"}
      </Button>

      {/* ── Create Bank Dialog ── */}
      <CreateBankDialog
        open={showCreateBank}
        onOpenChange={setShowCreateBank}
        userId={userId}
        onCreated={(bank) => {
          setBanks((prev) => [...prev, bank]);
          setSelectedBankIds((prev) => [...prev, bank.id]);
        }}
      />
    </div>
  );
}

/* ─── Bank Card ─── */

function BankCard({
  bank,
  isSelected,
  onToggle,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  bank: BankItem;
  isSelected: boolean;
  onToggle: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
        isSelected
          ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5 shadow-sm"
          : "border-border/40 hover:border-border hover:shadow-sm"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
          isSelected
            ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)] text-white"
            : "border-border/60 bg-transparent"
        }`}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{bank.title}</span>
          {bank.is_official && (
            <Badge variant="secondary" className="gap-1 text-[10px] text-[var(--color-signal-green)]">
              <ShieldCheck className="h-2.5 w-2.5" />
              Official
            </Badge>
          )}
        </div>
        {bank.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{bank.description}</p>
        )}
      </div>

      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {bank.question_count} Qs
      </span>

      {isSelected && (
        <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-30"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-30"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Create Bank Dialog ─── */

function CreateBankDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: (bank: BankItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    const bank = await createCustomBank({
      userId,
      title: title.trim(),
      description: description.trim() || null,
    });
    setSaving(false);

    if (bank) {
      onCreated({
        id: bank.id,
        title: bank.title,
        description: bank.description ?? null,
        question_count: 0,
        is_official: false,
      });
      setTitle("");
      setDescription("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Question Bank</DialogTitle>
          <DialogDescription>
            Create your own question bank. You can add questions to it later from the Library.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bank-title">Bank Name</Label>
            <Input
              id="bank-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Practice Questions"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-desc">Description (optional)</Label>
            <Textarea
              id="bank-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics does this bank cover?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || saving}>
            {saving ? "Creating..." : "Create Bank"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
