export interface JargonTerm {
  term: string;
  short: string;
  long: string;
  why?: string;
  analogy?: string;
  related?: string[];
}

const JARGON_DB: Record<string, JargonTerm> = {
  "cma-es": {
    term: "CMA-ES",
    short: "Covariance Matrix Adaptation Evolution Strategy",
    long: "A state-of-the-art derivative-free optimization algorithm for non-linear, non-convex black-box functions. It adapts a multivariate normal distribution to move toward better regions of the search space.",
    why: "It is the gold standard for black-box optimization because it handles ill-conditioned and noisy landscapes by learning the local 'shape' of the objective function without needing gradients.",
    analogy: "Think of it as a cloud of points that intelligently stretches and rotates into an elongated cigar shape to slide down a narrow valley toward a minimum.",
    related: ["evolution-strategy", "black-box-optimization", "covariance-matrix"]
  },
  "black-box-optimization": {
    term: "Black-Box Optimization",
    short: "Optimizing without internal knowledge",
    long: "A regime where you want to find the minimum or maximum of a function but you don't have access to its internal code or derivatives. You can only evaluate it at specific points and see the result.",
    why: "Most real-world engineering problems (simulations, complex software, physical experiments) are black boxes where gradients are either impossible to compute or meaningless.",
    analogy: "Tuning a car engine by only listening to the sound and looking at the speed, without knowing exactly how the fuel injection software works.",
    related: ["gradient-descent", "objective-function"]
  },
  "covariance-matrix": {
    term: "Covariance Matrix",
    short: "The shape and orientation of the search",
    long: "A square matrix that encodes the variance of each dimension and the correlation between dimensions. In CMA-ES, it defines the shape of the ellipsoid from which new candidate points are sampled.",
    why: "By adapting this matrix, the algorithm can learn to search faster along 'benign' directions and move cautiously in 'dangerous' directions.",
    analogy: "The stretching and tilting of a balloon. A sphere has a simple identity matrix; a rotated cigar has a matrix with strong off-diagonal correlations.",
    related: ["multivariate-normal", "eigenvectors"]
  },
  "multivariate-normal": {
    term: "Multivariate Normal",
    short: "A multi-dimensional bell curve",
    long: "The core probability distribution used for sampling. It is defined by a mean vector and a covariance matrix.",
    why: "The Gaussian distribution is the maximum-entropy distribution for a given mean and variance, making it the most 'unbiased' choice for local search.",
    analogy: "A multi-dimensional cloud of dust where the density is highest at the center and falls off symmetrically (or ellipsoidally) as you move away.",
    related: ["covariance-matrix", "gaussian"]
  },
  "evolution-strategy": {
    term: "Evolution Strategy",
    short: "Bio-inspired optimization",
    long: "A class of algorithms inspired by natural selection that use mutation and selection to iteratively improve a population of candidate solutions.",
    why: "Unlike Genetic Algorithms which focus on crossovers, Evolution Strategies focus on adapting the mutation parameters (like step size) to the local landscape.",
    analogy: "A group of scouts exploring a mountain range in the dark, where the scouts who find lower ground call the center of the group toward them.",
    related: ["genetic-algorithm", "cma-es"]
  },
  "step-size": {
    term: "Step-Size (\u03c3)",
    short: "The scale of exploration",
    long: "A scalar value that controls the overall width of the search distribution. It scales the covariance matrix to make the search wider or more focused.",
    why: "Proper step-size control is critical to avoid getting stuck in local minima (too small) or overshooting the optimal region (too large).",
    analogy: "The 'zoom' level on a map. You start zoomed out to find the right city, then zoom in to find the specific street.",
    related: ["cma-es", "adaptation"]
  },
  "natural-gradient": {
    term: "Natural Gradient",
    short: "Steepest ascent in distribution space",
    long: "A gradient update that takes the geometry of the parameter space (the Fisher Information Metric) into account, ensuring that steps are 'consistent' regardless of how the parameters are scaled.",
    why: "CMA-ES is theoretically linked to natural gradients, which explains why it is so robust to poorly scaled or rotated coordinate systems.",
    analogy: "Walking directly toward a destination on a map while accounting for the fact that the terrain might be steeper in some directions than others.",
    related: ["information-geometry", "fisher-information"]
  },
  "operator": {
    term: "Mathematical Operator",
    short: "Defines the relationship between terms",
    long: "Symbols like =, +, and \u223c that describe how the different components of the algorithm interact to update the search distribution."
  },
  "objective-function": {
    term: "Objective Function",
    short: "The goal to be minimized",
    long: "The function (f(x)) that we are trying to optimize. In engineering, this could be the drag of a wing, the cost of a bridge, or the error of a model.",
    why: "It defines the 'landscape' the optimizer must navigate. The more complex the landscape (bumps, ridges, noise), the more you need a robust optimizer like CMA-ES.",
    analogy: "The terrain of a landscape where the height at any point is the 'cost' and we are looking for the deepest valley.",
    related: ["black-box-optimization", "loss-function"]
  },
  "hessian": {
    term: "Hessian Matrix",
    short: "Local curvature",
    long: "The matrix of second-order partial derivatives of a function. It describes the local 'shape' of the function's surface.",
    why: "CMA-ES implicitly approximates the inverse Hessian, allowing it to take 'Newton-like' steps without ever calculating a second derivative.",
    analogy: "Knowing whether you are in a shallow bowl (low curvature) or a sharp, narrow trench (high curvature).",
    related: ["curvature", "gradient"]
  },
  "ranking": {
    term: "Rank-based Selection",
    short: "Choosing based on order",
    long: "A method of selection that only uses the relative order of fitness values rather than their absolute magnitudes.",
    why: "This makes the algorithm invariant to any strictly increasing transformation of the objective function, adding a layer of robustness.",
    analogy: "Awarding medals based on who finished 1st, 2nd, and 3rd, regardless of whether the winner was 1 second ahead or 10 minutes ahead.",
    related: ["cma-es", "invariance"]
  },
  "invariance": {
    term: "Invariance",
    short: "Robustness to transformation",
    long: "The property where an algorithm's behavior remains identical even if the problem is rotated, scaled, or its values are transformed by a monotonic function.",
    why: "It means the algorithm doesn't require the user to perfectly scale or orient their parameters before starting.",
    analogy: "A compass that works perfectly whether you're standing on your feet, your head, or spinning in circles."
  },
  "ill-conditioning": {
    term: "Ill-conditioning",
    short: "Extreme sensitivity differences",
    long: "A state where some parameters are much more sensitive than others (e.g., changing x by 0.01 matters as much as changing y by 100).",
    why: "Most optimizers fail here; CMA-ES handles it by stretching its search ellipsoid to match these differing scales.",
    analogy: "Trying to find the bottom of a canyon that is 10 miles long but only 2 feet wide."
  },
  "ipop-cma-es": {
    term: "IPOP-CMA-ES",
    short: "Restart with Increasing Population",
    long: "A strategy where the algorithm is restarted with a larger population size whenever it gets stuck.",
    why: "It allows the algorithm to transition from a local search to a global search, eventually finding the global minimum of complex, multimodal functions.",
    analogy: "If a small group of scouts gets trapped in a local valley, send out a much larger army to search the entire mountain range."
  },
  "stochastic-optimization": {
    term: "Stochastic Optimization",
    short: "Handling 'noisy' feedback",
    long: "Optimization where the objective function returns slightly different values for the same input due to randomness.",
    why: "Real-world simulations are often noisy; CMA-ES's population-based averaging naturally filters out this noise.",
    analogy: "Finding the highest point on a sand dune while a windstorm is constantly shifting the grains."
  },
  "zero-order": {
    term: "Zero-Order Optimization",
    short: "Using only function values",
    long: "Algorithms that only require the output f(x) for a given input x, with no knowledge of the function's internal derivative.",
    why: "Essential for black-box systems like simulators where you cannot 'see inside' to compute a gradient.",
    analogy: "Tuning a guitar by ear rather than using a tuner that tells you exactly how many Hz you are off."
  },
  "first-order": {
    term: "First-Order Optimization",
    short: "Using gradient information",
    long: "Algorithms like Gradient Descent that use the first derivative (the gradient) to move directly toward the minimum.",
    why: "If a meaningful gradient exists, first-order methods are usually orders of magnitude faster and more precise.",
    analogy: "Having a GPS that tells you the exact direction to the destination, vs. walking around and seeing if you're getting warmer or colder."
  },
  // GRANULAR PARTS FOR EQUATIONS
  "candidate-point": {
    term: "x_i",
    short: "Candidate Solution",
    long: "A specific point in the parameter space being evaluated in the current generation.",
    analogy: "One of the 'scouts' sent out to explore the landscape."
  },
  "sampling-op": {
    term: "\u223c",
    short: "Sampled From",
    long: "Indicates that the variable on the left is drawn randomly from the distribution on the right.",
    analogy: "Throwing dice to decide where to land."
  },
  "normal-symbol": {
    term: "\u2110",
    short: "Normal Distribution",
    long: "The Gaussian bell curve distribution.",
    analogy: "The 'shape' of the cloud of scouts."
  },
  "mean-vector": {
    term: "m",
    short: "Distribution Mean",
    long: "The center of the search distribution, representing the current best guess for the optimal solution.",
    analogy: "The base camp for the scouts."
  },
  "mean-shift": {
    term: "m_new - m_old",
    short: "Mean Shift",
    long: "The movement of the distribution center in one generation. It represents the collective discovery of the elite population.",
    analogy: "The vector from the old base camp to the new one."
  },
  "sigma-sq": {
    term: "\u03c3\u00b2",
    short: "Variance Scale",
    long: "The square of the step-size, providing the global scaling factor for the search.",
    analogy: "The overall 'reach' or 'zoom level' of the exploration."
  },
  "evolution-path": {
    term: "p_\u03c3",
    short: "Evolution Path",
    long: "A time-weighted moving average of the steps taken by the distribution mean.",
    why: "It tracks momentum and correlation between steps to decide when to increase or decrease the global step-size.",
    analogy: "The smoothed trail left by the base camp as it moves."
  },
  "learning-rate-cs": {
    term: "c_s",
    short: "Step-size Learning Rate",
    long: "Controls how quickly the evolution path (and thus the step-size) adapts to new information.",
    analogy: "How much weight we give to the latest scouts' discovery vs. historical knowledge."
  },
  "selection-mass": {
    term: "\u03bc_eff",
    short: "Selection Mass",
    long: "The effective number of samples used to update the distribution, accounting for the weights assigned to each.",
    analogy: "The strength of the 'voting block' among the elite scouts."
  },
  "whitening": {
    term: "C^{-1/2}",
    short: "Whitening Transform",
    long: "The inverse square root of the covariance matrix, used to normalize the step into a spherical coordinate system.",
    why: "This allows the algorithm to measure 'distance' in a way that is independent of the current search ellipsoid's orientation.",
    analogy: "Squashing the cigar-shaped cloud back into a sphere so we can see the 'true' direction of progress."
  }
};

export function getJargon(key: string): JargonTerm | undefined {
  return JARGON_DB[key.toLowerCase()];
}
