// app/dashboard/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
  createdAt: string | Date;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data, error } = await authClient.getSession();
        
        if (error || !data?.user) {
          // No session, redirect to sign in
          router.push("/signin");
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-primary" />
            <span className="text-[18px] font-bold tracking-tight text-foreground">
              draftroom
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.image && (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-foreground">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your interview preparation journey
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total Interviews
              </p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-foreground">0%</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Time Spent
              </p>
              <p className="text-2xl font-bold text-foreground">0h</p>
            </div>
          </div>

          {/* Mock Activity Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Activity
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      No recent activity yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Start your first interview
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Quick Actions
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                <button className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary">
                  Start New Interview
                </button>
                <button className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground">
                  View Practice History
                </button>
                <button className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground">
                  Browse Interview Questions
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Account Information
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.name || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Account Created
                </span>
                <span className="text-sm font-medium text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}