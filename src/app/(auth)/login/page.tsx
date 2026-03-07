import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[340px] space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Cerebro
          </Link>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Welcome back. Log in to continue your review.
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-[13px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4 hover:text-[var(--color-signal-amber)]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
