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
