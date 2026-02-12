"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import { Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import illustration from "@/assets/overprompting_post_illustration.webp";

// Dynamic import visualizations (no SSR — they use browser APIs / refs)
const ConstraintViz = dynamic(
  () =>
    import("./overprompting-visualizations").then((m) => ({
      default: m.ConstraintViz,
    })),
  { ssr: false }
);
const QualityCurveViz = dynamic(
  () =>
    import("./overprompting-visualizations").then((m) => ({
      default: m.QualityCurveViz,
    })),
  { ssr: false }
);
const PlanExecuteViz = dynamic(
  () =>
    import("./overprompting-visualizations").then((m) => ({
      default: m.PlanExecuteViz,
    })),
  { ssr: false }
);

// Fonts — same editorial system as RaptorQ for consistency
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

// Section divider
function Divider() {
  return (
    <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
  );
}

// Editorial container
function EC({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 relative z-10">
      {children}
    </div>
  );
}

export function OverpromptingArticle() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [chefMode, setChefMode] = useState<"annoying" | "trusting">("annoying");
  const articleRef = useRef<HTMLDivElement>(null);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setScrollProgress(window.scrollY / total);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section reveal on scroll
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const targets = root.querySelectorAll(
      ":scope > section:not(:first-child), :scope > article"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("op-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => {
      el.classList.add("op-fade-section");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={articleRef}
      className={`overprompting-scope op-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="op-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pb-20">
        {/* Warm ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)",
          }}
        />

        <EC>
          <div className="text-center pt-24 md:pt-32 relative z-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-10 md:mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-amber-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              AI Prompting / Strategy
            </div>

            {/* Title */}
            <h1 className="op-display-title mb-6 text-white">
              The Overprompting
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                Trap.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-8 md:mt-12 font-light">
              Why your best intentions are the model&rsquo;s worst enemy, and
              what to do instead.
            </p>

            {/* Illustration */}
            <div className="relative mt-12 md:mt-16 mx-auto max-w-[560px]">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  transform: "scale(1.2)",
                }}
              />
              <Image
                src={illustration}
                alt="Illustration depicting the tension between detailed instructions and creative freedom in AI prompting"
                className="relative z-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl"
                priority
                placeholder="blur"
              />
            </div>
          </div>
        </EC>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-4 z-20 transition-opacity duration-500"
          style={{ opacity: Math.max(0, 0.5 - scrollProgress * 5) }}
        >
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            Scroll to Explore
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ========== THE IMAGE GENERATION PARADOX ========== */}
      <article>
        <EC>
          <p className="op-drop-cap">
            I&rsquo;ve mentioned this before, but I think it&rsquo;s so revealing and
            important to understand that I want to convey it again:
          </p>

          <p>
            Suppose you have two images of different people and you want Nano
            Banana to take the clothing and pose and orientation of the first
            image but make it look like the face of the second image so that
            it&rsquo;s perfectly recognizable.
          </p>

          <p>
            The obvious way to do this, and the conventional wisdom for a long
            time, was to make some big, detailed prompt that specifies exactly
            what you want to happen and even include a bunch of things to look
            out for to prevent known failure modes.
          </p>

          <p>
            You might have some phrases about making sure that the generated
            image looks &ldquo;just like&rdquo; the person in the second image, or that the
            &ldquo;facial likeness must be instantly recognizable&rdquo; or some other
            formulation.
          </p>

          <p>
            Or conversely, you might specify that the pose and clothing and
            orientation of the generated image must match that of the first
            image.
          </p>

          <p>
            And perhaps early testing taught you that there are some failure
            modes you had to watch out for. As an example, you might include in
            your prompt that, if the person in the first image has a beard, but
            the person in the second image doesn&rsquo;t have a beard, that the
            generated image should definitely not have a beard.
          </p>

          <p>
            All these things sound reasonable, do they not? And here&rsquo;s the weird
            thing:{" "}
            <strong>
              the more stuff like that you include in the prompt, the worse it
              will work!
            </strong>{" "}
            Now, in this example, it might &ldquo;work&rdquo; insofar as it will be a
            picture of the person dressed as the other person, but it will look
            comically bad like one of those &ldquo;face-in-hole&rdquo; apps from 2010. Why?
          </p>

          <p>
            What&rsquo;s even stranger is that giving a very short and schematic
            prompt asking what you want, like &ldquo;make the person in the second pic
            so they&rsquo;re dressed like the person in the first pic&rdquo; might result in
            a much more pleasing and realistic image, even if you might need to
            generate it a couple times to get it just right. Again, why?
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== CONSTRAINT VISUALIZATION ========== */}
      <section>
        <EC>
          <div className="op-viz-container">
            <ConstraintViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== EVERY WORD MATTERS ========== */}
      <section>
        <EC>
          <h2 className="op-section-title mb-8 mt-16 text-white">
            Every Word Matters
          </h2>

          <p>
            The answer is that these models are already trained so much to give
            good results out of the box. But they&rsquo;re also designed to be very
            helpful, attentive, and accommodating to every part of your request.
          </p>

          <p>
            In fact, every single word in your prompt is &ldquo;attended to&rdquo; by the
            model and has an impact on the specific activation states that occur
            in its &ldquo;brain.&rdquo;
          </p>

          <p>
            Because this activation weight space is so incomprehensibly vast,
            you&rsquo;d be amazed at just how different those activations can be as a
            result of what might seem to be a minor change in the wording of a
            prompt.
          </p>

          <div className="op-callout">
            <p className="!mb-0">
              Incidentally, this is why things like my &ldquo;fresh eyes&rdquo; code review
              prompt can be so shockingly effective if you&rsquo;re not used to that
              sort of thing: it&rsquo;s because they&rsquo;re tapping into some very deep
              thing in the model&rsquo;s brain that changes the way it operates, like
              toggling a create/critique mode gestalt switch.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE CHEF AND THE PARTY PLANNER ========== */}
      <section>
        <EC>
          <h2 className="op-section-title mb-8 mt-16 text-white">
            The Chef and the Party Planner
          </h2>

          <p>
            An analogy here is especially informative. Suppose you want to hire
            a famous and talented chef to prepare a special meal for your party.
            Great, surely it will be a wonderful meal, right?
          </p>

          <p>
            But then you start giving all these additional requests and tweaks
            to the chef: &ldquo;Martin has nut allergies. Oh and Lucy loves duck, be
            sure to include that. Oh, and our apple trees are ripe, wouldn&rsquo;t it
            be so great to use those, too.&rdquo; And on and on, you give more rules
            and requirements and constraints.
          </p>

          {/* Interactive Chef Widget */}
          <div className="my-12 p-1 bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-rose-500/5 opacity-50" />
             
             <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                   <div>
                      <h4 className="text-xl font-bold text-white mb-1">Kitchen Simulator</h4>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Cognitive Load Analysis</p>
                   </div>
                   
                   <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
                      <button 
                        onClick={() => setChefMode("annoying")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-tighter uppercase transition-all ${chefMode === "annoying" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Annoying Planner
                      </button>
                      <button 
                        onClick={() => setChefMode("trusting")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-tighter uppercase transition-all ${chefMode === "trusting" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Trusting Client
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-mono uppercase">
                            <span className="text-slate-400">Creative Flow</span>
                            <span className={chefMode === "trusting" ? "text-emerald-400" : "text-rose-400"}>
                               {chefMode === "trusting" ? "Unobstructed" : "Blocked"}
                            </span>
                         </div>
                         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                               initial={false}
                               animate={{ width: chefMode === "trusting" ? "100%" : "15%" }}
                               className={`h-full ${chefMode === "trusting" ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-mono uppercase">
                            <span className="text-slate-400">Output Artistry</span>
                            <span className={chefMode === "trusting" ? "text-emerald-400" : "text-rose-400"}>
                               {chefMode === "trusting" ? "Michelin Star" : "Diner Food"}
                            </span>
                         </div>
                         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                               initial={false}
                               animate={{ width: chefMode === "trusting" ? "95%" : "40%" }}
                               className={`h-full ${chefMode === "trusting" ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                         </div>
                      </div>
                   </div>

                   <div className="p-6 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         {chefMode === "trusting" ? <CheckCircle2 className="w-12 h-12 text-emerald-400" /> : <AlertTriangle className="w-12 h-12 text-rose-400" />}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">
                         {chefMode === "trusting" 
                           ? "“I trust your expertise. We want a vegetable-forward summer experience. Surprize us.”"
                           : "“Use the 2024 vintage oil, no nuts, keep it under 400 calories, and make sure the plating is symmetrical.”"}
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${chefMode === "trusting" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                         <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            {chefMode === "trusting" ? "Chef is in the zone" : "Chef is frustrated"}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <p>
            The chef wants to be helpful (assume you&rsquo;re paying them a lot), but
            every time you add another one of your rules, you are restricting
            and circumscribing what they can do. You are{" "}
            <strong>
              dramatically narrowing and constraining their search space
            </strong>{" "}
            and impeding their creative process, because now they keep bumping
            against your rules.
          </p>

          <p>
            Instead of focusing on what they know best, which is creating
            incredible dishes and meal experiences, they are forced to waste
            their cognitive energy on dancing around these constraints.
          </p>

          <p>
            If you foist enough of them on the chef, it becomes like those
            scenes in heist movies where they have all the laser beam motion
            detectors and you need to dance around them like some kind of ninja
            acrobat just to get through the other side. Now, if the chef is good
            enough, will you still end up with a pretty good meal for your
            guests? Sure, probably.
          </p>

          <p>
            But will it be close to as good as it could have been if you let the
            chef make all the decisions themselves with maybe just some basic,
            high-level guidance (e.g., &ldquo;less seafood, lots of veggies&rdquo;)?
            Almost certainly not.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== QUALITY CURVE VISUALIZATION ========== */}
      <section>
        <EC>
          <div className="op-viz-container">
            <QualityCurveViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE LESSON ========== */}
      <section>
        <EC>
          <div className="op-insight-card group">
            <div className="relative z-10">
              <p className="!mb-0">
                The chef is the model, and you are the annoying party planner.
                Every time you try to tell the model exactly what to do and how,
                just understand that, although you might end up with something
                that on the surface conforms with all your requirements, it will
                be the equivalent of that &ldquo;face-in-hole&rdquo; photo that
                &ldquo;technically&rdquo; looks like the person but also looks
                2-dimensional and like a bad Photoshop attempt:{" "}
                <strong>no artistry</strong>, and not likely to fool anyone about
                it being natural or real.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== FROM IMAGES TO CODE ========== */}
      <section>
        <EC>
          <h2 className="op-section-title mb-8 mt-16 text-white">
            From Images to Code
          </h2>

          <p>
            This applies just as much to using these models to generate code.
            The more you tell them what to do and how, the worse the results
            will be. That&rsquo;s why you should try to focus your prompting on your
            goals, the purpose of the project, the desired end state, the
            features and functionality you&rsquo;d like to have (but not in such
            extreme specificity: again focus on the purpose of the feature, the
            intent of it, what it&rsquo;s supposed to help the user do, etc.).
          </p>

          <p>
            The models are now smart enough that, once they understand the
            high-level goals, they can do a better job planning than you can, at
            least if the goal is to get a plan that other models/agents are
            going to implement.
          </p>

          <p>
            Note that what I&rsquo;m saying here really applies more to the planning
            stages. Once you have a plan, you can make it quite elaborate in an
            iterative way, and I usually do.
          </p>

          <p>
            And then I turn those plans into extremely detailed beads (epics,
            tasks, subtasks, etc) so that the agents that are actually
            implementing the stuff don&rsquo;t need to understand the big picture and
            can focus instead on their narrow task, much like a short-order cook
            in a diner can focus on the ticket in front of them and just make a
            good pastrami sandwich without worrying about how to bake a pie or
            whether the people at table 3 have been waiting too long for a water
            refill.
          </p>

          <div className="op-callout">
            <p className="!mb-0">
              So, in short: when coming up with your plan, don&rsquo;t be too
              prescriptive to give the model flexibility so that you get the
              best possible plan. But once you&rsquo;ve figured out what to do, you
              want to go in the opposite direction and get very detailed and
              specific so that you can turn the plan into such detailed marching
              orders that even a dumber agent could still probably implement
              them well (but of course, you don&rsquo;t use a dumb agent, you use a
              very smart agent that is super overpowered for the task so that
              they do a phenomenal job).
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== PLAN/EXECUTE VISUALIZATION ========== */}
      <section>
        <EC>
          <div className="op-viz-container">
            <PlanExecuteViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE BROWNFIELD CONNECTION ========== */}
      <section>
        <EC>
          <h2 className="op-section-title mb-8 mt-16 text-white">
            The Brownfield Connection
          </h2>

          <p>
            If you squint, you will also see a connection to my other big advice
            for working with brownfield projects that already have a ton of code
            (and also my approach to porting).
          </p>

          <p>
            That advice is that you first need to transform the big existing
            codebase into a much shorter specification document that details
            just the interfaces and the behaviors, but none of the internal
            implementation details.
          </p>

          <p>
            This lets you compress the important parts down into something that
            can easily fit within the model&rsquo;s context window, where it can think
            about everything all at once: the full totality of the project and
            what you&rsquo;re trying to do, without getting weighed down by all the
            minutiae (which wouldn&rsquo;t even fit in its context anyway, so that it
            would be forced to look through the equivalent of a very zoomed-in
            camera lens from far away, scanning just a tiny portion of the scene
            at a time).
          </p>

          <p>
            Although there are obvious differences here, the core concept is
            really analogous: that you want to{" "}
            <strong>
              get out of the way of the model as much as possible
            </strong>{" "}
            so it has more degrees of freedom to explore and solve your problem
            without having to waste its cognitive powers on dumb, irrelevant
            details. In the case of coming up with a plan, those would be like
            the details about all the ingredients you want to use.
          </p>

          <p>
            In the case of a brownfield development project, those details are
            all the irrelevant internal implementation details of all of the
            code files.
          </p>

          <div className="op-insight-card group">
            <div className="relative z-10">
              <p className="!mb-0">
                And by the way, you can always wait until after the chef has
                come up with the plan and then say at the end &ldquo;Oh, Martin has
                nut allergies so let&rsquo;s change that one thing.&rdquo; That might annoy
                the chef, but you&rsquo;ll still end up with a very good meal.
                Something to keep in mind.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== KEY TAKEAWAYS ========== */}
      <section className="pb-24">
        <EC>
          <div className="rounded-3xl p-8 md:p-12 border border-white/10 bg-white/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32 text-amber-400" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">Key Takeaways</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <h3 className="text-amber-400 font-mono text-xs uppercase tracking-widest">The Problem</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>Every constraint restricts the model&rsquo;s creative search space.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>Detailed instructions often lead to &ldquo;face-in-hole&rdquo; outputs with no artistry.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>The more you tell a model <em>how</em> to do something, the less it focuses on the <em>goal</em>.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-emerald-400 font-mono text-xs uppercase tracking-widest">The Solution</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Phase 1:</strong> Be open and intent-focused during planning.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Phase 2:</strong> Be extremely precise once the plan is set.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Trust the model&rsquo;s latent space to find the best implementation path.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </EC>
      </section>

      {/* Footer spacing */}
      <div className="h-32" />
    </div>
  );
}
