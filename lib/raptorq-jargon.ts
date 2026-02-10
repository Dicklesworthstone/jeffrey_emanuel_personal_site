/**
 * RaptorQ Jargon Dictionary
 *
 * Technical terms from the RaptorQ / fountain codes article,
 * with plain-language explanations for newcomers.
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

const jargonDictionary: Record<string, JargonTerm> = {
  "fountain-code": {
    term: "Fountain Code",
    short: "An erasure code that can generate a potentially infinite stream of encoded packets from source data.",
    long: "A fountain code turns a fixed block of data into an open-ended stream of encoded packets. Any sufficiently large subset of those packets can reconstruct the original. The sender doesn't need to know the receiver's loss rate in advance — it just keeps spraying packets until the receiver says 'enough.'",
    analogy: "A faucet pouring water into a bucket. It doesn't matter which specific drops land in the bucket — once you have enough volume, you're done.",
    related: ["lt-codes", "raptorq", "rateless"],
  },
  "raptorq": {
    term: "RaptorQ (RFC 6330)",
    short: "The most efficient practical fountain code, standardized in RFC 6330.",
    long: "RaptorQ is a rateless erasure code that combines a sparse LT code with a structured precode. It achieves near-MDS performance — needing only K + 2 symbols to decode with one-in-a-million reliability — while encoding and decoding in linear time.",
    why: "It's the production-grade version of fountain codes, used in 3GPP broadcast standards and file delivery protocols.",
    related: ["fountain-code", "precode", "lt-codes"],
  },
  "gf2": {
    term: "GF(2)",
    short: "The binary field where addition is XOR and multiplication is AND.",
    long: "GF(2) is the simplest finite field: it has exactly two elements, 0 and 1. Addition in GF(2) is XOR (exclusive or), and multiplication is AND. Most of RaptorQ's linear algebra operates over GF(2), which means the 'heavy' operations are just bitwise XORs — extremely fast on modern CPUs.",
    analogy: "A light switch: it's either on or off. Flipping it twice puts it back where it started — just like XOR.",
    related: ["gf256", "xor"],
  },
  "gf256": {
    term: "GF(256)",
    short: "A larger finite field used for the dense 'insurance' layer in RaptorQ.",
    long: "GF(256) is a finite field with 256 elements (one byte). Unlike GF(2), where random vectors have a 71% chance of being linearly dependent, random vectors over GF(256) are almost always independent — each extra equation crushes failure probability by a factor of 256. RaptorQ uses GF(256) for its HDPC constraints to guarantee rank at finite block sizes.",
    why: "It makes accidental linear dependence vanishingly rare, which is why +2 symbols can improve reliability by four orders of magnitude.",
    related: ["gf2", "hdpc", "rank"],
  },
  "xor": {
    term: "XOR",
    short: "Exclusive OR — the fundamental operation in binary erasure codes.",
    long: "XOR (⊕) outputs 1 when its inputs differ, 0 when they match. It's its own inverse: A ⊕ B ⊕ B = A. This self-canceling property makes it perfect for encoding: XOR symbols together to encode, XOR them again to decode. It's also the cheapest meaningful CPU operation.",
    related: ["gf2"],
  },
  "peeling-decoder": {
    term: "Peeling Decoder",
    short: "A fast decoder that iteratively solves degree-1 equations, cascading through the system.",
    long: "The peeling decoder (also called belief propagation) looks for equations with only one unknown, solves them instantly, then substitutes the result into all other equations. This may create new degree-1 equations, triggering a cascade. It runs in O(K) time — linear in the block size.",
    analogy: "Like Sudoku: find a cell with only one possibility, fill it in, and that constrains neighboring cells, which may become solvable.",
    related: ["inactivation-decoding", "ripple", "stopping-set"],
  },
  "precode": {
    term: "Precode",
    short: "A high-rate inner code that adds structured redundancy before the fountain layer.",
    long: "The precode expands K source symbols into L intermediate symbols (adding ~3% redundancy) using deterministic constraints. This lets the fountain layer get away with recovering only ~97% of symbols — the precode fills in the rest. It moves the 'hard work' from the probabilistic layer (expensive) to a deterministic layer (cheap).",
    why: "It eliminates the coupon-collector log(K) overhead that plagues pure fountain codes.",
    related: ["ldpc", "hdpc", "intermediate-symbols"],
  },
  "mds": {
    term: "MDS (Maximum Distance Separable)",
    short: "The theoretical optimum: any K of N encoded symbols perfectly reconstruct K source symbols.",
    long: "An MDS code achieves zero overhead — you need exactly K symbols to recover K source symbols, no more. Reed-Solomon codes are MDS. RaptorQ is 'near-MDS': it needs K + ε symbols, where ε is typically 0–2.",
    related: ["reed-solomon", "raptorq"],
  },
  "systematic-encoding": {
    term: "Systematic Encoding",
    short: "The first K encoding symbols are the original source data, unmodified.",
    long: "In a systematic code, the original data appears verbatim in the encoded stream. If the channel is clean, the receiver just gets the source symbols directly and never needs to run a decoder. Repair symbols are only used when packets are actually lost.",
    why: "In the common case of low loss, this means zero decoding overhead — you just read the data.",
    related: ["esi", "raptorq"],
  },
  "esi": {
    term: "ESI (Encoding Symbol ID)",
    short: "A single integer that tells the receiver which equation a packet represents.",
    long: "Each RaptorQ packet carries an Encoding Symbol ID. Both sender and receiver run the same deterministic generator seeded by this ID to reconstruct which intermediate symbols were combined. No coefficient vector needed — just one integer of metadata.",
    analogy: "A recipe number. You don't need to list every ingredient — just say 'Recipe #42' and both sides know exactly what goes in.",
    related: ["systematic-encoding", "intermediate-symbols"],
  },
  "lt-codes": {
    term: "LT Codes",
    short: "The first practical fountain codes (Luby, 2002), using variable-degree random equations.",
    long: "LT (Luby Transform) codes generate each encoded packet by XORing a random subset of source symbols, with the subset size drawn from a carefully shaped degree distribution. The degree distribution is tuned so that peeling decoding works with high probability.",
    related: ["fountain-code", "soliton-distribution", "raptorq"],
  },
  "soliton-distribution": {
    term: "Soliton Distribution",
    short: "The mathematically ideal degree distribution for LT codes.",
    long: "The Ideal Soliton distribution assigns degree d with probability 1/(d(d-1)), ensuring an expected ripple of exactly one at each decoding step. In practice it's too fragile — one unlucky dry spell kills the decode. The Robust Soliton adds a deliberate buffer to keep the ripple healthy.",
    related: ["lt-codes", "ripple", "peeling-decoder"],
  },
  "ripple": {
    term: "Ripple",
    short: "The set of degree-1 check nodes available for peeling at any moment during decoding.",
    long: "During peeling decoding, the ripple is how many equations currently have exactly one unknown. If the ripple hits zero, peeling stalls — you're stuck in a stopping set. The whole point of degree distribution design is to keep the ripple positive throughout decoding.",
    related: ["peeling-decoder", "stopping-set", "soliton-distribution"],
  },
  "inactivation-decoding": {
    term: "Inactivation Decoding",
    short: "When peeling stalls, temporarily 'park' a variable and keep going.",
    long: "When every remaining equation has degree ≥ 2 (a stopping set), inactivation decoding picks a variable, marks it as 'inactive' (treat it as known for now), and continues peeling. After peeling completes, the small set of inactive variables is solved via Gaussian elimination. The cubic cost is confined to a tiny core (~√K variables), not the full system.",
    related: ["peeling-decoder", "stopping-set", "gaussian-elimination"],
  },
  "stopping-set": {
    term: "Stopping Set (2-Core)",
    short: "A subgraph where every remaining equation has degree ≥ 2, so peeling cannot proceed.",
    long: "A stopping set is a configuration where no equation has a single unknown — peeling is stuck. In graph terms, it's the 2-core of the bipartite graph. Without inactivation, the decoder fails at this point. RaptorQ uses inactivation to break through stopping sets cheaply.",
    related: ["peeling-decoder", "inactivation-decoding"],
  },
  "gaussian-elimination": {
    term: "Gaussian Elimination",
    short: "The brute-force method for solving linear systems — cubic time but always works.",
    long: "Gaussian elimination row-reduces a matrix to echelon form by pivoting and eliminating. It costs O(K³) for a K×K system. RaptorQ confines this expensive step to a tiny ~√K × √K inactive core, keeping the total cost nearly linear.",
    related: ["rank", "inactivation-decoding"],
  },
  "rank": {
    term: "Rank",
    short: "The number of linearly independent equations in the system — when it equals K, you can solve.",
    long: "The rank of a matrix is the number of linearly independent rows. A system of K unknowns is solvable exactly when the coefficient matrix has rank K. Each new independent packet increases the rank by 1. When rank equals the number of unknowns, the solution is unique — your file.",
    related: ["linear-independence", "gaussian-elimination"],
  },
  "linear-independence": {
    term: "Linear Independence",
    short: "Equations that each contribute new information — none is a combination of others.",
    long: "A set of equations is linearly independent if no equation can be produced by XORing others together. Independent equations each constrain the solution further. Dependent equations are redundant — they add no new information. A system with K unknowns needs K independent equations to solve.",
    related: ["rank", "gf2"],
  },
  "reed-solomon": {
    term: "Reed-Solomon Codes",
    short: "MDS erasure codes based on polynomial evaluation — optimal but slow at scale.",
    long: "Reed-Solomon codes encode K data symbols as evaluations of a degree-(K-1) polynomial at N distinct points. Any K evaluations recover the polynomial via interpolation. They're MDS-optimal (zero overhead) but encoding is O(n·K) and decoding O(K²). For K = 50,000, that's too slow for real-time applications.",
    analogy: "A polynomial curve through K points is unique. Evaluate it at extra points for redundancy. Any K points reconstruct the curve.",
    related: ["mds", "shamirs-secret-sharing"],
  },
  "ldpc": {
    term: "LDPC Constraints",
    short: "Sparse parity-check equations that provide cheap XOR-based redundancy.",
    long: "LDPC (Low-Density Parity-Check) constraints are sparse equations over GF(2) — each involves only a few symbols. They're very cheap to compute (just XORs) and form part of RaptorQ's precode. They handle the 'easy' redundancy while HDPC handles the hard cases.",
    related: ["hdpc", "precode", "gf2"],
  },
  "hdpc": {
    term: "HDPC Constraints",
    short: "Dense parity-check equations over GF(256) that crush rank deficiency.",
    long: "HDPC (High-Density Parity-Check) constraints use GF(256) arithmetic, making random coefficient vectors dramatically more independent than GF(2). This is RaptorQ's 'insurance policy' — a small set of equations that make decode failure vanishingly unlikely. The GF(256) cost is higher per operation but confined to a small subsystem.",
    related: ["ldpc", "gf256", "precode"],
  },
  "intermediate-symbols": {
    term: "Intermediate Symbols",
    short: "The slightly expanded set of symbols that RaptorQ actually solves for.",
    long: "RaptorQ doesn't solve directly for your K source symbols. It first defines L intermediate symbols (L > K), incorporating precode constraints. The decoder recovers all L intermediates, then extracts the K source symbols. This extra structure is what makes the precode repair work.",
    related: ["precode", "raptorq"],
  },
  "coupon-collector": {
    term: "Coupon Collector Problem",
    short: "The mathematical curse that makes sparse random codes need O(K log K) packets.",
    long: "If each packet randomly 'touches' a few symbols, some symbols will be touched many times while others are missed entirely. Covering all K symbols requires O(K log K) packets — a log(K) overhead. For K = 10,000, that's roughly a 10× overhead. The precode trick eliminates this by not requiring 100% coverage from the fountain layer.",
    analogy: "Collecting all items in a random sticker pack. The first few are easy, but the last few take forever because you keep getting duplicates.",
    related: ["precode", "lt-codes"],
  },
  "feedback-implosion": {
    term: "Feedback Implosion",
    short: "When millions of receivers simultaneously send retransmission requests, drowning the sender.",
    long: "In TCP-style protocols, each receiver tells the sender which packets it's missing. With a million receivers each losing different packets, the sender gets a million retransmission requests at once. Fountain codes eliminate this by removing the need for feedback entirely — the sender just keeps spraying, and each receiver stops when it has enough.",
    related: ["fountain-code", "rateless"],
  },
  "rateless": {
    term: "Rateless",
    short: "A code where the sender can generate as many encoded symbols as needed, with no fixed rate.",
    long: "A rateless code has no predetermined ratio of source-to-encoded symbols. The sender generates packets on demand. Noisy links just need more packets; clean links stop early. There's no rate negotiation, no wasted bandwidth on a good channel, and no failure on a bad one.",
    related: ["fountain-code", "raptorq"],
  },
  "shamirs-secret-sharing": {
    term: "Shamir's Secret Sharing",
    short: "A cryptographic scheme for splitting a secret into N shares where any K reconstruct it.",
    long: "Shamir's scheme encodes a secret as the constant term of a random polynomial of degree K-1, then evaluates it at N distinct points. Any K shares determine the polynomial via Lagrange interpolation; K-1 shares reveal nothing. It's the cryptographic cousin of erasure coding — same linear algebra, different goal.",
    analogy: "Hide a number as the y-intercept of a curve. Give people points on the curve. Any K points determine the curve (and the secret), but K-1 points could fit any curve.",
    related: ["reed-solomon", "rank"],
  },
};

/**
 * Look up a jargon term by key. Keys are lowercase with hyphens.
 */
export function getJargon(key: string): JargonTerm | undefined {
  return jargonDictionary[key.toLowerCase().replace(/[\s_]+/g, "-")];
}
