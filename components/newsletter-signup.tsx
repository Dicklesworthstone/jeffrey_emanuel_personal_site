"use client";

import { useState, useCallback, useRef, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Check, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { siteConfig } from "@/lib/content";

// =============================================================================
// TYPES
// =============================================================================

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Map the subscribe endpoint's HTTP status to copy that names the problem
 * and, where possible, what to do next. 404 is the "list does not exist /
 * newsletter not set up" case, so it points at the direct-email fallback.
 */
function describeSubscribeFailure(status: number): { message: string; suggestEmail: boolean } {
  if (status === 404) {
    return { message: "Newsletter signup isn't available yet — email me instead.", suggestEmail: true };
  }
  if (status === 400 || status === 422) {
    return { message: "That email address doesn't look right. Check it and try again.", suggestEmail: false };
  }
  if (status === 409) {
    return { message: "That address is already subscribed.", suggestEmail: false };
  }
  if (status === 429) {
    return { message: "Too many attempts. Wait a minute and try again.", suggestEmail: false };
  }
  if (status >= 500) {
    return { message: "The newsletter service is having trouble. Try again in a few minutes, or email me.", suggestEmail: true };
  }
  return { message: "Signup didn't go through. Try again, or email me directly.", suggestEmail: true };
}

const NETWORK_FAILURE = {
  message: "Couldn't reach the newsletter service. Check your connection and try again, or email me directly.",
  suggestEmail: true,
};

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
  const [errorSuggestsEmail, setErrorSuggestsEmail] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const { lightTap, mediumTap } = useHapticFeedback();
  const inputId = useId();
  const errorId = useId();
  // The success state stays put: it is the confirmation and should not
  // vanish before a slower reader has finished it.

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("error");
        setErrorMessage("Please enter a valid email address");
        setErrorSuggestsEmail(false);
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
          const failure = describeSubscribeFailure(response.status);
          setStatus("error");
          setErrorMessage(failure.message);
          setErrorSuggestsEmail(failure.suggestEmail);
          lightTap();
        }
      } catch {
        // fetch itself rejected: offline, DNS, or a CORS-blocked response
        setStatus("error");
        setErrorMessage(NETWORK_FAILURE.message);
        setErrorSuggestsEmail(NETWORK_FAILURE.suggestEmail);
        lightTap();
      }
    },
    [email, buttondownId, lightTap, mediumTap]
  );

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 pointer-fine:backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Mail className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-white">{heading}</span>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              <span>You&apos;re subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2" aria-busy={status === "submitting"}>
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
                autoComplete="email"
                inputMode="email"
                disabled={status === "submitting"}
                aria-describedby={status === "error" ? errorId : undefined}
                className={cn(
                  "min-h-10 flex-1 rounded-lg border bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-500",
                  "outline-none transition-colors focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/40",
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
                  "inline-flex min-h-10 items-center justify-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition-all",
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
            <p id={errorId} role="alert" className="mt-2 flex flex-wrap items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
              {errorSuggestsEmail && (
                <a href={`mailto:${siteConfig.email}`} className="underline underline-offset-2 hover:text-red-300">
                  {siteConfig.email}
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-slate-900/80 to-slate-900/60 p-8 pointer-fine:backdrop-blur-sm sm:p-10">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Mail className="h-7 w-7 text-white" aria-hidden="true" />
          </div>

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
              aria-busy={status === "submitting"}
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
                  autoComplete="email"
                  inputMode="email"
                  disabled={status === "submitting"}
                  aria-describedby={status === "error" ? errorId : undefined}
                  className={cn(
                    "w-full rounded-xl border bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500",
                    "outline-none transition-all focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/40",
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
              id={errorId}
              role="alert"
              initial={reducedMotion ? false : { opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
              {errorSuggestsEmail && (
                <a href={`mailto:${siteConfig.email}`} className="underline underline-offset-2 hover:text-red-300">
                  {siteConfig.email}
                </a>
              )}
            </motion.p>
          )}

          {/* Privacy note */}
          <p className="mt-6 text-xs text-slate-500">
            Unsubscribe anytime. No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewsletterSignup;
