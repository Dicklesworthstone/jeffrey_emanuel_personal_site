export interface MathTerm {
  term: string;
  short: string;
  long: string;
  analogy?: string;
  why?: string;
  color?: string;
}

export const hoeffdingMath: Record<string, MathTerm> = {
  "joint-distribution": {
    term: "Joint Distribution",
    short: "How X and Y happen together",
    long: "The probability distribution that gives the probability that each of X, Y falls in any particular range or discrete set of values specified for that variable.",
    analogy: "Like a dance where both partners' moves are synchronized rather than random.",
    why: "Hoeffding's D is fundamentally measuring the gap between this and the product of marginals.",
    color: "#22d3ee",
  },
  "marginals": {
    term: "Product of Marginals",
    short: "The 'Independent' expectation",
    long: "The distribution of one variable ignoring the other. Multiplying them gives the 'independent prediction' baseline.",
    analogy: "If two people are dancing in different rooms, the 'product of marginals' is what their combined video would look like—totally uncorrelated.",
    why: "This is our 'null hypothesis' baseline.",
    color: "#a855f7",
  },
  "residuals": {
    term: "Residuals",
    short: "The 'surprise' in the data",
    long: "The difference between the observed joint distribution and the product of marginals: P(X,Y) - P(X)P(Y).",
    analogy: "The difference between a choreographed dance and two people moving randomly.",
    why: "Residual energy is what Hoeffding's D quantifies.",
    color: "#ec4899",
  },
  "n-choose-4": {
    term: "n choose 4",
    short: "Combinatorial complexity",
    long: "The number of ways to pick 4 distinct points from a set of n. Calculated as n! / (4! * (n-4)!).",
    why: "This is why the algorithm is computationally expensive—it considers quadruples.",
    color: "#f59e0b",
  },
  "d1-term": {
    term: "D1: Residual Energy",
    short: "The primary dependency signal",
    long: "Calculates the sum of (Q-1)(Q-2) across all points. It measures the aggregate volume of non-random 'clusters' in rank space.",
    why: "This term is the engine of the dependency detection.",
    color: "#22d3ee",
  },
  "d2-term": {
    term: "D2: Internal Variation",
    short: "Sequence-specific variance",
    long: "Sum of products of individual rank variances. It essentially measures the 'internal noise' of each sequence.",
    why: "Adjusts for cases where individual variables have high entropy or ties.",
    color: "#a855f7",
  },
  "d3-term": {
    term: "D3: Interaction Term",
    short: "Cross-term fine-tuning",
    long: "A composite sum that blends rank variances with concordance counts. It handles the edge cases between marginal and joint behavior.",
    why: "Ensures the final D is perfectly normalized between -0.5 and 1.0.",
    color: "#10b981",
  },
  "q-value": {
    term: "Q-Value",
    short: "Local concordance count",
    long: "For a point i, Q is 1 plus the number of points j that are lower than i in both X and Y ranks.",
    analogy: "Counting how many other data points are 'below and to the left' in rank space.",
    why: "Foundational for the joint distribution estimate.",
    color: "#10b981",
  },
  "rank-space": {
    term: "Rank Space",
    short: "Order-based coordinate system",
    long: "Transforming raw values into their relative order (1st, 2nd, etc.).",
    why: "Makes the measure robust to outliers and insensitive to absolute magnitude.",
    color: "#3b82f6",
  },
  "normalization": {
    term: "Normalization Constant",
    short: "Scaling to sample size",
    long: "A factor based on the total number of points (N) that ensures the final score is comparable across different datasets.",
    why: "Without this, D would grow infinitely with the size of the data.",
    color: "#f8fafc",
  },
};

export function getHoeffdingMath(key: string): MathTerm | undefined {
  return hoeffdingMath[key];
}
