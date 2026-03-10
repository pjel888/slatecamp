import Link from "next/link";
import { RegisterForm } from "./register-form";
import { siteConfig } from "@/lib/constants/site";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[340px] space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            {siteConfig.name}
          </Link>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Create your account and start reviewing.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-color-signal-amber"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
