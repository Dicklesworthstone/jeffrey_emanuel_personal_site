/**
 * Overprompting Jargon & Math Dictionary
 *
 * Technical terms and mathematical concepts from the Overprompting article,
 * with plain-language explanations.
 */

export interface JargonTerm {
  /** The technical term */
  term: string;
  /** One-line definition (for quick reference) */
  short: string;
  /** Longer explanation in simple language */
  long: string;
  /** Optional: "Think of it like..." analogy */
  analogy?: string;
  /** Optional: Why it matters */
  why?: string;
  /** Optional: related terms */
  related?: string[];
}

export const jargonDictionary: Record<string, JargonTerm> = {
  "search-space": {
    term: "Search Space",
    short: "The theoretical set of all possible outputs a model could generate.",
    long: "In generative AI, the search space is the vast, high-dimensional volume containing every conceivable image or text sequence the model is capable of producing. Prompting is the act of navigating this space to find a specific region.",
    analogy: "Imagine a library containing every book that could ever be written. The search space is the library. Your prompt is the Dewey Decimal query.",
    related: ["latent-manifold", "constraint-hyperplane"],
  },
  "latent-manifold": {
    term: "Latent Manifold",
    short: "The 'shape' of meaningful data within the high-dimensional chaos.",
    long: "Most random combinations of pixels or words are noise. Valid images and coherent sentences live on a much lower-dimensional 'surface' or manifold within the total space. Good prompts keep the model on this manifold; bad constraints can push it off into noise.",
    analogy: "A thin sheet of paper floating in a 3D room. You can only draw on the paper. If you try to draw in the empty air (off-manifold), nothing happens.",
    related: ["search-space", "hallucination"],
  },
  "constraint-hyperplane": {
    term: "Constraint Hyperplane",
    short: "A mathematical 'slice' that cuts the search space in half.",
    long: "Every rule you add to a prompt acts like a cut. 'Must be blue' slices away all non-blue possibilities. 'Must be photorealistic' slices away cartoons. Adding too many cuts can whittle the remaining space down to nothing.",
    analogy: "Whittling a block of wood. Each cut removes material. If you make too many cuts too quickly, you might end up with toothpicks instead of a sculpture.",
    related: ["overconstrained", "search-space"],
  },
  "gradient-descent": {
    term: "Gradient Descent",
    short: "The process of iteratively improving an output to match the prompt.",
    long: "Models generate outputs by sliding 'downhill' on an energy landscape, trying to minimize the difference between what they see and what you asked for. Overprompting creates a rugged landscape full of traps and local minima where the model gets stuck.",
    related: ["local-minima", "loss-function"],
  },
  "hallucination": {
    term: "Hallucination",
    short: "The model making things up to satisfy conflicting or vague constraints.",
    long: "When a model is forced into a corner of the search space where no valid data exists (off-manifold), or when the space is too empty (underspecified), it starts inventing plausible-looking but factually wrong details to satisfy the mathematical probability distributions.",
    related: ["underspecified", "latent-manifold"],
  },
  "overconstrained": {
    term: "Overconstrained System",
    short: "A problem with so many rules that no solution exists.",
    long: "In mathematics, a system is overconstrained when there are more independent equations than unknowns. In prompting, this means you've given so many conflicting requirements that the 'valid' region of the search space is empty. The model breaks or produces garbage.",
    analogy: "Trying to find a number that is both greater than 10 and less than 5.",
    related: ["constraint-hyperplane", "quality-function"],
  },
  "activations": {
    term: "Neural Activations",
    short: "The firing patterns of neurons inside the model.",
    long: "Every word in your prompt triggers a cascade of electrical-like signals (floating point numbers) through the model's layers. These patterns represent concepts. 'Fresh eyes' prompts work by forcing a reset of these activation patterns, breaking the model out of a rut.",
    related: ["weights", "attention-mechanism"],
  },
  "attention-mechanism": {
    term: "Attention Mechanism",
    short: "How the model focuses on specific parts of your prompt.",
    long: "The Transformer architecture allows the model to 'attend' to different words with varying intensity. Overprompting dilutes this attention, forcing the model to split its limited focus across too many trivial details.",
    analogy: "A spotlight. A broad prompt keeps the spotlight focused. A detailed list of 50 items forces the spotlight to strobe rapidly, making it hard to see anything clearly.",
    related: ["transformer", "activations"],
  },
};

export const mathDictionary: Record<string, JargonTerm> = {
  "search-volume": {
    term: "Search Volume Reduction",
    short: "How constraints mathematically shrink the creative space.",
    long: "We can model the creative search space as a volume V. Each constraint c reduces this volume by a factor (1 - p), where p is the 'restrictiveness' of the constraint. With N constraints, the remaining volume shrinks exponentially.",
    analogy: "Compounding interest, but in reverse. Each rule takes a tax on your creative freedom.",
  },
  "intersection-of-sets": {
    term: "Intersection of Sets",
    short: "The mathematical definition of a valid output.",
    long: "A valid output O must belong to the intersection of all constraint sets C_i. If the intersection of C_1, C_2, ... C_n is the empty set (∅), the prompt is impossible.",
  },
  "gaussian-quality": {
    term: "Gaussian Quality Function",
    short: "The 'Bell Curve' of prompt specificity vs. quality.",
    long: "Output quality Q(s) can be modeled as a Gaussian function of specificity 's'. There is an optimal specificity \u03bc (the peak). Straying too far left (vague) or right (overprompted) causes quality to drop off exponentially.",
    analogy: "Tuning a radio. You need to be exactly on the frequency. Too low is static; too high is static.",
  },
  "entropy-loss": {
    term: "Entropy Loss",
    short: "The reduction in randomness and surprise.",
    long: "High entropy means high surprise and creativity. Adding constraints reduces the system's entropy. While some reduction is good (to focus on the topic), too much reduction kills the 'spark' that makes AI outputs interesting.",
  },
};

/**
 * Look up a jargon term by key. Keys are lowercase with hyphens.
 */
export function getJargon(key: string): JargonTerm | undefined {
  const normalizedKey = key.toLowerCase().replace(/[\s_]+/g, "-");
  return jargonDictionary[normalizedKey] || mathDictionary[normalizedKey];
}
