"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError("Please enter your password"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }).then((r) => r.json());

      if (res.success) {
        const from = searchParams.get("from") ?? "/admin";
        router.replace(from);
      } else {
        setError(res.message ?? "Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark admin-root min-h-screen flex items-center justify-center bg-[hsl(var(--adm-background))] px-4">
      {/* Background mesh */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% -10%, hsl(var(--adm-primary)/0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 90%, hsl(var(--adm-accent)/0.08) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-3xl border border-[hsl(var(--adm-border)/0.6)] bg-[hsl(var(--adm-card))] p-8 sm:p-10"
          style={{ boxShadow: "0 24px 64px -12px hsl(var(--adm-primary)/0.15), 0 0 0 1px hsl(var(--adm-border)/0.4)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              src="/assets/logo.png"
              alt="Kattil"
              className="h-14 object-contain mb-5"
            />
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--adm-primary)/0.3)] bg-[hsl(var(--adm-primary)/0.08)] px-3 py-1 text-xs font-semibold text-[hsl(var(--adm-primary))]"
              >
                <ShieldCheck className="h-3 w-3" />
                Admin Access
              </span>
            </div>
            <h1 className="text-xl font-bold text-[hsl(var(--adm-foreground))] mt-1">Welcome back</h1>
            <p className="text-sm text-[hsl(var(--adm-muted-foreground))] mt-1">Enter your admin password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--adm-foreground))]">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-[hsl(var(--adm-muted-foreground))]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter admin password"
                  autoFocus
                  className="flex h-11 w-full rounded-xl border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-10 pr-10 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] focus-visible:border-[hsl(var(--adm-primary)/0.5)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--adm-muted-foreground))] hover:text-[hsl(var(--adm-foreground))] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[hsl(var(--adm-destructive)/0.3)] bg-[hsl(var(--adm-destructive)/0.08)] px-4 py-2.5"
              >
                <p className="text-sm text-[hsl(var(--adm-destructive))]">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: "hsl(var(--adm-primary))", color: "hsl(var(--adm-primary-foreground))" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[hsl(var(--adm-muted-foreground)/0.6)]">
            Kattil Hotels · Content Management System
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
