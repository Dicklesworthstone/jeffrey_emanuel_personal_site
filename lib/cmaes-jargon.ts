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
  }
};

export function getJargon(key: string): JargonTerm | undefined {
  return JARGON_DB[key.toLowerCase()];
}
