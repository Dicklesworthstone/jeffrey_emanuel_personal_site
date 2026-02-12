/**
 * Bakery Algorithm Jargon & Math Dictionary
 *
 * Technical terms and mathematical concepts from Lamport's Bakery Algorithm,
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
  "mutual-exclusion": {
    term: "Mutual Exclusion",
    short: "Only one process can access a shared resource at a time.",
    long: "The core property of any synchronization algorithm. It ensures that critical sections of code—where shared data is modified—are never executed by more than one process simultaneously, preventing data corruption.",
    analogy: "A bathroom with a single-person lock. If one person is inside, no one else can enter until they leave.",
    related: ["critical-section", "atomic-operation"],
  },
  "critical-section": {
    term: "Critical Section",
    short: "A code segment where shared resources are accessed.",
    long: "The specific part of a program that accesses shared variables or resources. This is the area that the Bakery Algorithm protects to ensure that only one process is 'working' there at any given time.",
    related: ["mutual-exclusion", "lock"],
  },
  "choosing-array": {
    term: "The Choosing Guard (choosing[i])",
    short: "A boolean flag indicating a process is picking its ticket.",
    long: "This is the most subtle and brilliant part of the algorithm. Because ticket-taking is not atomic, Process A might read Process B's number while B is halfway through writing it. The 'choosing' flag forces A to wait until B has finished writing its number, ensuring stability.",
    why: "It solves the 'torn read' problem where a process might see a half-written, incorrect value.",
    related: ["non-atomicity", "ticket-number"],
  },
  "number-array": {
    term: "Ticket Numbers (number[i])",
    short: "The sequential ID assigned to a process wishing to enter.",
    long: "Each process picks a number one greater than any existing number it sees. Processes are served in increasing order of these numbers. If two processes pick the same number, the tie is broken by their unique IDs.",
    analogy: "Taking a deli counter ticket. You see the highest number called and take the next one.",
    related: ["total-ordering", "choosing-array"],
  },
  "total-ordering": {
    term: "Total Ordering",
    short: "A strict hierarchy where no two processes have equal priority.",
    long: "The Bakery Algorithm ensures that for any two processes A and B, we can always say either 'A goes before B' or 'B goes before A'. By using (Ticket, ID) pairs, it eliminates any possibility of a 'draw' where both processes think they should go first.",
    related: ["lexicographical-order"],
  },
  "non-atomicity": {
    term: "Non-Atomicity",
    short: "Operations that can be interrupted or viewed in intermediate states.",
    long: "Most algorithms require 'Atomic' instructions (indivisible hardware acts). Lamport's Bakery is famous for working even if reads and writes are 'torn' or 'messy'—it relies on logical sequencing rather than physical hardware locks.",
    why: "It makes the algorithm truly universal, capable of running on the simplest possible hardware.",
  },
  "busy-waiting": {
    term: "Busy Waiting",
    short: "Repeatedly checking a condition until it becomes true.",
    long: "Also known as 'spinning'. Instead of going to sleep and being woken up by the OS, the process stays active, using CPU cycles to constantly poll the state of other processes. It's fast for short waits but inefficient for long ones.",
    analogy: "Asking 'Are we there yet?' every 2 seconds during a car ride.",
  },
  "freedom-from-starvation": {
    term: "Freedom from Starvation",
    short: "A guarantee that every process will eventually enter.",
    long: "Fairness ensures that no process is ignored forever while others cut in line. Because tickets are taken sequentially, every process that wants to enter is guaranteed to eventually become the one with the lowest (Ticket, ID) pair.",
    related: ["fairness"],
  },
};

export const mathDictionary: Record<string, JargonTerm> = {
  "lexicographical-order": {
    term: "(number[i], i) < (number[j], j)",
    short: "The primary comparison logic of the algorithm.",
    long: "This defines the priority. It checks if Process i's ticket is smaller than Process j's. If the tickets are tied, it breaks the tie by checking if i's unique ID is smaller than j's.",
    why: "This ensures that even if two processes decide on the same ticket number simultaneously, the system remains deterministic and stable.",
  },
  "max-plus-one": {
    term: "number[i] = max(number[0]...number[n-1]) + 1",
    short: "The ticket assignment logic.",
    long: "A process looks at all current tickets and takes one higher than the highest it sees. In a distributed system, multiple processes might see the same 'max' at the same time, leading to identical tickets—which is why the ID tie-breaker exists.",
  },
  "wait-loop-1": {
    term: "while (choosing[j]) { }",
    short: "Wait for the doorway to stabilize.",
    long: "This loop ensures that Process i doesn't compare itself against Process j until j has finished writing its ticket number. It prevents reading garbage or intermediate values.",
  },
  "wait-loop-2": {
    term: "while (number[j] != 0 && (number[j], j) < (number[i], i)) { }",
    short: "Wait for your turn in line.",
    long: "This loop is where the process actually waits for its turn. It checks if Process j is interested (number != 0) and if j has a higher priority (lower ticket or ID).",
  }
};

/**
 * Look up a jargon term by key. Keys are lowercase with hyphens.
 */
export function getJargon(key: string): JargonTerm | undefined {
  const normalizedKey = key.toLowerCase().replace(/[\s_]+/g, "-");
  return jargonDictionary[normalizedKey] || mathDictionary[normalizedKey];
}
