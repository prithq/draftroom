import { Mail, Lock, User, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-white px-5 py-2.5 text-sm font-semibold hover:bg-muted shadow-[0_4px_0_0_hsl(0_0%_0%)]">
          <ArrowRight className="h-4 w-4 -rotate-180" />
          Back
        </Link>
      </div>

      <div className="w-full max-w-md rounded-3xl border-2 border-foreground bg-white p-8 shadow-[0_6px_0_0_hsl(0_0%_0%)]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-white">
            <Zap className="h-4 w-4" fill="currentColor" />
          </div>
          <span className="font-bricolage text-xl font-extrabold tracking-tight">DraftRoom</span>
        </div>

        <div className="text-center">
          <h2 className="font-bricolage text-3xl font-black">Get started</h2>
          <p className="mt-2 text-sm text-foreground/70">Create an account to start your interview.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button className="w-full rounded-full border-2 border-foreground bg-white py-3 text-sm font-semibold hover:bg-muted shadow-[0_4px_0_0_hsl(0_0%_0%)] transition-all active:translate-y-1">
            Continue with Google
          </button>
          <button className="w-full rounded-full border-2 border-foreground bg-white py-3 text-sm font-semibold hover:bg-muted shadow-[0_4px_0_0_hsl(0_0%_0%)] transition-all active:translate-y-1">
            Continue with GitHub
          </button>
        </div>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-foreground/50 font-medium tracking-wider">Or continue with email</span>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="text" placeholder="Sarah K." className="w-full rounded-lg border-2 border-foreground bg-background/30 px-10 py-3 text-sm font-medium placeholder:text-foreground/40 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="email" placeholder="sarah@example.com" className="w-full rounded-lg border-2 border-foreground bg-background/30 px-10 py-3 text-sm font-medium placeholder:text-foreground/40 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input type="password" placeholder="••••••••" className="w-full rounded-lg border-2 border-foreground bg-background/30 px-10 py-3 text-sm font-medium placeholder:text-foreground/40 focus:outline-none" />
            </div>
          </div>

          {/* Button now matches your screenshot: white, blue text, blue bottom curve */}
          <button type="submit" className="w-full rounded-full bg-white py-3.5 text-sm font-bold text-primary border-b-[3px] border-primary hover:bg-primary/5 transition-all">
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Already have an account? <Link href="/signin" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}