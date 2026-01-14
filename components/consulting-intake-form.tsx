"use client";

import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Loader2,
  User,
  Building2,
  Mail,
  MessageSquare,
  Target,
  Calendar,
  DollarSign,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Form field types
type EngagementType =
  | "market-analysis"
  | "workflow-design"
  | "staff-enablement"
  | "ic-briefing"
  | "custom";

type Timeline = "asap" | "1-month" | "3-months" | "6-months" | "flexible";

type BudgetRange = "under-10k" | "10k-25k" | "25k-50k" | "50k-100k" | "100k-plus" | "flexible";

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  engagementType: EngagementType | "";
  timeline: Timeline | "";
  budget: BudgetRange | "";
  interests: string[];
  message: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  company: "",
  role: "",
  engagementType: "",
  timeline: "",
  budget: "",
  interests: [],
  message: "",
};

// Interest areas
const interestOptions = [
  { id: "ai-infrastructure", label: "AI Infrastructure" },
  { id: "model-evaluation", label: "Model Evaluation" },
  { id: "agent-systems", label: "Agent Systems" },
  { id: "risk-analysis", label: "Risk Analysis" },
  { id: "due-diligence", label: "Due Diligence" },
  { id: "workflow-automation", label: "Workflow Automation" },
];

// Engagement types
const engagementOptions: { value: EngagementType; label: string; description: string }[] = [
  {
    value: "market-analysis",
    label: "Market & Risk Analysis",
    description: "Deep dives on AI-sensitive positions",
  },
  {
    value: "workflow-design",
    label: "Workflow Design",
    description: "LLM and agent integration",
  },
  {
    value: "staff-enablement",
    label: "Staff Enablement",
    description: "Training and playbooks",
  },
  {
    value: "ic-briefing",
    label: "IC/Board Briefing",
    description: "One-off or recurring sessions",
  },
  {
    value: "custom",
    label: "Custom Engagement",
    description: "Something else entirely",
  },
];

// Timeline options
const timelineOptions: { value: Timeline; label: string }[] = [
  { value: "asap", label: "ASAP" },
  { value: "1-month", label: "Within 1 month" },
  { value: "3-months", label: "Within 3 months" },
  { value: "6-months", label: "Within 6 months" },
  { value: "flexible", label: "Flexible" },
];

// Budget options
const budgetOptions: { value: BudgetRange; label: string }[] = [
  { value: "under-10k", label: "Under $10K" },
  { value: "10k-25k", label: "$10K - $25K" },
  { value: "25k-50k", label: "$25K - $50K" },
  { value: "50k-100k", label: "$50K - $100K" },
  { value: "100k-plus", label: "$100K+" },
  { value: "flexible", label: "Flexible" },
];

// Input wrapper component
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Styled input component
function Input({
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ComponentType<{ className?: string }>;
  error?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-200",
          "focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
          Icon && "pl-10",
          error
            ? "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20"
            : "border-slate-700/50 hover:border-slate-600/50"
        )}
      />
    </div>
  );
}

// Styled textarea component
function Textarea({
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-200 resize-none",
        "focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
        error
          ? "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20"
          : "border-slate-700/50 hover:border-slate-600/50"
      )}
    />
  );
}

// Radio card component
function RadioCard({
  selected,
  onClick,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200",
        selected
          ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/5"
          : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600/50 hover:bg-slate-900/60"
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            selected ? "text-white" : "text-slate-300"
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all",
            selected ? "border-violet-500 bg-violet-500" : "border-slate-600"
          )}
        >
          {selected && (
            <motion.div
              initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              className="h-1.5 w-1.5 rounded-full bg-white"
            />
          )}
        </div>
      </div>
      {description && (
        <span className="mt-1 text-xs text-slate-500">{description}</span>
      )}
    </motion.button>
  );
}

// Chip toggle component
function ChipToggle({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        selected
          ? "border-violet-500/50 bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/5"
          : "border-slate-700/50 bg-slate-900/40 text-slate-400 hover:border-slate-600/50 hover:bg-slate-900/60 hover:text-slate-300"
      )}
    >
      {label}
    </motion.button>
  );
}

