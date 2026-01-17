"use client";

import { useState, useCallback, useRef, useEffect, useId } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Mail, Check, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

// =============================================================================
// TYPES
// =============================================================================

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface NewsletterSignupProps {
  /** Optional CSS class name */
  className?: string;
  /** Buttondown username/newsletter ID */
  buttondownId?: string;
  /** Heading text */
  heading?: string;
  /** Description text */
  description?: string;
  /** Compact mode for smaller placements */
  compact?: boolean;
}

// =============================================================================
// NEWSLETTER SIGNUP COMPONENT
// =============================================================================

export function NewsletterSignup({
  className,
  buttondownId = "jeffreyemanuel",
  heading = "Stay in the loop",
  description = "Get notified about new essays, projects, and tools. No spam, just signal.",
  compact = false,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const { lightTap, mediumTap } = useHapticFeedback();
  const inputId = useId();

  // Reset to idle after showing success for a while
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setEmail("");
      }, 5000);
      return () => clearTimeout(timer);
    }
    return;
  }, [status]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("error");
        setErrorMessage("Please enter a valid email address");
        lightTap();
        return;
      }

      setStatus("submitting");
      mediumTap();

      try {
        // Submit to Buttondown's embed endpoint (public, no API key needed)
        // We use FormData to mimic a form submission
        const formData = new FormData();
        formData.append("email", email);

        const response = await fetch(
          `https://buttondown.email/api/emails/embed-subscribe/${buttondownId}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          setStatus("success");
          mediumTap();
        } else {
          throw new Error("Subscription failed");
        }
      } catch {
        // If fetch fails, show error state
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
        lightTap();
      }
    },
    [email, buttondownId, lightTap, mediumTap]
  );

  if (compact) {
    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{heading}</span>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              <span>You&apos;re subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <label htmlFor={inputId} className="sr-only">
                Email address
              </label>
              <input
                id={inputId}
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setErrorMessage("");
                  }
                }}
                placeholder="your@email.com"
                disabled={status === "submitting"}
                className={cn(
                  "flex-1 rounded-lg border bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-500",
                  "outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30",
                  status === "error"
                    ? "border-red-500/50"
                    : "border-slate-700/50"
                )}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                aria-label="Subscribe"
                className={cn(
                  "rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition-all",
                  "hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {status === "submitting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </form>
          )}

          {status === "error" && errorMessage && (
            <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              {errorMessage}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: reducedMotion ? 0 : 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-slate-900/80 to-slate-900/60 p-8 backdrop-blur-sm sm:p-10"
      >
        {/* Background decorations */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon */}
          <motion.div
            initial={reducedMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              delay: reducedMotion ? 0 : 0.2,
            }}
            className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
          >
            <Mail className="h-7 w-7 text-white" />
          </motion.div>

          {/* Heading */}
          <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            {heading}
          </h3>

          {/* Description */}
          <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            {description}
          </p>

          {/* Form or success state */}
          {status === "success" ? (
            <motion.div
              initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 rounded-full bg-emerald-500/10 px-6 py-3 ring-1 ring-emerald-500/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-emerald-400">
                You&apos;re on the list! Check your inbox to confirm.
              </span>
            </motion.div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <label htmlFor={inputId} className="sr-only">
                  Email address
                </label>
                <input
                  id={inputId}
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") {
                      setStatus("idle");
                      setErrorMessage("");
                    }
                  }}
                  placeholder="you@example.com"
                  disabled={status === "submitting"}
                  aria-label="Email address"
                  aria-describedby={status === "error" ? "email-error" : undefined}
                  className={cn(
                    "w-full rounded-xl border bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500",
                    "outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30",
                    status === "error"
                      ? "border-red-500/50"
                      : "border-slate-700/50"
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3",
                  "bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-semibold text-white",
                  "transition-all hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error message */}
          {status === "error" && errorMessage && (
            <motion.p
              id="email-error"
              role="alert"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </motion.p>
          )}

          {/* Privacy note */}
          <p className="mt-6 text-xs text-slate-500">
            Unsubscribe anytime. No spam, ever.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default NewsletterSignup;
