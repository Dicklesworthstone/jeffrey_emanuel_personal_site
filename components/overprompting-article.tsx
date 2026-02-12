"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
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
    <div data-section className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
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
      ":scope > section:not(:first-child), :scope > article, [data-section]"
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
      role="main"
      className={`overprompting-scope op-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="op-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section data-section="hero" className="min-h-screen flex flex-col justify-start relative overflow-hidden pb-20 pt-24 md:pt-32">
        {/* Warm ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)",
          }}
        />

        <EC>
          <div className="text-center relative z-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-10 md:mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-amber-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              AI Prompting / Strategy
            </div>

            {/* Title */}
            <h1 className="op-display-title mb-6 text-white text-balance">
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
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40 font-black">
            Scroll to Explore
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ========== NARRATIVE PART 1 ========== */}
      <article data-section="part-1">
        <EC>
          <p className="op-drop-cap">
            {"I've mentioned this before, but I think it's so revealing and important to understand that I want to convey it again:"}
          </p>
          <p>
            {"Suppose you have two images of different people and you want Nano Banana to take the clothing and pose and orientation of the first image but make it look like the face of the second image so that it's perfectly recognizable."}
          </p>
          <p>
            {"The obvious way to do this, and the conventional wisdom for a long time, was to make some big, detailed prompt that specifies exactly what you want to happen and even include a bunch of things to look out for to prevent known failure modes."}
          </p>
          <p>
            {'You might have some phrases about making sure that the generated image looks "just like" the person in the second image, or that the "facial likeness must be instantly recognizable" or some other formulation.'}
          </p>
          <p>
            {"Or conversely, you might specify that the pose and clothing and orientation of the generated image must match that of the first image."}
          </p>
          <p>
            {"And perhaps early testing taught you that there are some failure modes you had to watch out for. As an example, you might include in your prompt that, if the person in the first image has a beard, but the person in the second image doesn't have a beard, that the generated image should definitely not have a beard."}
          </p>
          <p>
            {'All these things sound reasonable, do they not? And here\'s the weird thing: the more stuff like that you include in the prompt, the worse it will work! Now, in this example, it might "work" insofar as it will be a picture of the person dressed as the other person, but it will look comically bad like one of those "face-in-hole" apps from 2010. Why?'}
          </p>
          <p>
            {'What\'s even stranger is that giving a very short and schematic prompt asking what you want, like "make the person in the second pic so they\'re dressed like the person in the first pic" might result in a much more pleasing and realistic image, even if you might need to generate it a couple times to get it just right. Again, why?'}
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== CONSTRAINT VISUALIZATION ========== */}
      <section data-section="viz-constraints">
        <EC>
          <div className="op-viz-container">
            <ConstraintViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== NARRATIVE PART 2 ========== */}
      <section data-section="part-2">
        <EC>
          <p>
            {"The answer is that these models are already trained so much to give good results out of the box. But they're also designed to be very helpful, attentive, and accommodating to every part of your request."}
          </p>
          <p>
            {'In fact, every single word in your prompt is "attended to" by the model and has an impact on the specific activation states that occur in its "brain."'}
          </p>
          <p>
            {"Because this activation weight space is so incomprehensibly vast, you'd be amazed at just how different those activations can be as a result of what might seem to be a minor change in the wording of a prompt."}
          </p>
          <p>
            {'Incidentally, this is why things like my "fresh eyes" code review prompt can be so shockingly effective if you\'re not used to that sort of thing: it\'s because they\'re tapping into some very deep thing in the model\'s brain that changes the way it operates, like toggling a create/critique mode gestalt switch.'}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== NARRATIVE PART 3 ========== */}
      <section data-section="part-3">
        <EC>
          <p>
            {"An analogy here is especially informative. Suppose you want to hire a famous and talented chef to prepare a special meal for your party. Great, surely it will be a wonderful meal, right?"}
          </p>
          <p>
            {"But then you start giving all these additional requests and tweaks to the chef: \"Martin has nut allergies. Oh and Lucy loves duck, be sure to include that. Oh, and our apple trees are ripe, wouldn't it be so great to use those, too.\" And on and on, you give more rules and requirements and constraints."}
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
                      <div
                        className={`h-full transition-all duration-700 ease-out ${chefMode === "trusting" ? "bg-emerald-500 w-full" : "bg-rose-500 w-[15%]"}`}
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
                      <div
                        className={`h-full transition-all duration-700 ease-out ${chefMode === "trusting" ? "bg-emerald-500 w-[95%]" : "bg-rose-500 w-[40%]"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md relative overflow-hidden min-h-[140px] flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    {chefMode === "trusting" ? <CheckCircle2 className="w-12 h-12 text-emerald-400" /> : <AlertTriangle className="w-12 h-12 text-rose-400" />}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">
                    {chefMode === "trusting"
                      ? "“I trust your expertise. We want a vegetable-forward summer experience. Surprise us.”"
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
            {"The chef wants to be helpful (assume you're paying them a lot), but every time you add another one of your rules, you are restricting and circumscribing what they can do. You are dramatically narrowing and constraining their search space and impeding their creative process, because now they keep bumping against your rules."}
          </p>
          <p>
            {"Instead of focusing on what they know best, which is creating incredible dishes and meal experiences, they are forced to waste their cognitive energy on dancing around these constraints."}
          </p>
          <p>
            {"If you foist enough of them on the chef, it becomes like those scenes in heist movies where they have all the laser beam motion detectors and you need to dance around them like some kind of ninja acrobat just to get through the other side. Now, if the chef is good enough, will you still end up with a pretty good meal for your guests? Sure, probably."}
          </p>
          <p>
            {'But will it be close to as good as it could have been if you let the chef make all the decisions themselves with maybe just some basic, high-level guidance (e.g., "less seafood, lots of veggies")? Almost certainly not.'}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== QUALITY CURVE VISUALIZATION ========== */}
      <section data-section="viz-quality">
        <EC>
          <div className="op-viz-container">
            <QualityCurveViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== NARRATIVE PART 4 ========== */}
      <section data-section="part-4">
        <EC>
          <p>
            {'The chef is the model, and you are the annoying party planner. Every time you try to tell the model exactly what to do and how, just understand that, although you might end up with something that on the surface conforms with all your requirements, it will be the equivalent of that "face-in-hole" photo that "technically" looks like the person but also looks 2-dimensional and like a bad Photoshop attempt: no artistry, and not likely to fool anyone about it being natural or real.'}
          </p>
          <p>
            {"This applies just as much to using these models to generate code. The more you tell them what to do and how, the worse the results will be. That's why you should try to focus your prompting on your goals, the purpose of the project, the desired end state, the features and functionality you'd like to have (but not in such extreme specificity: again focus on the purpose of the feature, the intent of it, what it's supposed to help the user do, etc.)."}
          </p>
          <p>
            {"The models are now smart enough that, once they understand the high-level goals, they can do a better job planning than you can, at least if the goal is to get a plan that other models/agents are going to implement."}
          </p>
          <p>
            {"Note that what I'm saying here really applies more to the planning stages. Once you have a plan, you can make it quite elaborate in an iterative way, and I usually do."}
          </p>
          <p>
            {"And then I turn those plans into extremely detailed beads (epics, tasks, subtasks, etc) so that the agents that are actually implementing the stuff don't need to understand the big picture and can focus instead on their narrow task, much like a short-order cook in a diner can focus on the ticket in front of them and just make a good pastrami sandwich without worrying about how to bake a pie or whether the people at table 3 have been waiting too long for a water refill."}
          </p>
          <p>
            {"So, in short: when coming up with your plan, don't be too prescriptive to give the model flexibility so that you get the best possible plan. But once you've figured out what to do, you want to go in the opposite direction and get very detailed and specific so that you can turn the plan into such detailed marching orders that even a dumber agent could still probably implement them well (but of course, you don't use a dumb agent, you use a very smart agent that is super overpowered for the task so that they do a phenomenal job)."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PLAN/EXECUTE VISUALIZATION ========== */}
      <section data-section="viz-plan">
        <EC>
          <div className="op-viz-container">
            <PlanExecuteViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== NARRATIVE PART 5 ========== */}
      <section data-section="part-5" className="pb-10 md:pb-14">
        <EC>
          <p>
            {"If you squint, you will also see a connection to my other big advice for working with brownfield projects that already have a ton of code (and also my approach to porting)."}
          </p>
          <p>
            {"That advice is that you first need to transform the big existing codebase into a much shorter specification document that details just the interfaces and the behaviors, but none of the internal implementation details."}
          </p>
          <p>
            {"This lets you compress the important parts down into something that can easily fit within the model's context window, where it can think about everything all at once: the full totality of the project and what you're trying to do, without getting weighed down by all the minutiae (which wouldn't even fit in its context anyway, so that it would be forced to look through the equivalent of a very zoomed-in camera lens from far away, scanning just a tiny portion of the scene at a time)."}
          </p>
          <p>
            {"Although there are obvious differences here, the core concept is really analogous: that you want to get out of the way of the model as much as possible so it has more degrees of freedom to explore and solve your problem without having to waste its cognitive powers on dumb, irrelevant details. In the case of coming up with a plan, those would be like the details about all the ingredients you want to use."}
          </p>
          <p>
            {"In the case of a brownfield development project, those details are all the irrelevant internal implementation details of all of the code files."}
          </p>
          <p>
            {'And by the way, you can always wait until after the chef has come up with the plan and then say at the end "Oh, Martin has nut allergies so let\'s change that one thing." That might annoy the chef, but you\'ll still end up with a very good meal. Something to keep in mind.'}
          </p>
        </EC>
      </section>

    </div>
  );
}
