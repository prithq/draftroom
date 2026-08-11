"use client"

import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.52 12.29c0-.84-.08-1.67-.23-2.49H12v4.71h6.46a5.63 5.63 0 0 1-2.44 3.69v3.07h3.95c2.31-2.13 3.65-5.26 3.65-8.98z" fill="#4285F4"/>
    <path d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.95-3.07c-1.1.74-2.5 1.17-4.16 1.17-3.19 0-5.9-2.15-6.87-5.05H1.16v3.17C3.17 21.33 7.34 24 12 24z" fill="#34A853"/>
    <path d="M5.13 14.14a7.36 7.36 0 0 1 0-4.68V6.29H1.16C.42 7.77 0 9.44 0 11.2c0 1.76.42 3.43 1.16 4.91l3.97-1.97z" fill="#FBBC05"/>
    <path d="M12 4.75c1.8 0 3.41.62 4.68 1.82l3.5-3.5C18.08 1.15 15.3 0 12 0 7.34 0 3.17 2.67 1.16 6.29l3.97 3.09c.97-2.9 3.68-5.05 6.87-5.05z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await authClient.signUp.email({
        name,
        email,
        password,
      });
    
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

 // In your component, add more logging
async function handleSocialSignUp(provider: "google" | "github") {
  setIsLoading(true);
  setError("");

  
  try {
    const result = await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
   
    
  } catch (err: any) {
    console.error(`🔴 ${provider} sign up error:`, err); 

    if (err?.response) {
      const text = await err.response.text();
      console.error("Error response body:", text);
    }
    
    setError(err?.message || `Failed to sign up with ${provider}. Please try again.`);
    setIsLoading(false);
  }
}
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
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
          <span className="text-[18px] font-bold tracking-tight text-foreground">draftroom</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Start your technical interview preparation.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Social Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button 
            onClick={() => handleSocialSignUp("google")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 w-full rounded-md border border-border bg-background py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button 
            onClick={() => handleSocialSignUp("github")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2.5 w-full rounded-md border border-border bg-background py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GitHubIcon />
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

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Sarah Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
                className="w-full rounded-md border border-border bg-background px-9 py-2.5 text-[13px] font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-foreground py-2.5 text-[13px] font-medium tracking-tight text-background transition-colors hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
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