// Select dropdown component
function Select({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm text-white backdrop-blur-sm transition-all duration-200",
          "focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
          "hover:border-slate-600/50",
          Icon && "pl-10",
          !value && "text-slate-500"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// Main form component
export default function ConsultingIntakeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please tell me about your needs";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Create mailto link with form data
    const subject = encodeURIComponent(
      `Consulting Inquiry from ${formData.name} at ${formData.company}`
    );

    const body = encodeURIComponent(
      `Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Role: ${formData.role || "Not specified"}

Engagement Type: ${formData.engagementType ? engagementOptions.find((e) => e.value === formData.engagementType)?.label : "Not specified"}
Timeline: ${formData.timeline ? timelineOptions.find((t) => t.value === formData.timeline)?.label : "Not specified"}
Budget Range: ${formData.budget ? budgetOptions.find((b) => b.value === formData.budget)?.label : "Not specified"}

Areas of Interest:
${formData.interests.length > 0 ? formData.interests.map((i) => `- ${interestOptions.find((opt) => opt.id === i)?.label}`).join("\n") : "None specified"}

Message:
${formData.message}`
    );

    // Open mailto link in a new way that's less likely to block the UI
    // Using window.open with _self target is often safer than location.href for mailto
    window.open(`mailto:jeffreyemanuel@gmail.com?subject=${subject}&body=${body}`, "_self");

    // Show success state after a brief delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-900/80 p-8 text-center backdrop-blur-xl"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <motion.div
          initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30"
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </motion.div>

        <h3 className="text-xl font-bold text-white">Message Ready</h3>
        <p className="mt-2 text-sm text-slate-400">
          Your email client should have opened with the inquiry details.
          If it did not open, you can email me directly at{" "}
          <a
            href="mailto:jeffreyemanuel@gmail.com"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            jeffreyemanuel@gmail.com
          </a>
        </p>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData(initialFormData);
          }}
          className="mt-6 text-sm font-medium text-slate-500 transition-colors hover:text-slate-300"
        >
          Submit another inquiry
        </button>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-white">Contact Information</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name}>
            <Input
              type="text"
              icon={User}
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              error={!!errors.name}
            />
          </FormField>

          <FormField label="Email" required error={errors.email}>
            <Input
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={!!errors.email}
            />
          </FormField>

          <FormField label="Company" required error={errors.company}>
            <Input
              type="text"
              icon={Building2}
              placeholder="Fund or firm name"
              value={formData.company}
              onChange={(e) => updateField("company", e.target.value)}
              error={!!errors.company}
            />
          </FormField>

          <FormField label="Role">
            <Input
              type="text"
              placeholder="Your title"
              value={formData.role}
              onChange={(e) => updateField("role", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Engagement Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <Target className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-white">Type of Engagement</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {engagementOptions.map((opt) => (
            <RadioCard
              key={opt.value}
              selected={formData.engagementType === opt.value}
              onClick={() => updateField("engagementType", opt.value)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
      </div>

      {/* Timeline & Budget */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold text-white">Timeline</h3>
          </div>
          <Select
            value={formData.timeline}
            onChange={(v) => updateField("timeline", v as Timeline)}
            options={timelineOptions}
            placeholder="When do you need this?"
            icon={Calendar}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <DollarSign className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold text-white">Budget Range</h3>
          </div>
          <Select
            value={formData.budget}
            onChange={(v) => updateField("budget", v as BudgetRange)}
            options={budgetOptions}
            placeholder="Approximate budget"
            icon={DollarSign}
          />
        </div>
      </div>

      {/* Areas of Interest */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-white">Areas of Interest</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {interestOptions.map((opt) => (
            <ChipToggle
              key={opt.id}
              selected={formData.interests.includes(opt.id)}
              onClick={() => toggleInterest(opt.id)}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-white">Tell me more</h3>
        </div>

        <FormField
          label="What are you looking to accomplish?"
          required
          error={errors.message}
        >
          <Textarea
            rows={5}
            placeholder="Describe your fund's current AI exposure, where you feel most uncertain, and what success would look like..."
            value={formData.message}
            onChange={(e) => updateField("message", e.target.value)}
            error={!!errors.message}
          />
        </FormField>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          className={cn(
            "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition-all",
            "hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)]",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" />

          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                Send Inquiry
              </>
            )}
          </span>
        </motion.button>

        <p className="mt-4 text-center text-xs text-slate-500">
          This will open your email client with the inquiry details pre-filled.
        </p>
      </div>
    </form>
  );
}
