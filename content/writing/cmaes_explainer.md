---
title: "The Incredible Magic of CMA-ES"
date: "2025-02-25"
excerpt: "An interactive deep dive into the Covariance Matrix Adaptation Evolution Strategy."
category: "Algorithms"
author: "Jeffrey Emanuel"
source: "GitHub"
---

# My Favorite Black‑Box Optimizer: CMA‑ES

**by Jeffrey Emanuel**

![Illustration](cmaes_illustration.webp)

If you live anywhere near modern machine learning, “optimization” almost automatically means *gradients*. Adam, Adafactor, Lion, SGD with warm restarts—pick your favorite flavor, they’re all dancing to the same tune: move parameters downhill along a gradient you can compute cheaply.

But there’s a big category of problems where the gradient either doesn’t exist, is meaningless, or is so expensive to approximate that you might as well not bother. In that world—what people call *black‑box optimization*—my favorite tool by a wide margin is **CMA‑ES**, the Covariance Matrix Adaptation Evolution Strategy. ([CMA Evolution Strategy][1])

Roughly speaking, CMA‑ES does for nasty, opaque objective functions what gradient descent does for nice smooth ones: it gives you a principled way to turn “I can only evaluate this thing” into “I can reliably walk toward a good solution.”

This is an essay about why I like CMA‑ES so much, how it works at an intuitive level, where it came from, and why I think it’s still wildly underused in the neural‑net world.

---

## 1. What CMA‑ES Is (And Why You Should Care)

At the highest possible level, CMA‑ES does this:

> It keeps a *Gaussian search distribution* over your parameter space and iteratively morphs that Gaussian—its mean and its covariance—to concentrate probability mass where the objective looks good.

Concretely, suppose you have some unknown function

[
f:\mathbb{R}^n \to \mathbb{R}
]

that you want to *minimize*. You tell CMA‑ES:

* the dimension (n)
* an initial guess for the parameters (or just “center me in the middle of the search box”)
* an initial overall step scale

Then, repeatedly:

1. It samples a small *population* of candidate points from a multivariate normal

   [
   x_i \sim \mathcal{N}(m, \sigma^2 C)
   ]

   where:

   * (m) is the current mean (its “best guess” for a good point),
   * (\sigma) is a scalar step‑size,
   * (C) is a full covariance matrix encoding the current “shape” of promising directions. ([Wikipedia][2])

2. It evaluates your expensive black‑box (f(x_i)) at each point.

3. It ranks the samples by how good they were.

4. It nudges (m), (\sigma), and (C) so that the next Gaussian puts more probability mass where the good samples came from and less where the bad ones came from.

Over time, the initially spherical Gaussian turns into a rotated, stretched ellipsoid that lines up with the valleys and ridges of your objective function. It’s implicitly learning something like the local Hessian without ever seeing a derivative.

Here’s the mental picture you should have:

