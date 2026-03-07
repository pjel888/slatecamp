"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuizSession, createCustomBank, saveReviewConfig, deleteReviewConfig } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { UserTier } from "@/types/app";
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
  Minus,
  Check,
  ImageIcon,
  Sparkles,
  Save,
  RotateCcw,
  Trash2,
  Play,
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

interface BankSelection {
  bankId: string;
  bankTitle: string;
  questionCount: number;
  maxQuestions: number;
}

interface SavedConfig {
  id: string;
  name: string;
  bank_configs: { bankId: string; bankTitle: string; questionCount: number }[];
  session_type: string;
  total_questions: number;
}

interface RecentSession {
  id: string;
  session_type: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number | null;
  session_config: { bankId: string; bankTitle: string; questionCount: number }[] | null;
  completed_at: string;
}

interface Props {
  userId: string;
  userTier: UserTier;
  banks: BankItem[];
  quizModes: QuizMode[];
  savedConfigs: SavedConfig[];
  recentSessions: RecentSession[];
}

const TIER_RANK: Record<UserTier, number> = { free: 0, pro: 1, max: 2 };

export function QuizSetupForm({
  userId,
  userTier,
  banks: initialBanks,
  quizModes,
  savedConfigs: initialSavedConfigs,
  recentSessions,
}: Props) {
  const [mode, setMode] = useState<string>("practice");
  const [bankSelections, setBankSelections] = useState<BankSelection[]>([]);
  const [timedMinutes, setTimedMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showCreateBank, setShowCreateBank] = useState(false);
  const [showSaveConfig, setShowSaveConfig] = useState(false);
  const [banks, setBanks] = useState<BankItem[]>(initialBanks);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(initialSavedConfigs);
  const router = useRouter();

  const officialBanks = banks.filter((b) => b.is_official);
  const userBanks = banks.filter((b) => !b.is_official);
  const totalQuestions = bankSelections.reduce((sum, b) => sum + b.questionCount, 0);
  const canSaveConfigs = TIER_RANK[userTier] >= TIER_RANK["pro"];

  function toggleBank(bank: BankItem) {
    setBankSelections((prev) => {
      const exists = prev.find((s) => s.bankId === bank.id);
      if (exists) return prev.filter((s) => s.bankId !== bank.id);
      return [
        ...prev,
        {
          bankId: bank.id,
          bankTitle: bank.title,
          questionCount: Math.min(20, bank.question_count),
          maxQuestions: bank.question_count,
        },
      ];
    });
  }

  function updateBankCount(bankId: string, delta: number) {
    setBankSelections((prev) =>
      prev.map((s) => {
        if (s.bankId !== bankId) return s;
        const next = Math.max(1, Math.min(s.maxQuestions, s.questionCount + delta));
        return { ...s, questionCount: next };
      })
    );
  }

  function setBankCount(bankId: string, count: number) {
    setBankSelections((prev) =>
      prev.map((s) => {
        if (s.bankId !== bankId) return s;
        return { ...s, questionCount: Math.max(1, Math.min(s.maxQuestions, count)) };
      })
    );
  }

  function loadConfig(config: SavedConfig) {
    setMode(config.session_type);
    setBankSelections(
      config.bank_configs.map((bc) => {
        const bank = banks.find((b) => b.id === bc.bankId);
        return {
          bankId: bc.bankId,
          bankTitle: bc.bankTitle,
          questionCount: bc.questionCount,
          maxQuestions: bank?.question_count ?? bc.questionCount,
        };
      })
    );
  }

  async function handleStart(configId?: string) {
    if (bankSelections.length === 0) return;
    setLoading(true);

    const session = await createQuizSession({
      userId,
      bankConfigs: bankSelections.map((s) => ({
        bankId: s.bankId,
        bankTitle: s.bankTitle,
        questionCount: s.questionCount,
      })),
      mode,
      totalQuestions,
      configId,
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

  async function handleDeleteConfig(id: string) {
    await deleteReviewConfig(id);
    setSavedConfigs((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* ── Saved Configurations ── */}
      {savedConfigs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Saved Configurations
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedConfigs.map((config) => (
              <Card key={config.id} className="group relative transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{config.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {config.total_questions} questions &middot; {config.session_type.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {config.session_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {config.bank_configs.map((bc) => (
                      <span
                        key={bc.bankId}
                        className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {bc.bankTitle} ({bc.questionCount})
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 flex-1 text-xs"
                      onClick={() => { loadConfig(config); handleStart(config.id); }}
                    >
                      <Play className="mr-1 h-3 w-3" /> Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => loadConfig(config)}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Load
                    </Button>
                    <button
                      onClick={() => handleDeleteConfig(config.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Sessions ── */}
      {recentSessions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Recent Sessions
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex min-w-[200px] flex-col rounded-xl border border-border/60 bg-background p-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {session.session_type.replace("_", " ")}
                  </Badge>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {session.score_percentage != null
                      ? `${Math.round(session.score_percentage)}%`
                      : "—"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.correct_answers}/{session.total_questions} correct
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(session.completed_at).toLocaleDateString()}
                </p>
                {session.session_config && (
                  <button
                    onClick={() => {
                      setMode(session.session_type);
                      setBankSelections(
                        session.session_config!.map((bc) => {
                          const bank = banks.find((b) => b.id === bc.bankId);
                          return {
                            bankId: bc.bankId,
                            bankTitle: bc.bankTitle,
                            questionCount: bc.questionCount,
                            maxQuestions: bank?.question_count ?? bc.questionCount,
                          };
                        })
                      );
                    }}
                    className="mt-2 text-[11px] font-medium text-[var(--color-signal-blue)] hover:underline"
                  >
                    Retake this session
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
                          <p className="text-[11px] text-muted-foreground">
                            {qm.tier === "free" ? "Available to all" : `Requires ${qm.tier.toUpperCase()} plan`}
                          </p>
                        </div>
                      </div>
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

      {/* ── Question Bank Selection (per-bank count) ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Select Question Banks
          </h2>
          <button
            onClick={() => setShowCreateBank(true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--color-signal-blue)] transition-colors hover:bg-[var(--color-signal-blue)]/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Bank
          </button>
        </div>

        {bankSelections.length === 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            Select at least one question bank to start a session.
          </p>
        )}

        {/* Official banks */}
        {officialBanks.length > 0 && (
          <BankGroup
            label="Official"
            icon={<ShieldCheck className="h-3.5 w-3.5 text-[var(--color-signal-green)]" />}
            labelClass="text-[var(--color-signal-green)]"
            banks={officialBanks}
            selections={bankSelections}
            onToggle={toggleBank}
            onUpdateCount={updateBankCount}
            onSetCount={setBankCount}
          />
        )}

        {/* User banks */}
        {userBanks.length > 0 && (
          <BankGroup
            label="Your Banks"
            icon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
            labelClass="text-muted-foreground"
            banks={userBanks}
            selections={bankSelections}
            onToggle={toggleBank}
            onUpdateCount={updateBankCount}
            onSetCount={setBankCount}
          />
        )}
      </section>

      {/* ── Session Summary + Timer ── */}
      {bankSelections.length > 0 && (
        <section>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Session Summary</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {bankSelections.length} bank{bankSelections.length > 1 ? "s" : ""} &middot; {totalQuestions} total questions
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {bankSelections.map((s) => (
                      <span
                        key={s.bankId}
                        className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {s.bankTitle} ({s.questionCount})
                      </span>
                    ))}
                  </div>
                </div>
                {mode === "timed_test" && (
                  <div className="space-y-1">
                    <Label htmlFor="timer" className="text-xs">Time Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="timer"
                        type="number"
                        min={5}
                        max={180}
                        value={timedMinutes}
                        onChange={(e) => setTimedMinutes(Number(e.target.value))}
                        className="h-8 w-20 text-center text-sm"
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => handleStart()}
          disabled={loading || bankSelections.length === 0}
          size="lg"
          className="h-12 rounded-xl px-8"
        >
          {loading ? "Preparing..." : "Start Session"}
        </Button>
        {canSaveConfigs && bankSelections.length > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl"
            onClick={() => setShowSaveConfig(true)}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        )}
        {!canSaveConfigs && bankSelections.length > 0 && (
          <span className="text-xs text-muted-foreground">
            <Lock className="mr-1 inline h-3 w-3" />
            Upgrade to Pro to save configurations
          </span>
        )}
      </div>

      {/* ── Create Bank Dialog ── */}
      <CreateBankDialog
        open={showCreateBank}
        onOpenChange={setShowCreateBank}
        userId={userId}
        onCreated={(bank) => {
          setBanks((prev) => [...prev, bank]);
        }}
      />

      {/* ── Save Config Dialog ── */}
      <SaveConfigDialog
        open={showSaveConfig}
        onOpenChange={setShowSaveConfig}
        userId={userId}
        bankSelections={bankSelections}
        mode={mode}
        totalQuestions={totalQuestions}
        onSaved={(config) => {
          setSavedConfigs((prev) => [config, ...prev]);
        }}
      />
    </div>
  );
}

/* ─── Bank Group ─── */

function BankGroup({
  label,
  icon,
  labelClass,
  banks,
  selections,
  onToggle,
  onUpdateCount,
  onSetCount,
}: {
  label: string;
  icon: React.ReactNode;
  labelClass: string;
  banks: BankItem[];
  selections: BankSelection[];
  onToggle: (bank: BankItem) => void;
  onUpdateCount: (bankId: string, delta: number) => void;
  onSetCount: (bankId: string, count: number) => void;
}) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${labelClass}`}>
          {label}
        </span>
      </div>
      <div className="space-y-2">
        {banks.map((bank) => {
          const sel = selections.find((s) => s.bankId === bank.id);
          const isSelected = !!sel;
          return (
            <div
              key={bank.id}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                isSelected
                  ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)]/5 shadow-sm"
                  : "border-border/40 hover:border-border hover:shadow-sm"
              }`}
            >
              {/* Toggle checkbox */}
              <button
                onClick={() => onToggle(bank)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-[var(--color-signal-amber)] bg-[var(--color-signal-amber)] text-white"
                    : "border-border/60 bg-transparent"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </button>

              {/* Bank info */}
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

              {/* Question count stepper */}
              {isSelected && sel ? (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => onUpdateCount(bank.id, -5)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    value={sel.questionCount}
                    onChange={(e) => onSetCount(bank.id, Number(e.target.value))}
                    className="h-7 w-14 rounded-lg border border-border/60 bg-transparent text-center text-xs font-medium tabular-nums text-foreground focus:border-[var(--color-signal-amber)] focus:outline-none"
                    min={1}
                    max={sel.maxQuestions}
                  />
                  <button
                    onClick={() => onUpdateCount(bank.id, 5)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    / {sel.maxQuestions}
                  </span>
                </div>
              ) : (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {bank.question_count} Qs
                </span>
              )}
            </div>
          );
        })}
      </div>
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
            Create your own question bank. You can add questions later from the Library.
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

/* ─── Save Config Dialog ─── */

function SaveConfigDialog({
  open,
  onOpenChange,
  userId,
  bankSelections,
  mode,
  totalQuestions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  bankSelections: BankSelection[];
  mode: string;
  totalQuestions: number;
  onSaved: (config: SavedConfig) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const result = await saveReviewConfig({
      userId,
      name: name.trim(),
      bankConfigs: bankSelections.map((s) => ({
        bankId: s.bankId,
        bankTitle: s.bankTitle,
        questionCount: s.questionCount,
      })),
      mode,
      totalQuestions,
    });
    setSaving(false);

    if (result) {
      onSaved({
        id: result.id,
        name: result.name,
        bank_configs: bankSelections.map((s) => ({
          bankId: s.bankId,
          bankTitle: s.bankTitle,
          questionCount: s.questionCount,
        })),
        session_type: mode,
        total_questions: totalQuestions,
      });
      setName("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
          <DialogDescription>
            Save this session setup to quickly start it again later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="config-name">Configuration Name</Label>
            <Input
              id="config-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Full ALE Review, Structural Focus"
            />
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Summary</p>
            <p className="mt-1 text-xs text-foreground">
              {totalQuestions} questions from {bankSelections.length} bank{bankSelections.length > 1 ? "s" : ""}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {bankSelections.map((s) => (
                <span key={s.bankId} className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {s.bankTitle} ({s.questionCount})
                </span>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
