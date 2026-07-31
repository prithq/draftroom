import { Mail, Lock, User, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium tracking-tight text-foreground transition-colors hover:border-foreground"
        >
          <ArrowRight className="h-4 w-4 -rotate-180" />
          Back
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
          <span className="text-[18px] font-bold tracking-tight text-foreground">draftroom</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Get started</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Create an account to start your interview.
          </p>
        </div>

        {/* Social Buttons (Text only to prevent missing icon errors) */}
        <div className="mt-8 flex flex-col gap-3">
          <button className="w-full rounded-md border border-border bg-background py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground">
            Continue with Google
          </button>
          <button className="w-full rounded-md border border-border bg-background py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground">
            Continue with GitHub
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.12em]">
            <span className="bg-card px-4 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Sarah K."
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="sarah@example.com"
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-foreground py-2.5 text-[13px] font-medium tracking-tight text-background transition-colors hover:bg-primary"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}