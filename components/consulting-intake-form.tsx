"use client";

import { useEffect, useRef, useState, forwardRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const engagementValues = [
  "market-analysis",
  "workflow-design",
  "staff-enablement",
  "ic-briefing",
  "custom",
] as const;

type EngagementType = (typeof engagementValues)[number];

const timelineValues = ["asap", "1-month", "3-months", "6-months", "flexible"] as const;

type Timeline = (typeof timelineValues)[number];

const budgetValues = [
  "under-10k",
  "10k-25k",
  "25k-50k",
  "50k-100k",
  "100k-plus",
  "flexible",
] as const;

type BudgetRange = (typeof budgetValues)[number];

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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  company: z.string().min(1, "Company is required"),
  role: z.string().optional(),
  engagementType: z.enum(engagementValues, {
    message: "Select an engagement type",
  }),
  timeline: z.enum(timelineValues).optional(),
  budget: z.enum(budgetValues).optional(),
  interests: z.array(z.string()),
  message: z
    .string()
    .min(1, "Please tell me about your needs")
    .max(1500, "Message is too long for mailto link (max 1500 chars)"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: DefaultValues<FormValues> = {
  name: "",
  email: "",
  company: "",
  role: "",
  message: "",
  interests: [],
};

type StepConfig = {
  id: string;
  title: string;
  description: string;
  fields: (keyof FormValues)[];
};

const steps: StepConfig[] = [
  {
    id: "contact",
    title: "Contact",
    description: "Tell me who you are",
    fields: ["name", "email", "company", "role"],
  },
  {
    id: "engagement",
    title: "Engagement",
    description: "Scope, timing, and budget",
    fields: ["engagementType", "timeline", "budget"],
  },
  {
    id: "focus",
    title: "Focus",
    description: "Interests and context",
    fields: ["interests", "message"],
  },
];

// Input wrapper component
function FormField({
  label,
  required,
  error,
  children,
  id,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-400" role="alert">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Styled input component
const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ComponentType<{ className?: string }>;
    error?: boolean;
  }
>(function InputComponent({ icon: Icon, error, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        {...props}
        ref={ref}
        aria-invalid={error}
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
});

// Styled textarea component
const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(function TextareaComponent({ error, ...props }, ref) {
  return (
    <textarea
      {...props}
      ref={ref}
      aria-invalid={error}
      className={cn(
        "w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-200 resize-none",
        "focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
        error
          ? "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20"
          : "border-slate-700/50 hover:border-slate-600/50"
      )}
    />
  );
});

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
  id,
  name,
  "aria-describedby": ariaDescribedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
  id?: string;
  name?: string;
  "aria-describedby"?: string;
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={ariaDescribedBy}
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

function StepIndicator({ steps, currentStep }: { steps: StepConfig[]; currentStep: number }) {
  const prefersReducedMotion = useReducedMotion();
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-slate-400">{steps[currentStep].title}</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <motion.div
          initial={prefersReducedMotion ? false : { width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
        />
      </div>
      <ol className="grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          return (
            <li key={step.id} className="flex items-center gap-2" aria-current={isActive ? "step" : undefined}>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                  isComplete
                    ? "bg-violet-500 text-white"
                    : isActive
                      ? "bg-violet-500/20 text-violet-200"
                      : "bg-slate-800/80 text-slate-500"
                )}
              >
                {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={cn("font-medium", isActive ? "text-slate-100" : "text-slate-500")}>
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Main form component
export default function ConsultingIntakeForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const {
    control,
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onTouched",
  });

  const selectedEngagement = useWatch({ control, name: "engagementType" });
  const selectedTimeline = useWatch({ control, name: "timeline" });
  const selectedBudget = useWatch({ control, name: "budget" });
  const selectedInterests = useWatch({ control, name: "interests" }) ?? [];

  useEffect(() => {
    const node = stepRefs.current[stepIndex];
    if (!node) return;
    const focusable = node.querySelector<HTMLElement>(
      "input, select, textarea, button"
    );
    if (focusable) {
      focusable.focus();
    }
  }, [stepIndex]);

  const scrollToFormTop = () => {
    if (!formRef.current) return;
    formRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleNext = async () => {
    const stepFields = steps[stepIndex]?.fields ?? [];
    const isValid = await trigger(stepFields, { shouldFocus: true });
    if (!isValid) return;
    setDirection(1);
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    scrollToFormTop();
  };

  const handleBack = () => {
    setDirection(-1);
    setStepIndex((prev) => Math.max(prev - 1, 0));
    scrollToFormTop();
  };

  const onSubmit = async (data: FormValues) => {
    const engagementLabel = engagementOptions.find((opt) => opt.value === data.engagementType)?.label;
    const timelineLabel = data.timeline
      ? timelineOptions.find((opt) => opt.value === data.timeline)?.label
      : undefined;
    const budgetLabel = data.budget
      ? budgetOptions.find((opt) => opt.value === data.budget)?.label
      : undefined;

    const subject = encodeURIComponent(
      `Consulting Inquiry from ${data.name} at ${data.company}`
    );

    const body = encodeURIComponent(
      `Name: ${data.name}
Email: ${data.email}
Company: ${data.company}
Role: ${data.role || "Not specified"}

Engagement Type: ${engagementLabel || "Not specified"}
Timeline: ${timelineLabel || "Not specified"}
Budget Range: ${budgetLabel || "Not specified"}

Areas of Interest:
${
        data.interests.length > 0
          ? data.interests
              .map((interest) => interestOptions.find((opt) => opt.id === interest)?.label)
              .filter(Boolean)
              .map((label) => `- ${label}`)
              .join("\n")
          : "None specified"
      }

Message:
${data.message}`
    );

    window.location.assign(
      `mailto:jeffreyemanuel@gmail.com?subject=${subject}&body=${body}`
    );

    setTimeout(() => {
      setIsSubmitted(true);
    }, 800);
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
          Your email client should have opened with the inquiry details. If it
          did not open, you can email me directly at{" "}
          <a
            href="mailto:jeffreyemanuel@gmail.com"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            jeffreyemanuel@gmail.com
          </a>
        </p>

        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setStepIndex(0);
            reset(defaultValues);
          }}
          className="mt-6 text-sm font-medium text-slate-500 transition-colors hover:text-slate-300"
        >
          Submit another inquiry
        </button>
      </motion.div>
    );
  }

  const isLastStep = stepIndex === steps.length - 1;
  const currentStep = steps[stepIndex];

  const summaryInterests = selectedInterests
    .map((interest) => interestOptions.find((opt) => opt.id === interest)?.label)
    .filter(Boolean);

  return (
    <form
      ref={formRef}
      onSubmit={
        isLastStep
          ? handleSubmit(onSubmit)
          : (event) => {
              event.preventDefault();
              handleNext();
            }
      }
      className="space-y-8"
    >
      <StepIndicator steps={steps} currentStep={stepIndex} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep.id}
          ref={(node) => {
            stepRefs.current[stepIndex] = node;
          }}
          initial={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0, x: direction >= 0 ? 40 : -40 }
          }
          animate={{ opacity: 1, x: 0 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, x: direction >= 0 ? -40 : 40 }
          }
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
          className="space-y-8"
        >
          {stepIndex === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3" aria-live="polite">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                  <p className="text-xs text-slate-500">{currentStep.description}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Name" required error={errors.name?.message} id="name">
                  <Input
                    id="name"
                    type="text"
                    icon={User}
                    placeholder="Your name"
                    error={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    {...register("name")}
                  />
                </FormField>

                <FormField label="Email" required error={errors.email?.message} id="email">
                  <Input
                    id="email"
                    type="email"
                    icon={Mail}
                    placeholder="you@company.com"
                    error={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                </FormField>

                <FormField label="Company" required error={errors.company?.message} id="company">
                  <Input
                    id="company"
                    type="text"
                    icon={Building2}
                    placeholder="Fund or firm name"
                    error={!!errors.company}
                    aria-describedby={errors.company ? "company-error" : undefined}
                    {...register("company")}
                  />
                </FormField>

                <FormField label="Role" id="role">
                  <Input
                    id="role"
                    type="text"
                    placeholder="Your title"
                    {...register("role")}
                  />
                </FormField>
              </div>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3" aria-live="polite">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Type of Engagement</h3>
                  <p className="text-xs text-slate-500">{currentStep.description}</p>
                </div>
              </div>

              <Controller
                name="engagementType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <div
                      role="radiogroup"
                      aria-describedby={errors.engagementType ? "engagementType-error" : undefined}
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {engagementOptions.map((opt) => (
                        <RadioCard
                          key={opt.value}
                          selected={field.value === opt.value}
                          onClick={() => field.onChange(opt.value)}
                          label={opt.label}
                          description={opt.description}
                        />
                      ))}
                    </div>
                    {errors.engagementType?.message && (
                      <p
                        id="engagementType-error"
                        className="flex items-center gap-1.5 text-xs text-rose-400"
                        role="alert"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.engagementType.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Timeline</h3>
                  </div>
                  <Controller
                    name="timeline"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="timeline"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={(value) => field.onChange(value || undefined)}
                        options={timelineOptions}
                        placeholder="When do you need this?"
                        icon={Calendar}
                      />
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Budget Range</h3>
                  </div>
                  <Controller
                    name="budget"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="budget"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={(value) => field.onChange(value || undefined)}
                        options={budgetOptions}
                        placeholder="Approximate budget"
                        icon={DollarSign}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3" aria-live="polite">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Areas of Interest</h3>
                  <p className="text-xs text-slate-500">{currentStep.description}</p>
                </div>
              </div>

              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((opt) => (
                      <ChipToggle
                        key={opt.id}
                        selected={field.value?.includes(opt.id)}
                        onClick={() => {
                          const next = field.value?.includes(opt.id)
                            ? field.value.filter((item) => item !== opt.id)
                            : [...(field.value ?? []), opt.id];
                          field.onChange(next);
                        }}
                        label={opt.label}
                      />
                    ))}
                  </div>
                )}
              />

              <FormField
                label="What are you looking to accomplish?"
                required
                error={errors.message?.message}
                id="message"
              >
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Describe your fund's current AI exposure, where you feel most uncertain, and what success would look like..."
                  error={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  {...register("message")}
                />
              </FormField>

              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <MessageSquare className="h-4 w-4 text-violet-300" />
                  <span className="font-semibold">Quick summary</span>
                </div>
                <div className="mt-3 grid gap-2">
                  <div>
                    <span className="text-slate-500">Engagement:</span>{" "}
                    <span className="text-slate-200">
                      {selectedEngagement
                        ? engagementOptions.find((opt) => opt.value === selectedEngagement)?.label
                        : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Timeline:</span>{" "}
                    <span className="text-slate-200">
                      {selectedTimeline
                        ? timelineOptions.find((opt) => opt.value === selectedTimeline)?.label
                        : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Budget:</span>{" "}
                    <span className="text-slate-200">
                      {selectedBudget
                        ? budgetOptions.find((opt) => opt.value === selectedBudget)?.label
                        : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Interests:</span>{" "}
                    <span className="text-slate-200">
                      {summaryInterests.length > 0 ? summaryInterests.join(", ") : "None specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-4 border-t border-slate-800/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0}
          className={cn(
            "rounded-xl border border-slate-700/60 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors",
            stepIndex === 0
              ? "cursor-not-allowed opacity-40"
              : "hover:border-slate-600/80 hover:text-white"
          )}
        >
          Back
        </button>

        <div className="flex flex-1 items-center justify-end gap-3">
          {!isLastStep && (
            <motion.button
              type="button"
              onClick={handleNext}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all"
            >
              Continue
            </motion.button>
          )}

          {isLastStep && (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className={cn(
                "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition-all sm:w-auto",
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
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        This will open your email client with the inquiry details pre-filled.
      </p>
    </form>
  );
}