[![Эволюционная стратегия адаптации ковариационной матрицы — Covariance ...](https://tse3.mm.bing.net/th/id/OIP.yFUhyh8uKWpm88_W3shf6wHaE8?pid=Api)](https://www.mql5.com/ru/articles/18227?utm_source=chatgpt.com)

Early on, samples are spread out, the covariance is mostly spherical, and the algorithm is “groping in the dark.” As evidence accumulates about which directions lead to better values, the ellipsoid tilts, stretches, and shrinks, zooming in on promising regions.

The crucial thing is: **CMA‑ES only needs function evaluations.** It never asks you for gradients, Jacobians, or any structural information about your model or simulator. That makes it an excellent default whenever:

* evaluations are very expensive,
* the landscape is ugly (non‑convex, multi‑modal, ill‑conditioned), and
* you don’t trust your intuition enough to hard‑wire a better search strategy.

---

## 2. What It Means *Not* to Have a Gradient

When you first learn optimization, “no gradient” sounds like a minor annoyance. Just finite‑difference it, right? Wrong, at least in the kinds of problems I care about here.

“No gradient” in the real world usually looks like this:

* Each function evaluation is **hours** of simulation on a cluster.
* The mapping from parameters to outcome is full of discontinuities, multi‑scale effects, and numerical weirdness.
* Many of your knobs are discrete choices or weirdly constrained (integers, categories, brittle constraints).
* There is no hope of ever treating this as a smooth function and taking derivatives in any sensible way.

Let’s ground that in three concrete examples.

### 2.1 Designing an Airplane Wing

Imagine Boeing is designing a new wing. At the level we’re interested in, they might parameterize a wing by:

* overall aspect ratio,
* sweep angle,
* twist distribution,
* thickness‑to‑chord ratio,
* airfoil family index along the span,
* a few structural parameters, etc.

You end up with, say, 10–20 *design parameters*, all continuous but with hard bounds and weird interactions.

For any concrete choice of these parameters, the pipeline looks something like:

1. Generate geometry.
2. Meshing.
3. Full CFD simulation across multiple flight regimes.
4. Post‑process results to compute a scalar “score” that mixes lift‑to‑drag, stall characteristics, structural margins, noise, manufacturing constraints, and so on.

Each run might take **hours** on a serious machine.

There is no useful “gradient” of this pipeline in the mathematical sense. You *could* approximate derivatives by finite differences, but that would mean:

* for each candidate parameter vector,
* perturb each of the (n) dimensions,
* rerun the entire CFD pipeline (n) more times.

If (n = 15) and each simulation run is 3 hours, one gradient step is already days of compute. And because the pipeline includes discrete operations (meshing, turbulence model switching) and numerical noise, finite differences are mostly lies.

You absolutely cannot afford to do “naive” grid search either. A modest grid with 10 values per dimension and 10 dimensions is (10^{10}) simulations—ludicrous.

But you *can* afford something like a few thousand simulations, if each one moves you in an intelligently chosen direction. That’s the regime where CMA‑ES shines.

### 2.2 A Suspension Bridge and Finite Elements

Same story with a long suspension bridge.

You might parameterize the design by:

* main span length,
* tower geometry,
* cable sag and spacing,
* deck stiffness,
* a handful of material choices and safety factors.

Given a parameter vector, the workflow is:

1. Build a finite‑element model.
2. Solve huge linear or non‑linear systems under different load cases: dead load, live load, wind, earthquake, thermal expansion.
3. Check constraints on stresses, deflections, natural frequencies, buckling modes, fatigue, code compliance.
4. Combine it all into a scalar penalty or cost.

Again: expensive, somewhat noisy, with sharp changes when modes cross or constraints flip from satisfied to violated. Shannon would not call this a nice smooth (C^2) objective.

You want to “feel out” the design space, avoid catastrophic failures, and home in on a safe, economical design without blowing your simulation budget. CMA‑ES turns each new design evaluation into a small update of your belief about where the good region is.

### 2.3 Hyperparameters for Transformer Architectures

Now jump to a very different world: choosing hyperparameters for a Transformer.

Some knobs are continuous:

* learning rate / schedule parameters
* weight decay, dropout rate
* RMSNorm vs LayerNorm epsilons
* data mixing ratios in a multi‑task curriculum

Others are inherently discrete:

* number of layers,
* d_model, number of heads,
* choice of activation (GELU, SwiGLU, etc.),
* attention variant (standard, multi‑query, grouped‑query, etc.)

And the only way to “evaluate” a hyperparameter vector is:

1. Train the model (possibly for days on a TPU pod).
2. Measure some mixture of validation loss, downstream benchmarks, compute cost, maybe some qualitative judgments.

All the discrete choices are non‑differentiable by construction. Even the continuous knobs interact in ways that make the response surface bumpy and noisy. And full runs are so expensive that your *evaluation budget* is maybe a couple hundred points total, if that.

So again, no gradient worth the name. Just a small handful of very expensive samples in a ugly, mixed discrete‑continuous space.

---

## 3. CMA‑ES in Slow Motion: Designing a Wing in 3D

Let’s go back to the wing, but drastically simplify to keep things concrete. Suppose we compress all our design freedom into just three scalars:

1. (x_1): normalized aspect ratio in ([0,1])
2. (x_2): normalized sweep angle in ([0,1])
3. (x_3): normalized airfoil family index in ([0,1])

“Normalized” here just means we’ve mapped our physical ranges into ([0,1]):

* aspect ratio from 6 to 12 maps linearly to 0–1,
* sweep from 0° to 40° maps to 0–1,
* airfoil choice is categorical: say we have 5 discrete airfoil families; then we might map:

  * family 0 → (x_3 \in [0.0, 0.2))
  * family 1 → (x_3 \in [0.2, 0.4))
  * …
  * family 4 → (x_3 \in [0.8, 1.0])

For the simulator, we just *quantize* (x_3) into an integer bin and pick the corresponding airfoil.

Normalizing everything to roughly comparable ranges is important because CMA‑ES’s initial Gaussian is isotropic. If one variable naturally lives on a scale of 0.001 and another on 10, you’re already telling the algorithm that some directions are “long” and some “short” before it has seen any data. I like my ignorance to be symmetric.

Call our black‑box objective (f(x_1, x_2, x_3)). Lower is better.

### 3.1 The State of CMA‑ES

Internally, the algorithm carries a small state:

* (m \in \mathbb{R}^3): current mean—its best guess for a good design
* (\sigma > 0): overall step‑size (how far it’s willing to jump)
* (C \in \mathbb{R}^{3 \times 3}): symmetric, positive‑definite covariance matrix controlling the *shape* of its Gaussian
* two “evolution paths” (p_\sigma, p_c \in \mathbb{R}^3) that act like momentum terms for step‑size and covariance updates

We also choose:

* (\lambda): number of samples per “generation” (say 8)
* (\mu): number of *elite* samples we’ll actually use to update the mean (say 4), with weights (w_1 \ge \dots \ge w_\mu) that sum to 1. ([Wikipedia][3])

We might start with:

* (m^{(0)} = (0.5, 0.5, 0.5)) (the center of the box)
* (\sigma^{(0)} = 0.3) (so early samples roam widely)
* (C^{(0)} = I) (spherical Gaussian)
* (p_\sigma^{(0)} = p_c^{(0)} = 0)

### 3.2 One Generation in Detail

Now let’s zoom through a couple of generations.

#### Generation 1: Blind Exploration

1. **Sampling**

   We sample 8 candidate wings:

   [
   x_i^{(1)} \sim \mathcal{N}(m^{(0)}, (\sigma^{(0)})^2 C^{(0)}) = \mathcal{N}((0.5,0.5,0.5), 0.3^2 I)
   ]

   Some of these points will fall outside ([0,1]^3); a real implementation clips or reflects them at the boundaries, or works in an unbounded internal space and transforms back. This is one of those places where production CMA‑ES libraries have a lot of extra machinery.

2. **Decode & Evaluate**

   For each (x_i^{(1)}):

   * map the normalized parameters back to physical values,
   * quantize the airfoil index,
   * run the CFD pipeline,
   * compute a scalar score (f(x_i^{(1)})).

3. **Rank**

   Sort the 8 samples by their objective values:

   [
   f(x_{1:\lambda}^{(1)}) \le f(x_{2:\lambda}^{(1)}) \le \dots \le f(x_{\lambda:\lambda}^{(1)})
   ]

4. **Update the Mean**

   Compute the new mean as a weighted average of the top (\mu = 4) wings:

   [
   m^{(1)} = \sum_{i=1}^{4} w_i x_{i:\lambda}^{(1)}
   ]

   Intuitively: we move the center of our Gaussian toward the best designs we’ve seen, with more weight on the very best.

5. **Update the Evolution Paths**

   * The *step* we just took in mean space is (\Delta m = m^{(1)} - m^{(0)}).
   * We transform that step into the coordinate system where (C^{(0)}) is “unskewed” and feed it into (p_\sigma); if we keep moving in similar directions, (p_\sigma) accumulates length.
   * We also feed the raw step into (p_c), which tracks a kind of smoothed trajectory of the mean in the original coordinates.

   These paths are used to decide:

   * whether steps are consistently going in one direction (increase step‑size),
   * or are meandering (decrease step‑size),
   * and in which directions the covariance should be stretched.

6. **Update Covariance (C)**

   This is the “covariance matrix adaptation” part. Two ingredients:

   * A **rank‑1 update** using the evolution path (p_c), which says “elongate the ellipsoid along the direction we’ve been consistently moving.”
   * A **rank‑µ update** using the deviations of the top (\mu) samples from the old mean, ((x_{i:\lambda}^{(1)} - m^{(0)})), which says “align the ellipsoid with the cloud of good solutions, with more weight on better ones.” ([Wikipedia][3])

   The exact formulas are a bit intricate, but conceptually this is just a weighted covariance estimate of “good steps” plus some exponential smoothing.

7. **Update Step‑Size (\sigma)**

   Compare the length of the normalized path (p_\sigma) to what you’d expect from a random walk under the current covariance. If the path is longer than expected, we’re consistently going somewhere → increase (\sigma). If it’s shorter, we’re thrashing → decrease (\sigma). ([Wikipedia][3])

After this first generation, nothing magical has happened yet. We used 8 painful CFD runs to move the mean a bit and nudge the covariance and step‑size.

#### Generation 5: Learning the Geometry

Fast forward a few generations.

What tends to happen:

* The mean has moved into a region of the cube where designs are decent.
* The covariance (C) is no longer the identity; its eigenvectors roughly align with directions in which the objective varies gently vs sharply.
* The step‑size (\sigma) has shrunk compared to its initial value.

In the wing case, you might find that:

* Changing aspect ratio and sweep together along some diagonal direction barely changes performance,
* but moving orthogonally to that diagonal (say, high aspect ratio + low sweep) is catastrophic.

CMA‑ES captures that by turning the sampling ellipsoid into a rotated cigar aligned with the benign direction, and skinny along the dangerous direction.

In other words, it’s approximating the *local curvature* of your objective, but:

* without ever forming a Hessian,
* and without relying on gradients.

#### Generation 15: Local Refinement

As you keep going:

* (\sigma) keeps shrinking,
* (C) stabilizes in a shape that hugs what looks locally like a valley,
* the sampled designs start becoming minor variations on a theme.

At some point, progress stalls or your evaluation budget runs out, and you take the current best design as your answer. If you want more global exploration, you can restart CMA‑ES with a larger population size or a different initial mean; many practical implementations do exactly that. ([arXiv][4])

### 3.3 Mapping Arbitrary Parameters into ([0,1])

The wing toy example also highlights a trick I really like with CMA‑ES:

> Encode *everything* as continuous real numbers in a normalized box, and push all the weirdness into your encode/decode procedure.

* Continuous bounded parameters → map linearly (or log‑linearly) into ([0,1]).
* Unbounded parameters → apply a squashing transform (tanh, logistic).
* Integers → round or floor a normalized real.
* Categories → carve up the unit interval into disjoint sub‑intervals and pick the category by which interval the normalized value falls into.

From CMA‑ES’s perspective, it’s always just optimizing a vector in (\mathbb{R}^n). You can make the decode procedure as baroque as you want; the algorithm doesn’t care.

Is that “mathematically clean”? No. You’re introducing discontinuities when you quantize categories, and the underlying objective becomes non‑smooth in those directions. But CMA‑ES doesn’t assume smoothness; it just needs that “good regions” occupy non‑zero volume so that a Gaussian can overlap them.

### 3.4 Real Implementations Are Much Fancier

What I’ve described here is the core algorithm you can squeeze into a couple dozen lines of math or pseudocode. Real CMA‑ES libraries (like Hansen’s reference Python implementation) have a *lot* more bells and whistles: ([CMA Evolution Strategy][1])

* restarts with increasing population size (for global search),
* mechanisms for noisy objectives,
* constraint handling and boundary repair,
* “active” covariance updates that also use bad points to *decrease* variance along harmful directions,
* diagonal / low‑rank variants (sep‑CMA, LM‑CMA) that reduce the (O(n^2)) memory and (O(n^3)) time costs of full covariance updates, making it usable in hundreds‑dimensional spaces. ([CMA Evolution Strategy][1])

But the basic picture—Gaussian search distribution that learns its own mean and covariance from samples—remains the same.

---

## 4. Where CMA‑ES Came From (and Why It Feels Almost “Optimal” Under Ignorance)

CMA‑ES didn’t appear out of nowhere. It’s the product of several converging lines of thought.

### 4.1 From Genetic Algorithms to Evolution Strategies to CMA‑ES

Classical **genetic algorithms** (Holland, Goldberg, etc.) worked with bitstrings and used crossover and mutation on those bitstrings. They were inspired by biological genetics: chromosomes, recombination, mutation, selection.

In parallel, the **evolution strategies** community in Germany focused more on:

* continuous search spaces,
* Gaussian mutations,
* small populations,
* and self‑adaptation of strategy parameters like step‑sizes.

Instead of bitstrings and crossover, ES emphasized:

* “mutate a parent by adding Gaussian noise,”
* keep the best offspring,
* adapt the noise parameters based on success.

CMA‑ES, introduced by Hansen & Ostermeier in the mid‑1990s, is a specific evolution strategy that pushes this to its logical conclusion: instead of adapting a single scalar step‑size or diagonal variances, adapt a *full covariance matrix* of the Gaussian mutation distribution. ([CMA Evolution Strategy][1])

In modern terms, CMA‑ES is an **estimation‑of‑distribution algorithm** (EDA): it maintains an explicit probabilistic model over candidate solutions (a multivariate normal) and updates that model using samples and their fitnesses. ([Wikipedia][5])

It’s also closely related to the **cross‑entropy method** for optimization, where you iteratively fit a parametric distribution to elite samples by minimizing KL divergence. ([Wikipedia][6])

So if you like to draw family trees:

* GAs / ES → EDAs / cross‑entropy method → CMA‑ES as a particularly carefully engineered Gaussian EDA.

### 4.2 Information Geometry and Natural Gradients

One of the reasons I think CMA‑ES is “about as good as you can do” in a domain‑agnostic black‑box setting is that, after the fact, people discovered a very clean **information‑geometric** interpretation.

If you think of CMA‑ES not as “moving points in parameter space” but as “moving a distribution in the manifold of Gaussians,” then the question becomes:

> How should we update the parameters ((m, C)) of our Gaussian to increase the *expected* fitness under that distribution, in a way that doesn’t depend on arbitrary choices of coordinate system?

The right answer in that setting is the **natural gradient**: perform steepest ascent with respect to the Fisher information metric on the manifold of probability distributions. ([Wikipedia][7])

Akimoto et al. showed that the core CMA‑ES update (ignoring a few bells and whistles) is exactly a *sampled natural‑gradient step* on the manifold of multivariate normals, aiming to maximize the expected fitness ( \mathbb{E}_{x \sim \mathcal{N}(m,C)}[-f(x)]). ([arXiv][8])

That’s a strong statement:

* CMA‑ES isn’t just some clever heuristic;
* it’s performing the canonical invariant gradient update in distribution space, subject to the restriction “my search distribution is Gaussian.”

Related work on **Natural Evolution Strategies** (NES) makes the same point more broadly: if you parametrize a search distribution and optimize expected fitness with natural gradients, you get algorithms that look a lot like CMA‑ES and its cousins. ([Journal of Machine Learning Research][9])

So in the “I know nothing except that I want to search with a unimodal Gaussian” world, there’s a meaningful sense in which CMA‑ES is *the* principled update rule.

### 4.3 Kriging, Gaussian Processes, and “Best Unbiased” Thinking

There’s another intellectual thread that rhymes with CMA‑ES: **Kriging**, i.e., Gaussian‑process regression in geostatistics. Kriging is all about constructing the **best linear unbiased predictor** of a field (say, ore concentration in a mine) given a handful of noisy samples and an assumed covariance structure. ([Wikipedia][10])

Both Kriging and CMA‑ES:

* treat uncertainty via Gaussian models,
* use covariance structures as the key object to tune,
* and lean heavily on “unbiased + minimal variance” criteria.

The details differ:

* Kriging is modeling the *unknown function* with a Gaussian process and using Bayesian updates to predict unobserved points;
* CMA‑ES is using a Gaussian as a **proposal distribution** and updating it to sample more points with low objective values.

But philosophically they share a “Gaussian + covariance + unbiasedness” mindset. In a black‑box setting where you refuse to assume anything besides “the world is continuous-ish” and “I can afford a certain number of evaluations,” that mindset has a lot going for it.

Put slightly more speculatively:

> If you want to minimize your *worst‑case regret* under near‑total ignorance about the objective’s geometry, starting with an isotropic Gaussian (maximum entropy given a finite second moment) and then nudging its mean and covariance via natural‑gradient steps is about as clean and assumption‑free as it gets.

You can always do better with problem‑specific structure, but then you’re leaving the black‑box regime.

---

## 5. Two Optimization Worlds That Barely Talk

One of the weird sociological facts about CMA‑ES is that it lives, culturally, in a different universe from most deep‑learning folks.

* On one side, you have the **evolutionary computation / black‑box optimization** community, with conferences like **GECCO** (Genetic and Evolutionary Computation Conference), which has been running since 1999 under ACM SIGEVO and is basically the flagship venue for evolutionary algorithms, EDAs, and so on. ([Wikipedia][11])

* On the other side, you have **NeurIPS / ICML / ICLR**, where almost everyone thinks in terms of backprop, SGD variants, and differentiable everything.

If you go to GECCO, people talk about CMA‑ES, EDAs, Kriging, cross‑entropy, and surrogate models as if that *is* optimization. They have their own vocabularies, benchmarks, and mental models. Black‑box optimization of simulators, robotic controllers, combinatorial monsters—that’s the daily bread.

If you go to NeurIPS, people mostly don’t know CMA‑ES exists, unless they’ve touched evolutionary RL or weird architecture search. They know Bayesian optimization, Hyperband, maybe some NES‑style work, but the evolutionary computation world feels like a different discipline.

As a result, the two communities sometimes re‑invent each other’s ideas with different names. There’s an interesting overlap, for example, between how CMA‑ES thinks about learning a distribution over good solutions and how LeCun’s **Joint‑Embedding Predictive Architectures (JEPA / I‑JEPA)** think about predicting missing parts of an image in a representation space. ([arXiv][12])

They’re obviously not the same thing, but they share:

* a focus on **distributions over latent representations**,
* learning from partial information,
* and using geometric structure (covariance / metric) to drive updates.

When I pointed out some of these resonances on Twitter in the context of CMA‑ES and LeCun‑style JEPA models (linking your tweet here: [https://x.com/doodlestein/status/1988891504291500208](https://x.com/doodlestein/status/1988891504291500208)), the reactions were very “two ships passing in the night finally notice each other.”

This siloing is mostly historical accident and social network effects; there’s nothing fundamental about it. But it means that a lot of deep‑learning practitioners never build the reflex:

> “Oh, this is an expensive black‑box. Let me just throw CMA‑ES at it.”

And that’s a shame.

---

## 6. CMA‑ES + Deep Learning + Weird Creative Systems

The irony is that CMA‑ES and its cousins are incredibly natural companions to modern DL systems once you stop insisting that *everything* be end‑to‑end differentiable.

### 6.1 Hyperparameters, Architectures, and Training Recipes

Back to the Transformer example:

* You can build a vector of hyperparameters that includes continuous knobs (learning rates, weight decay) and discrete ones (layers, heads, activation types), encode them into a normalized real vector as discussed earlier, and let CMA‑ES loose.
* The objective is whatever scalar you care about: validation loss at a fixed budget, a weighted combination of benchmark scores, maybe some proxy for training stability.

You don’t need to model the response surface explicitly, as in Bayesian optimization. CMA‑ES just uses evaluations directly to nudge its search distribution. Compared to naive random search or grid search, it’s aggressively *sample‑efficient* in low to moderate dimensions, because it learns anisotropy: some directions in hyperparameter space matter more, and the covariance matrix picks that up.

You’re still fundamentally bounded by how many full training runs you can afford, of course. But CMA‑ES squeezes more information out of each run than most of the “point sampling” methods I see in practice.

### 6.2 Tuning Continuous Cellular Automata

A more fun, personal example: designing continuous cellular automata with interesting visual dynamics.

Say you’ve got a differentiable CA where each cell update depends on some continuous parameters:

* kernel weights / radii,
* nonlinearity parameters,
* diffusion / reaction rates,
* maybe parameters governing how colors mix.

You run the CA forward from random or seeded initial conditions and want to score the resulting spatio‑temporal pattern along dimensions like:

* visual complexity (entropy of local patterns),
* persistence vs chaos,
* presence of coherent structures,
* maybe some learned notion of “aesthetic interest.”

You roll all of that into a single scalar fitness function. There are no gradients that reliably connect these high‑level aesthetic properties back to the underlying parameters; the loss landscape is a scorched, crumpled mess.

But you can absolutely:

1. Map all your CA parameters into a normalized vector (x \in [0,1]^n).
2. Define a deterministic (or stochastic, but fixed‑seed) evaluation pipeline that runs the CA and returns a fitness score.
3. Let CMA‑ES search over (x).

The algorithm doesn’t understand “visual interest.” It just knows that some parameter vectors yield higher scores, and it deforms its Gaussian so that it samples more of those. After a few hundred or thousand evaluations, you often end up with parameter settings that produce dynamics you’d never have guessed by hand‑tuning.

In that sense, CMA‑ES becomes a kind of **automated experimental collaborator**: you write the simulator and the scoring function; it does the boring part of exploring the parameter space for you.

### 6.3 Other Hybrids

Once you start thinking this way, CMA‑ES shows up everywhere:

* Fine‑tuning controllers in reinforcement learning where policy gradients are too noisy or fragile.
* Searching over data‑augmentation strategies, curriculum schedules, or optimizer hyperparameters.
* Optimizing prompts or tool‑use parameters for LLM systems where the effective objective is extremely non‑smooth.
* Designing architectures for small‑to‑medium networks where the number of structural decisions is manageable.

There are, of course, limits:

* Full CMA‑ES is (O(n^2)) in memory and roughly (O(n^2))–(O(n^3)) in time per iteration for the covariance updates and eigen decompositions, which makes it dubious for millions of parameters. ([ResearchGate][13])
* Large‑scale variants (separable CMA‑ES, low‑rank or limited‑memory CMA‑ES) mitigate some of this and have been used successfully with high‑dimensional controllers. ([CMA Evolution Strategy][1])

But in the sweet spot—tens to a few hundreds of dimensions, expensive evaluations, ugly landscape—CMA‑ES is hard to beat as a “good default.”

---

## 7. Why I Love It

If I had to summarize why CMA‑ES has become my go‑to mental model of black‑box optimization, it would be:

* It is **conceptually simple**: keep a Gaussian, sample, rank, update mean + covariance + step‑size.
* It is **mathematically grounded**: from an information‑geometric / natural‑gradient perspective, it’s doing the right thing in distribution space. ([arXiv][8])
* It is **practically robust**: people have hammered on it for decades on nasty benchmarks and real engineering problems, and it holds up astonishingly well. ([arXiv][4])
* It is **agnostic**: it doesn’t care whether your objective comes from CFD, finite elements, Transformer training runs, or cellular automata.
* It plays **nicely with human intuition**: the evolving ellipsoid picture is easy to visualize, and the covariance really does encode something like “what the algorithm has learned about the geometry of your problem.”

In a gradient‑rich world, CMA‑ES is my favorite algorithm for all the places gradients don’t reach—those messy, high‑stakes, simulator‑in‑the‑loop problems where each evaluation is precious and you can’t afford to waste them on a clumsy search.

Whenever I find myself staring at a black‑box with a small evaluation budget and no obvious structure to exploit, my reflex is now:

> Normalize the parameters, write the fitness function, and let CMA‑ES do its thing.

## Two High‑Performance CMA‑ES Implementations I Built (Browser + Python)

Talking about CMA‑ES in the abstract is fun, but at some point you want to actually *use* it. I got annoyed enough at the state of “practical, fast, but still pleasant to use” CMA‑ES implementations that I ended up writing two of my own in Rust:

* one that targets WebAssembly and runs directly in the browser with a nice interactive playground, and
* one that ships as a polished Python package backed by a hyper‑optimized Rust core.

They share the same basic philosophy—“make the black‑box optimizer the boring, fast, reliable piece you never think about”—but they’re aimed at two very different settings.

---

### CMA‑ES in the Browser: `wasm_cmaes`

Repo: [https://github.com/Dicklesworthstone/wasm_cmaes](https://github.com/Dicklesworthstone/wasm_cmaes) ([GitHub][1])
Live demo: [https://dicklesworthstone.github.io/wasm_cmaes/examples/viz-benchmarks.html](https://dicklesworthstone.github.io/wasm_cmaes/examples/viz-benchmarks.html) ([GitHub][1])

At a high level, this project is:

> Rust CMA‑ES compiled to WebAssembly, wrapped in a clean JS/TS API, plus a D3/Tailwind visual playground and a vanilla‑JS baseline for speed comparison. ([GitHub][1])

So you can:

* drop a serious CMA‑ES engine into any browser‑based tool (dashboards, teaching demos, in‑browser model tuning, etc.), and
* visually watch it chew through classic test functions and compare it to a “naive” μ+λ ES written in plain JavaScript. ([GitHub][1])

#### Architecture in one paragraph

The architecture is roughly:

* JS/TS calls into a wasm_bindgen layer
* which talks to Rust “engines” (full covariance, separable/diagonal, limited‑memory)
* which use a deterministic linear congruential generator plus SIMD-accelerated vector ops, with optional Rayon parallelism inside the WASM module. ([GitHub][1])

There’s also JSON‑style state (serialize/deserialize) via `serde_wasm_bindgen`, so you can save/restore optimizer state across page loads or ship it over the wire. ([GitHub][1])

#### Bundles and how they map to your use case

You get two prebuilt bundles: ([GitHub][1])

* `pkg/` → `cmaes_wasm` — sequential, no Rayon, works everywhere.
* `pkg-par/` → `cmaes_wasm-par` — built with SIMD (`+simd128`) and Rayon for parallel candidate evaluations, designed for environments where WebAssembly threads are allowed.

They’re structured to be eventually publishable as two separate npm packages, avoiding name collisions (`cmaes_wasm` vs `cmaes_wasm-par`). ([GitHub][1])

#### Minimal JS usage

The smallest reasonable way to use this from JS looks like:

```js
import init, { fmin } from "./pkg/cmaes_wasm.js";

await init();

const res = fmin(
  new Float64Array([3, -2]),
  0.8,
  x => x[0]*x[0] + x[1]*x[1]
);

console.log(res.best_f, res.best_x());
```

This matches the README “minimal use in JS” example: you pass an initial mean `x0`, an initial step size `sigma`, and a callback that evaluates your objective; you get back a result object with the best function value and its argmin. ([GitHub][1])

If you don’t care about bundlers at all and just want the playground:

```bash
git clone https://github.com/Dicklesworthstone/wasm_cmaes
cd wasm_cmaes
python -m http.server 8000
# open http://localhost:8000/examples/viz-benchmarks.html
```

That’s enough to get the full D3/Tailwind dashboard running locally. ([GitHub][1])

#### The interactive playground

The `viz-benchmarks.html` page is the fun part. It’s a D3 + Tailwind dashboard that lets you: ([GitHub][1])

* choose among a whole zoo of benchmark functions: Sphere, Rastrigin, Ackley, Griewank, Schwefel, Levy, Zakharov, Alpine N1, Bukin N.6, etc.
* tweak CMA‑ES hyperparameters live—population size λ, initial σ, random seed, iteration count—and watch how the optimizer behaves.
* see both a log‑loss curve and a scatter‑plot of samples, so your geometric intuition has something to latch onto.
* compare against a headless vanilla‑JS μ+λ ES baseline to get a visceral sense of “how much more work the adaptive covariance is doing for you.”

There are also stripped‑down demo pages:

* `examples/simple-sequential.html` — minimal sphere optimization using `pkg/`.
* `examples/simple-parallel.html` — Rosenbrock with the parallel bundle. ([GitHub][1])

So if you want to e.g. teach graduate students what CMA‑ES is “really doing” in parameter space, this gives you ready‑made, hackable visualizations.

#### Building and proper parallelism

If you want to rebuild the bundles yourself:

```bash
scripts/build-all.sh
```

That script cleans the `pkg/` and `pkg-par/` directories, builds the parallel version first (with SIMD), renames its `package.json`, then builds the sequential one. There are env knobs like `TOOLCHAIN`, `WASM_PACK`, and `RUSTFLAGS_PAR` for customizing how things build. ([GitHub][1])

True browser‑level parallelism via WebAssembly threads looks like:

```bash
export RUSTFLAGS="-C target-feature=+atomics,+bulk-memory,+mutable-globals,+simd128"
wasm-pack build --target bundler --features parallel --out-dir pkg-par
# JS side:
# await initThreadPool(n);  // from wasm-bindgen-rayon
```

Without atomics and a proper thread pool, Rayon will silently fall back to single‑threaded, so these flags are doing real work. ([GitHub][1])

#### Deployment and performance choices

There’s a one‑shot Pages deployment script:

```bash
scripts/deploy.sh "chore: deploy"
```

It builds everything, stages, commits if needed, pushes to `main`, and enables GitHub Pages if you have the `gh` CLI around. The public URL is:

* [https://dicklesworthstone.github.io/wasm_cmaes/](https://dicklesworthstone.github.io/wasm_cmaes/) ([GitHub][1])

On the performance side, the project leans pretty hard into:

* SIMD (`+simd128`) where wasm32 supports it, with scalar fallback.
* Optional Rayon for batched evaluation of fitness values.
* A deterministic LCG RNG with a seed, so you can reliably reproduce runs and make test/benchmark results meaningful.
* A batch API that intentionally minimizes JS↔WASM boundary crossings, since the boundary itself is expensive. ([GitHub][1])

The overall feel is “real optimization engine that just happens to live inside your browser tab.”

---

### CMA‑ES for Python: `fast_cmaes` / `fastcma`

Repo: [https://github.com/Dicklesworthstone/fast_cmaes](https://github.com/Dicklesworthstone/fast_cmaes) ([GitHub][2])
PyPI package: `fast-cmaes` (imported as `fastcma`). ([GitHub][2])

This one is aimed squarely at the “I live in Python but I care about performance and ergonomics” crowd. Under the hood it’s a Rust core with SIMD + Rayon and a proper ask/tell loop; on top it presents a clean, batteries‑included Python API.

The tagline from the README is accurate:

> Hyper‑optimized CMA‑ES in Rust with a first‑class Python experience. SIMD, rayon, deterministic seeds, vectorized objectives, restarts, constraints, and a Rich‑powered TUI — all while keeping the Rust core available for native use. ([GitHub][2])

#### Architecture in one glance

There’s a nice little Mermaid diagram in the README, but the rough structure is: ([GitHub][2])

* **Python API layer**: `fmin`, `fmin_vec`, `fmin_constrained`, a `CMAES` class, and a naive pure‑Python CMA‑ES baseline.
* **Rust core**: an ask/tell CMA‑ES implementation with full/diagonal covariance updates, σ adaptation, SIMD‑accelerated dot products, Rayon parallel evaluation, and deterministic seeding.
* **Tests & demos**: benchmarks on sphere, Rosenbrock, Rastrigin, Ackley, Schwefel, Griewank; Rich‑based TUI; Python smoke tests.

The idea is: you get something that feels like `scipy.optimize.minimize` but with a modern CMA‑ES under the hood and the ability to push performance as far as you care to.

#### Installation

If you just want to use it from Python and don’t care about building from source:

```bash
python -m pip install fast-cmaes
```

That installs the `fastcma` module and prebuilt wheels for Linux/macOS/Windows, Python 3.9–3.12. ([GitHub][2])

If you *do* want to develop against it locally:

```bash
python -m pip install maturin
maturin develop --release
```

And there are some optional feature flags you can turn on when building:

```bash
maturin develop --release --features numpy_support
maturin develop --release --features eigen_lapack
```

* `numpy_support` gives fast paths for NumPy arrays in vectorized objectives.
* `eigen_lapack` switches the eigen backend to LAPACK for the covariance eigendecompositions. ([GitHub][2])

For the Rich‑based TUI demo extras:

```bash
python -m pip install .[demo]
```

That pulls in `rich` and friends. ([GitHub][2])

#### Basic Python usage

The canonical “hello world” is just:

```python
from fastcma import fmin
from fastcma_baseline import benchmark_sphere

def sphere(x):
    return sum(v*v for v in x)

xmin, es = fmin(
    sphere,
    [0.5, -0.2, 0.8],
    sigma=0.3,
    maxfevals=4000,
    ftarget=1e-12,
)

print("xmin", xmin)
print(benchmark_sphere(dim=20, iters=120))
```

`fmin` handles the whole CMA‑ES lifecycle: initialization, repeated ask/tell updates, stopping on `maxfevals` or `ftarget`, and returning both the best point `xmin` and a state object with diagnostics. ([GitHub][2])

The `fastcma_baseline` module provides a naive pure‑Python CMA‑ES (`naive_cma.py`) and helpers like `benchmark_sphere` so you can directly see the speedup from the Rust core. ([GitHub][2])

#### Vectorized objectives and constraints

Because evaluating candidates is usually where all the time goes, there’s explicit support for vectorized objectives:

```python
from fastcma import fmin_vec

def sphere_vec(X):
    return [sum(v*v for v in x) for x in X]

xmin, es = fmin_vec(
    sphere_vec,
    [0.4, -0.1, 0.3],
    sigma=0.25,
    maxfevals=3000,
)
```

Here `X` is a batch of candidates; you return a list (or array) of scalar fitness values. Internally, CMA‑ES is already sampling a batch each generation, so this lines up nicely with frameworks that can evaluate many points in parallel (NumPy, JAX, PyTorch, etc.). ([GitHub][2])

There’s also a convenience API for simple box constraints:

```python
from fastcma import fmin_constrained

def sphere(x): return sum(v*v for v in x)

constraints = {
    "lower_bounds": [-1, -1, -1],
    "upper_bounds": [ 1,  1,  1],
}

xmin, es = fmin_constrained(
    sphere,
    [0.5, 0.5, 0.5],
    0.3,
    constraints,
)
```

That takes care of clamping / transforming samples into the hyper‑rectangle you specify, so you can stay in “just give me a loss” mode. ([GitHub][2])

#### Using the Rust core directly

If you’re writing Rust and want the CMA‑ES engine without any Python at all, you can use the library directly:

```rust
use fastcma::{optimize_rust, CovarianceModeKind};

let (xmin, _state) = optimize_rust(
    vec![0.5, -0.2, 0.8],
    0.3,
    None,
    Some(4000),
    Some(1e-12),
    CovarianceModeKind::Full,
    |x| x.iter().map(|v| v*v).sum()
);

println!("xmin = {:?}", xmin);
```

That gives you a clean, Rust‑native entry point equivalent to the Python `fmin`. ([GitHub][2])

#### TUI and demos

One of the nicer touches is a Rich‑powered text UI that streams CMA‑ES progress in your terminal:

* `examples/python_quickstart.py` — minimal sphere + vectorized demo.
* `examples/python_benchmarks.py` — Rust vs naive Python on sphere (and naive on Rastrigin).
* `examples/rich_tui_demo.py` — live TUI plotting best fitness, sigma, and eval counts while minimizing Rosenbrock. ([GitHub][2])

There’s a one‑shot helper:

```bash
./scripts/setup_and_demo.sh
```

which:

1. ensures nightly Rust (via `rust-toolchain.toml`),
2. creates a `uv` virtualenv on Python 3.13,
3. installs `maturin` + demo extras,
4. builds the extension, and
5. launches the Rich TUI demo. ([GitHub][2])

If you prefer to do it by hand:

```bash
uv venv --python 3.13
uv pip install .[demo]
uv run python examples/rich_tui_demo.py
```

That workflow makes it easy to show CMA‑ES behavior live in a talk or just poke at its convergence dynamics from the terminal. ([GitHub][2])

#### Performance tuning and feature flags

On the Rust side, the implementation leans on: ([GitHub][2])

* SIMD for dot products (via `portable_simd`).
* Rayon for parallel ask/tell evaluations.
* Lazy eigensystem updates, so you’re not recomputing eigen decompositions every generation.
* A diagonal covariance option for higher‑dimensional or very tight runtime budgets.
* Deterministic RNG with seeded runs so that tests and benchmarks are stable.
* Restart helpers (`test_utils::run_with_restarts`) to escape local minima without having to crank budgets to infinity.

These behaviors are controlled by feature flags:

* `numpy_support` — vectorized NumPy fast paths.
* `eigen_lapack` — LAPACK backend for eigen.
* `test_utils` — exposes deterministic helpers externally.
* `demo` — pulls in `rich` and demo dependencies. ([GitHub][2])

Testing is equally split: `cargo test` for the Rust core, `pytest tests/python_smoke.py` for the Python layer, and CI builds wheels on nightly Rust, runs smoke tests, and can publish to PyPI when you provide a `PYPI_API_TOKEN`. ([GitHub][2])

---

Between these two projects you basically get a continuum:

* **In‑browser, visual, “toy and teaching”** (but still fast) via `wasm_cmaes`, and
* **Serious offline work in Python** (hyper‑param tuning, black‑box experiments, research code) via `fast-cmaes` / `fastcma`.

Both share the same underlying philosophy of CMA‑ES as a generic, gradient‑free workhorse: you define a fitness function, decide your budget, and let the algorithm crawl its way through the space while adapting its own notion of “where the promising valleys live.” These implementations are my attempt to make that as practical and pleasant as possible in the two environments that matter most in 2025: the browser and the Python ecosystem.

---

Technical Addendum (based on talk slides given by Nikolaus Hansen, the creator of CMA-ES (way back in 1996!) link: https://inria.hal.science/hal-04709819v1/file/CMATutorialPPSN2024.pdf

### Technical Addendum: What’s Really Going On Inside CMA‑ES

This is the “OK, but show me the real math and design principles” section. I’ll assume you’re comfortable with multivariate Gaussians, eigenvalues, and basic optimization (the level of “I did a math undergrad 15 years ago and still sort of remember it”).

Most of what follows is distilled from Hansen & Auger’s long CMA‑ES tutorial slide deck from PPSN/GECCO‑style venues.  I’ll reference a few specific figures by page so you can cross‑check.

---

## 1. The search distribution as the central object

The tutorial leans hard into a very clean abstraction:

> You’re not really optimizing (f(x)) directly; you’re optimizing **a probability distribution over (x)**.

Concretely, CMA‑ES maintains a multivariate normal

[
x \sim \mathcal{N}(m, \sigma^2 C)
]

with three sets of parameters:

* **(m \in \mathbb{R}^n)** – the mean: current “favorite” solution.
* **(\sigma > 0)** – scalar step size: global exploration scale.
* **(C \in \mathbb{R}^{n\times n})** – symmetric positive‑definite covariance: shape/orientation of the search ellipsoid.

The key trick is that **all adaptation happens in this distribution space**, not directly in parameter space. That viewpoint is made explicit on the early “Evolution Strategies” slides where they write the generic template:

> sample from (P(x\mid\theta)), evaluate, update (\theta). (Slides ~15–25)

For CMA‑ES, (\theta = (m,\sigma,C)) and (P) is Gaussian.

Why Gaussian? They give four reasons on the “Why normal distributions?” slide (page 26):

1. Stable under addition.
2. Maximum entropy for a given variance (least additional assumptions about (f)).
3. Rotationally invariant in the isotropic case.
4. Easy to work with analytically and numerically.

That “maximum entropy with finite variance” point is important: if all you’re willing to assume is a location and a covariance scale, you don’t want to sneak in extra structure via some funky distribution; the Gaussian is the least committal choice consistent with that information.

---

## 2. Geometry in high dimensions: why isotropic Gaussians are “honest”

The deck has a nice reminder about **what a multivariate normal *feels* like in high dimensions** (pages 29–30):

* If (z \sim \mathcal{N}(0, I_n)), then (|z|) concentrates sharply around (\sqrt{n-1}).
* Differences of independent normals scale as (\sqrt{2}) times that.

So a draw from an isotropic Gaussian in (\mathbb{R}^n) is almost always sitting in a thin spherical shell of radius (\approx \sqrt{n}).

Intuitively, that means:

* An initial isotropic Gaussian is a very **unbiased prior**: no direction is special; all directions have the same marginal behavior.
* In high dimensions, you don’t “fill” the ball—you’re sampling on a shell. So how you move/reshape that shell matters a lot.

CMA‑ES starts in this maximally symmetric situation and then **injects all structure via learned covariance**, not via hand‑designed anisotropy.

---

## 3. Invariance as a design principle, not a side effect

There’s a whole mini‑philosophy section on **invariance** (pages 33–37, 35–36, 93):

* **Rank‑based invariance**: CMA‑ES uses only the **ordering** of (f(x_i)), never their absolute values. So if you apply any strictly increasing transform (g) to the objective, the algorithm’s trajectory in (x)-space is identical. (Slide 33.)

  [
  f(x_{1:\lambda}) \le \dots \le f(x_{\lambda:\lambda})
  \quad \Rightarrow \quad
  g(f(x_{1:\lambda})) \le \dots \le g(f(x_{\lambda:\lambda})).
  ]

  This is nice because in practice your scalar “fitness” is often some hacky concoction of different terms in arbitrary units. CMA‑ES simply doesn’t care, as long as higher means “worse” in a consistent way.

* **Search‑space invariance**: with full covariance adaptation, CMA‑ES is invariant under **rigid linear transforms** of the search space (rotations, reflections, translations).

  On slides 10 and 35–36 they explicitly show how just rotating coordinates turns a separable Rastrigin into a highly non‑separable one, and how algorithms that don’t adapt their metric fall apart under such rotations.

* The Einstein quote on slide 37 is not just decorative; the point is that **invariance statements are non‑empirical generalization results**. If performance is provably unchanged under a large set of transformations, then a single benchmark already says something about a *whole class* of equivalent problems.

CMA‑ES is explicitly constructed to maximize this kind of invariance: same behavior under monotone transforms of (f), and under rigid transforms of (x). That’s as close as you get to “coordinate‑free” black‑box optimization without doing something drastically more expensive.

---

## 4. Step‑size control as a random‑walk calibration problem

The deck goes into a lot of detail on **step‑size adaptation**, especially the Cumulative Step‑size Adaptation (CSA) mechanism (pages 40–44).

The conceptual picture on slide 42 is:

* Consider the mean’s trajectory (m^{(0)}, m^{(1)}, \dots).

* Define the **evolution path** (p_\sigma) as an exponentially weighted moving sum of normalized steps:

  [
  p_{\sigma}^{(g+1)} = (1 - c_\sigma), p_{\sigma}^{(g)}

  * \sqrt{c_\sigma (2 - c_\sigma),\mu_w}; C^{-1/2},\frac{m^{(g+1)} - m^{(g)}}{\sigma^{(g)}}.
    ]

* Under *purely random* selection (you’re not making progress, just stumbling), (p_\sigma) behaves like an (n)-dimensional random walk with known expected length (\mathbb{E}|N(0,I)|).

* If you’re consistently moving in a **correlated direction** (actual progress), the path length gets systematically longer; if you’re taking tiny, jittery steps, the path is shorter.

So CSA just compares the empirical length (|p_\sigma|) to its expectation and updates (\sigma) via

[
\sigma^{(g+1)} = \sigma^{(g)} \cdot
\exp\left(\frac{c_\sigma}{d_\sigma}
\left(\frac{|p_\sigma^{(g+1)}|}{\mathbb{E}|N(0,I)|} - 1\right)\right).
]

If the path is “too long,” increase (\sigma); if it’s “too short,” decrease (\sigma). That’s it.

I like this for two reasons:

1. It’s a **global**, non‑local measure: you’re not twiddling (\sigma) based on a one‑step success rule, but on a smoothed history of where the mean has been going.
2. It generalizes Rechenberg’s classic one‑fifth success rule into something that works well in higher dimensions and with recombination, while retaining its nice “keep the sampling width just large enough” spirit. (Slides 40–41.)

They also describe alternative schemes like **Two‑Point Step‑size Adaptation (TPA)** (slide 45) which uses symmetric test points along the last mean shift and compares their ranks. But CSA is the default, and it’s good to think of it as **keeping the normalized step‑path “random‑walk‑ish” in length**.

---

## 5. Covariance adaptation as online PCA + natural gradient

This is where the deck gets interestingly nerdy: how to adapt (C).

### 5.1 Rank‑one update with evolution paths

The basic covariance update (slides 64–65, 69–72) can be written in a stripped‑down form as:

[
C^{(g+1)} = (1 - c_1 - c_\mu),C^{(g)}
;+; c_1, p_c^{(g+1)} (p_c^{(g+1)})^\top
;+; c_\mu \sum_{i=1}^{\mu} w_i, y_{i:\lambda}^{(g)} (y_{i:\lambda}^{(g)})^\top.
]

Where:

* (y_{i:\lambda}^{(g)} = (x_{i:\lambda}^{(g)} - m^{(g)}) / \sigma^{(g)}) are the normalized steps of the best (\mu) offspring.
* (w_i) are positive recombination weights.
* (p_c) is another evolution path, this time in covariance space:

  [
  p_c^{(g+1)} = (1 - c_c), p_c^{(g)} + \sqrt{c_c(2 - c_c),\mu_w}; y_w^{(g)},
  ]
  with (y_w^{(g)} = \sum_{i=1}^{\mu} w_i, y_{i:\lambda}^{(g)}).

The rank‑one piece (c_1 p_c p_c^\top) is essentially **an online PCA of the recent mean steps**; the rank‑(\mu) piece uses the empirical covariance of the successful steps in the current generation. The cumulative path makes this more data‑efficient: the slide on page 72 explicitly shows that using cumulation reduces the number of function evaluations needed to learn a “cigar” direction from (O(n^2)) to (O(n)).

Geometrically:

* Each update **stretches the ellipsoid** along directions where the mean has been consistently moving and where good steps lie.
* It **shrinks** in orthogonal directions if steps there are rarely associated with good solutions (or if you use active CMA with negative weights, see below).

On convex quadratics, this turns into a **variable metric method**: they explicitly note that on (f(x) = x^\top H x) you get (C \propto H^{-1}) asymptotically (slide 65 and the summary slide 93). So CMA‑ES is implicitly learning something like the inverse Hessian of (f) purely from zero‑order information.

### 5.2 Maximum likelihood and natural gradient view

Towards the end (page 97), they point out that both the mean and covariance updates can be seen as **maximum‑likelihood estimators** under an exponential family / information‑geometric view:

* Given samples (x_{i:\lambda}), the updated (m) is the argmax of weighted log‑likelihood under a normal with fixed (C):

  [
  m_{\text{new}} = \arg\max_m \sum_{i=1}^{\mu} w_i \log p_{\mathcal{N}}(x_{i:\lambda} \mid m, C).
  ]

* Similarly the empirical covariance (C_\mu = \sum w_i (x_{i:\lambda} - m_{\text{old}})(x_{i:\lambda} - m_{\text{old}})^\top) is the ML estimator for (C) given centered data.

CMA‑ES doesn’t just set (C := C_\mu) (that would be too jumpy); instead it takes a **natural‑gradient‑like step** in the space of Gaussians towards the ML solution:

[
C^{(g+1)} = (1 - \eta),C^{(g)} + \eta,C_\mu \quad\text{with small }\eta.
]

The deck literally phrases the covariance update as “increasing the likelihood of successful steps” and mentions the natural gradient connection (slides 63, 65, 93). So if you come from the information geometry side, CMA‑ES is doing **stochastic natural gradient ascent on expected fitness over a Gaussian search distribution**, with the rank‑based selection taking care of robustness.

---

## 6. Rank‑µ and “active” CMA: using good *and* bad samples

Two further refinements from the slides are worth calling out.

### 6.1 Rank‑µ update

The **rank‑µ update** (slides 74–77) just means: don’t only use a single direction (the evolution path) to update covariance; use the top (\mu) steps each generation, with positive weights, to form a “rank‑µ” covariance change. This:

* Lets you use much larger populations effectively (learning rate scales with (\mu_w)).
* Can cut the number of generations to adapt to a new orientation from (O(n^2)) to (O(n)) when (\lambda \approx n). (Slide 77.)

They also compare this to EMNA‑global (an estimation‑of‑distribution algorithm) and highlight a subtle difference: **CMA‑ES does PCA on the *steps*** relative to the moving mean, not on the absolute points. That’s one reason it behaves like a quasi‑Newton optimizer rather than a generic EDA.

### 6.2 Active covariance update (using the losers)

The “Active Update” slides (around page 80) describe something I particularly like: **use the worst samples to shrink variance in clearly bad directions**.

* The standard rank‑µ update uses positive weights (w_i > 0) for the best points.
* Active CMA introduces **negative weights** for some of the worst points and adds a term

  [

  * c_\mu^- \sum_{\text{bad } i} |w_i|, y_{i:\lambda} y_{i:\lambda}^\top
    ]

  into the covariance update.

So promising directions get their variance increased; obviously bad directions get variance decreased faster. There are some technical conditions to keep (C) positive definite (they discuss controlling the learning rates so the subtraction doesn’t overshoot), but conceptually it’s simple: “push away from empirically terrible directions.”

Cumulatively:

* Rank‑one + path: learn long axes and major ridges efficiently.
* Rank‑µ: leverage big populations to learn full covariance quickly.
* Active update: sharpen the short axes by actively suppressing noise directions.

---

## 7. Multimodality and restarts: IPOP/BIPOP

The later slides talk about **multimodal functions** and restart strategies (pages 87–90).

Empirically:

* For some “well globally structured” multimodal functions (e.g. Rastrigin, Griewank—figure on page 88), it’s very helpful to **restart with an increasingly large population**. This is the classic **IPOP‑CMA‑ES** strategy (“Increasing POPulation”).

* For other “weak global structure” problems (think Schwefel, deceptive landscapes), giant populations can actually be counterproductive (page 89). There, restarting with a **small step size and smaller population** can help with local basin exploitation.

The **BIPOP strategy** mixes both regimes:

* An IPOP regime with steadily increasing (\lambda).
* A local‑search regime with small (\lambda) and small (\sigma).

The reason this matters practically is that it makes CMA‑ES close to **parameter‑free** for many users: you don’t have to decide between exploration and exploitation; the restart schedule systematically sweeps both. (Slide 90.)

---

## 8. Complexity and when to use variants

There’s a sober “Limitations” slide near the end (page 94):

* Internal algorithm cost is (O(n^2)) per function evaluation (due to covariance and eigen‑decompositions), with some back‑of‑the‑envelope numbers: ~(10^{-8} n^2) seconds per evaluation on a 2 GHz CPU.

* A million evaluations in 100 dimensions is on the order of 100 seconds of *internal* CPU time.

This is negligible when each evaluation is a massive CFD or FEA run, but it matters when the function is cheap. Hence all the **restricted covariance** variants:

* **sep‑CMA‑ES**: diagonal covariance; scales ~(O(n)) and works well when the problem is nearly separable.
* **limited‑memory CMA‑ES (LM‑CMA)**: low‑rank covariance approximations for very high‑dimensional problems.

The tutorial explicitly calls these out in the “Variants for large scale problems” section and in the cov‑update summary. For the airplane‑wing / bridge / LLM hyperparameter scenarios, the baseline full CMA‑ES is usually fine; but once you’re in, say, 1000+ dimensions with cheap objectives, you want to reach for these variants.

---

## 9. Big‑picture summary

The “Main characteristics” slide (page 93) is essentially the author’s own one‑pager for why CMA‑ES looks the way it does. Translated into slightly more conversational language:

1. **Multivariate normal search** – because of maximum entropy and geometric convenience.
2. **Rank‑based selection** – gives invariance to monotone transforms of (f).
3. **Step‑size control** – via evolution paths, to get near‑optimal linear convergence rates.
4. **Covariance adaptation** – to learn a variable metric that approximates (H^{-1}), effectively reparameterizing the problem into an easier shape.

And the punchline:

> Problems that were “impossible” for plain ES (no adaptation) become solvable by orders of magnitude fewer evaluations when you add covariance adaptation and good step‑size control.

Those performance plots on simple test functions (sphere, cigar, two‑axes, etc., pages 38, 47, 72) are there to hammer that home: same basic random search template, completely different behavior once you respect geometry and invariance.


Refs from main article:

[1]: https://cma-es.github.io/?utm_source=chatgpt.com "The CMA Evolution Strategy"
[2]: https://en.wikipedia.org/wiki/Multivariate_normal_distribution?utm_source=chatgpt.com "Multivariate normal distribution"
[3]: https://en.wikipedia.org/wiki/CMA-ES?utm_source=chatgpt.com "CMA-ES"
[4]: https://arxiv.org/pdf/1604.00772?utm_source=chatgpt.com "The CMA Evolution Strategy: A Tutorial"
[5]: https://en.wikipedia.org/wiki/Estimation_of_distribution_algorithm?utm_source=chatgpt.com "Estimation of distribution algorithm"
[6]: https://en.wikipedia.org/wiki/Cross-entropy_method?utm_source=chatgpt.com "Cross-entropy method"
[7]: https://en.wikipedia.org/wiki/Fisher_information_metric?utm_source=chatgpt.com "Fisher information metric"
[8]: https://arxiv.org/abs/1206.0730?utm_source=chatgpt.com "Theoretical foundation for CMA-ES from information geometric perspective"
[9]: https://www.jmlr.org/papers/volume15/wierstra14a/wierstra14a.pdf?utm_source=chatgpt.com "Natural Evolution Strategies"
[10]: https://en.wikipedia.org/wiki/Kriging?utm_source=chatgpt.com "Kriging"
[11]: https://en.wikipedia.org/wiki/Genetic_and_Evolutionary_Computation_Conference?utm_source=chatgpt.com "Genetic and Evolutionary Computation Conference"
[12]: https://arxiv.org/abs/2301.08243?utm_source=chatgpt.com "Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture"
[13]: https://www.researchgate.net/publication/261799643_A_Computationally_Efficient_Limited_Memory_CMA-ES_for_Large_Scale_Optimization?utm_source=chatgpt.com "(PDF) A Computationally Efficient Limited Memory CMA-ES ..."


Refs from section about github projects:

[1]: https://github.com/Dicklesworthstone/wasm_cmaes "GitHub - Dicklesworthstone/wasm_cmaes: Fast WASM version of CMA-ES written in Rust, for use in Javascript, with a nice demo page"
[2]: https://github.com/Dicklesworthstone/fast_cmaes "GitHub - Dicklesworthstone/fast_cmaes: Fast version of CMA-ES implemented in Rust for use in Python"
