import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchTopicContent } from './topicConfig.js';
import { structureContentWithGemini } from './gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8015',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Concept Bridge backend is running' });
});

/**
 * Main endpoint: GET /api/topic/:slug
 *
 * Fetches content from external APIs and enriches it with Gemini
 */
app.get('/api/topic/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    console.log(`[${new Date().toISOString()}] Fetching enrichment for topic: ${slug}`);

    // Step 1: Fetch raw content from configured sources
    const contentResult = await fetchTopicContent(slug);

    if (contentResult.error) {
      return res.status(404).json({
        error: contentResult.error,
        enrichment: null,
      });
    }

    const { config, rawContent } = contentResult;

    // If no articles were found, return early
    if (rawContent.articleCount === 0) {
      return res.json({
        slug,
        config,
        enrichment: {
          simpleSummary: `No external content found for "${slug}" at this time. Check back soon!`,
          keyTakeaways: [],
          quizQuestions: [],
          connections: [],
          source: 'None',
        },
      });
    }

    console.log(`Found ${rawContent.articleCount} articles for ${slug}`);

    // Step 2: Send raw content to Gemini for structuring
    console.log(`Sending to Gemini for structuring...`);
    const enrichment = await structureContentWithGemini(
      slug,
      rawContent.articles,
      config.type
    );

    // Step 3: Return enriched content
    res.json({
      slug,
      config,
      rawContentCount: rawContent.articleCount,
      rawSources: rawContent.sources,
      enrichment,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing topic ${slug}:`, error);
    res.status(500).json({
      error: 'Unable to process topic enrichment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Debug endpoint: GET /api/topic/:slug/raw
 *
 * Returns only the raw content without Gemini processing
 * Useful for testing API fetches
 */
app.get('/api/topic/:slug/raw', async (req, res) => {
  const { slug } = req.params;

  try {
    const contentResult = await fetchTopicContent(slug);

    if (contentResult.error) {
      return res.status(404).json({ error: contentResult.error });
    }

    res.json({
      slug,
      config: contentResult.config,
      rawContent: contentResult.rawContent,
    });
  } catch (error) {
    console.error('Error fetching raw content:', error);
    res.status(500).json({
      error: 'Unable to fetch raw content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Demo endpoint: GET /api/demo/enrichment
 * Shows what the interactive learning experience looks like
 */
app.get('/api/demo/enrichment', (req, res) => {
  res.json({
    slug: 'dna-replication',
    type: 'natural-science',
    detailedExplanation: `DNA replication is the process by which a cell duplicates its DNA before cell division. This is a fundamental biological process that ensures genetic information is accurately copied to daughter cells. DNA replication occurs during the S (synthesis) phase of the cell cycle and involves multiple enzymes working together in a highly coordinated manner.

The process begins when the DNA double helix unwinds at the origin of replication. Helicase enzymes break the hydrogen bonds holding the complementary strands together, creating a replication fork. DNA polymerase then adds nucleotides to the growing DNA strand, following the base-pairing rules: adenine pairs with thymine, and cytosine pairs with guanine. This ensures each new DNA molecule is an accurate copy of the original.

DNA replication is also semi-conservative, meaning each new DNA molecule contains one original strand and one newly synthesized strand. This mechanism was demonstrated in the famous Meselson-Stahl experiment, which used isotope labeling to track old versus new DNA. The process requires multiple proteins including primase (which synthesizes RNA primers), DNA polymerase III (the main replicator enzyme), and DNA ligase (which joins segments of DNA). Errors in replication can lead to mutations, making the accuracy of DNA replication crucial for maintaining genetic stability.`,
    
    stepByStepGuide: [
      "Step 1: DNA double helix recognition - The cell's machinery identifies origins of replication where the process will begin",
      "Step 2: DNA unwinding - Helicase enzymes break hydrogen bonds between base pairs, separating the two DNA strands",
      "Step 3: Primer synthesis - Primase adds short RNA primers that provide a starting point for DNA synthesis",
      "Step 4: DNA polymerase adds nucleotides - DNA polymerase III binds to the primers and continuously adds complementary nucleotides to the growing strand",
      "Step 5: Primer removal and gap filling - DNA polymerase I removes RNA primers and fills gaps with DNA",
      "Step 6: DNA ligase seals breaks - Ligase covalently bonds DNA segments together, creating continuous DNA strands",
      "Step 7: Verification and error correction - Proofreading mechanisms check for and correct any base-pairing errors"
    ],
    
    visualDiagram: `
  DNA Replication Process:
  
  Original DNA:
    5'──[ATGC]──3'
    3'──[TACG]──5'
         │
         ├─ Helicase unwinds
         │
    5'──[ATGC]──3'    3'──[GCAT]──5'
         │                    │
    Primase adds primers →    ← DNA Polymerase adds nucleotides
         │                    │
    5'──[ATGC]──3'    3'──[TACG]──5'
    3'──[TACG]──5'    5'──[ATGC]──3'
         │                    │
         DNA Ligase seals breaks
         │
    Newly replicated DNA (two identical copies)
    `,
    
    keyTakeaways: [
      "DNA replication is semi-conservative: each new DNA molecule has one original and one new strand",
      "Helicase unwinds the double helix while DNA polymerase synthesizes new strands using base-pairing rules",
      "The process occurs during the S phase of the cell cycle and must be completed before cell division",
      "Multiple enzymes work together including helicase, primase, DNA polymerase, and ligase",
      "Error-checking mechanisms ensure high accuracy (about 1 error per billion nucleotides)",
      "Replication proceeds in both directions from origins of replication creating replication forks"
    ],
    
    commonMisconceptions: [
      {
        misconception: "DNA replication creates two completely new DNA molecules from scratch",
        correction: "DNA replication is semi-conservative - each new molecule contains one original strand and one newly synthesized strand",
        why: "This is a common misconception because students think the entire DNA molecule is created new, but actually only one strand is new in each copy"
      },
      {
        misconception: "DNA polymerase can start synthesizing DNA on its own",
        correction: "DNA polymerase requires RNA primers synthesized by primase to begin DNA synthesis",
        why: "Students often overlook the need for primers because they seem like a small detail, but they're essential for DNA polymerase to function"
      },
      {
        misconception: "Both strands of DNA are replicated at the same rate",
        correction: "The leading strand is synthesized continuously while the lagging strand is synthesized as Okazaki fragments in the opposite direction",
        why: "DNA polymerase can only work in the 5' to 3' direction, but the two strands run antiparallel, so one must be synthesized discontinuously"
      }
    ],
    
    realWorldApplications: [
      {
        title: "Cancer Research and Tumor Biology",
        description: "Understanding DNA replication errors helps researchers identify how mutations accumulate in cancer cells. Defects in proofreading mechanisms can lead to increased mutation rates, a hallmark of cancer development."
      },
      {
        title: "Genetic Engineering and Cloning",
        description: "The ability to manipulate DNA replication is fundamental to creating genetically modified organisms. Techniques like PCR amplify DNA by artificially controlling the replication process."
      },
      {
        title: "Personalized Medicine",
        description: "Variations in DNA replication enzymes can affect how individuals respond to medications and their cancer risk, informing personalized treatment plans."
      }
    ],
    
    interactiveQuiz: [
      {
        prompt: "During DNA replication, which enzyme is responsible for unwinding the double helix so that the two strands can separate?",
        options: ["DNA polymerase", "Helicase", "Ligase", "Primase"],
        correctIndex: 1,
        explanation: "Helicase unwinds the DNA by breaking hydrogen bonds between base pairs. DNA polymerase adds nucleotides, ligase seals breaks, and primase synthesizes RNA primers.",
        difficulty: "beginner"
      },
      {
        prompt: "Why is DNA replication described as 'semi-conservative'?",
        options: [
          "Because it doesn't require energy",
          "Because each new DNA molecule contains one original strand and one new strand",
          "Because it only copies half the DNA",
          "Because it happens twice in the cell cycle"
        ],
        correctIndex: 1,
        explanation: "Semi-conservative replication means each daughter DNA molecule has one strand from the parent DNA and one newly synthesized strand. This was proven by Meselson and Stahl using isotope labeling.",
        difficulty: "intermediate"
      },
      {
        prompt: "What is the purpose of RNA primers in DNA replication, and why does DNA polymerase need them?",
        options: [
          "To prevent mutations in the DNA sequence",
          "To protect the DNA from degradation",
          "DNA polymerase requires a 3'-OH group to start adding nucleotides, which primers provide",
          "To speed up the overall rate of replication"
        ],
        correctIndex: 2,
        explanation: "DNA polymerase can only extend existing nucleotide chains and requires a 3'-OH group to attach the first nucleotide. Primase synthesizes short RNA primers that provide this starting point. These primers are later removed and replaced with DNA by DNA polymerase I.",
        difficulty: "advanced"
      }
    ],
    
    deeperConcepts: [
      {
        concept: "DNA Damage and Repair Mechanisms",
        explanation: "While DNA replication has proofreading abilities, some errors still occur and damage accumulates from external sources like UV radiation. Cells have sophisticated repair mechanisms like mismatch repair and base excision repair.",
        prerequisites: "Understanding of DNA structure and basic replication mechanisms"
      },
      {
        concept: "Telomeres and Telomerase",
        explanation: "The 'end-replication problem' occurs because DNA polymerase cannot fully replicate the ends of chromosomes. Telomerase solves this by adding repeating sequences at chromosome ends, but its activity is limited in somatic cells.",
        prerequisites: "Knowledge of DNA replication fork progression and chromosome structure"
      },
      {
        concept: "Replication in Prokaryotes vs Eukaryotes",
        explanation: "While the basic mechanism is similar, eukaryotic replication is more complex with multiple origins, more polymerases, and additional regulatory mechanisms. Prokaryotes replicate much faster despite having simpler machinery.",
        prerequisites: "Understanding of both prokaryotic and eukaryotic cell structures"
      }
    ],
    
    researchConnections: [
      {
        title: "Epigenetic Modifications During Replication",
        description: "Recent research shows that histone modifications and DNA methylation patterns are not always accurately maintained during replication, affecting gene expression in daughter cells."
      },
      {
        title: "Replication Stress and Genome Instability",
        description: "Studies on replication fork stalling and collapse reveal new mechanisms of genome instability that contribute to cancer development and aging."
      },
      {
        title: "Synthetic Biology and Artificial Replication",
        description: "Researchers are developing artificial DNA-like molecules (XNA) and investigating whether life could exist with alternative genetic polymers that replicate differently."
      }
    ],
    
    source: "PubMed + Gemini Enrichment",
    articleCount: 5
  });
});

/**
 * Complexity enrichment endpoint
 * Returns comprehensive Time & Space Complexity educational content
 */
app.get('/api/demo/complexity', (req, res) => {
  res.json({
    slug: 'time-space-complexity',
    type: 'computer-science',
    detailedExplanation: `Time complexity and space complexity are fundamental concepts in computer science that help us measure algorithm efficiency. Time complexity describes how the running time of an algorithm grows as the input size increases, while space complexity measures how much additional memory an algorithm requires.

Understanding these concepts is crucial because they help us predict whether an algorithm will scale to handle large datasets. An algorithm that works fine with 100 items might become painfully slow with 1 million items if it has poor time complexity.

Big O notation is the standard way to describe complexity. It focuses on the worst-case scenario and ignores constant factors and lower-order terms. For example, an algorithm that takes 3n + 5 steps is described as O(n) because as n grows very large, the 3n term dominates and the +5 becomes negligible.

The most common complexity classes, from fastest to slowest, are: O(1) constant time, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(n³) cubic, and O(2ⁿ) exponential. Each step up dramatically impacts performance as input size grows.

Real-world applications depend critically on complexity. Search engines like Google use algorithms with logarithmic or linear complexity to search billions of webpages. Machine learning models often have polynomial or exponential complexity in the number of features. Database indexes use logarithmic complexity to find records instantly. Understanding these tradeoffs is what separates efficient systems from slow ones.`,

    stepByStepGuide: [
      "Step 1: Identify the input size - Determine what you're measuring (array length, number of nodes, etc.)",
      "Step 2: Count the basic operations - How many simple operations (comparisons, assignments) happen for each input unit?",
      "Step 3: Express as a function - Write how operations grow (3n, n², n log n, etc.)",
      "Step 4: Apply Big O rules - Drop constants and lower-order terms (3n² + 2n + 1 becomes O(n²))",
      "Step 5: Identify nested loops - Each nested loop multiplies the complexity (two loops = O(n²), three loops = O(n³))",
      "Step 6: Consider conditional branches - Take the worst-case path through if/else statements",
      "Step 7: Verify with test cases - Confirm your analysis by timing the algorithm on different input sizes"
    ],

    visualDiagram: `
    Complexity Growth Comparison:
    
    Input Size:  10      100     1,000    10,000    1,000,000
    ────────────────────────────────────────────────────────────
    O(1):        1       1       1        1         1
    O(log n):    3       7       10       13        20
    O(n):        10      100     1,000    10,000    1,000,000
    O(n log n):  33      664     9,965    132,877   19,931,569
    O(n²):       100     10K     1M       100M      1T
    O(n³):       1K      1M      1B       1T        1E18
    O(2ⁿ):       1K      1E30    insane   insane    insane
    ────────────────────────────────────────────────────────────
    
    Takeaway: O(n²) with 1M items = 1 TRILLION operations!
              Even at 1 billion ops/sec, this takes ~1000 seconds.
    `,

    keyTakeaways: [
      "Big O notation describes worst-case complexity by ignoring constants and focusing on how operations scale",
      "Time complexity describes how running time grows; space complexity describes how memory usage grows",
      "O(log n) algorithms are exponentially faster than O(n) algorithms on large datasets",
      "Nested loops typically multiply complexities: two nested loops = O(n²), three loops = O(n³)",
      "An O(n²) algorithm may work fine for small inputs but become unusable at scale (1M items = 1 trillion operations)",
      "Hash tables achieve O(1) average time complexity, making them faster than sorted arrays with O(log n) complexity"
    ],

    commonMisconceptions: [
      {
        misconception: "An O(n) algorithm is always twice as fast as an O(n²) algorithm",
        correction: "The relationship between O(n) and O(n²) depends on input size. For n=10: O(n)=10, O(n²)=100 (10x slower). For n=1000000: O(n)=1M, O(n²)=1T (1M times slower!). The larger the input, the more dramatic the difference.",
        why: "Big O describes growth rate, not absolute speed. Small inputs hide the massive performance differences that emerge at scale."
      },
      {
        misconception: "O(n log n) is the same as O(n²)",
        correction: "O(n log n) is significantly faster than O(n²). For n=1 million: O(n log n) ≈ 20M operations, but O(n²) ≈ 1 trillion operations. That's a 50,000x difference!",
        why: "The log n factor grows much more slowly than the linear n factor. Logarithm grows by 1 every time you double n, while n doubles every time n doubles."
      },
      {
        misconception: "Space complexity doesn't matter; memory is cheap",
        correction: "Space complexity dramatically impacts performance. Using too much memory causes cache misses, page faults, and garbage collection overhead, slowing down your entire algorithm.",
        why: "Modern computers are fastest when accessing data in CPU cache (nanoseconds), slower with main RAM (microseconds), and much slower with disk storage (milliseconds). Poor space complexity means poor temporal locality."
      }
    ],

    realWorldApplications: [
      {
        title: "Search Engines & Indexing",
        description: "Google searches billions of webpages instantly using B-trees and hash tables (O(log n) and O(1) complexity). A naïve O(n) search would take hours. This difference is worth billions in server costs and user satisfaction."
      },
      {
        title: "E-commerce Recommendations",
        description: "Netflix recommends movies to 200+ million users by using machine learning with careful algorithm selection. An O(n³) algorithm would be impossible; they use O(n log n) and O(1) approaches to process billions of interactions in real-time."
      },
      {
        title: "Financial Trading Systems",
        description: "High-frequency trading algorithms execute thousands of trades per second. A difference between O(n) and O(n log n) complexity can mean millions of dollars in performance advantage or latency disadvantage."
      }
    ],

    interactiveQuiz: [
      {
        prompt: "If an algorithm has O(n²) complexity and takes 10 seconds to process 1,000 items, approximately how long will it take to process 10,000 items?",
        options: ["10 seconds (same time)", "100 seconds (10x longer)", "1,000 seconds (100x longer)", "It depends on the constant factors"],
        correctIndex: 2,
        explanation: "With O(n²) complexity, when input size increases 10x (from 1,000 to 10,000), the time increases 100x (10² = 100). So 10 seconds × 100 = 1,000 seconds. This demonstrates why O(n²) algorithms don't scale well.",
        difficulty: "beginner"
      },
      {
        prompt: "You have two algorithms: A runs in O(n log n) time and B runs in O(n²) time. Both correctly solve the same problem. Which is better and why?",
        options: [
          "Algorithm B is better because it's simpler to implement",
          "Algorithm A is better because O(n log n) is significantly faster for large inputs, especially when n > 100",
          "They're equivalent; the constant factors matter more than Big O",
          "It depends on whether we care about time or space complexity"
        ],
        correctIndex: 1,
        explanation: "For small inputs (n < 10), constant factors might matter and B could be faster despite worse Big O. But for realistic sizes (n > 100), O(n log n) is dramatically better. For n=1M: A ≈ 20M operations vs B ≈ 1T operations. That's a 50,000x difference!",
        difficulty: "intermediate"
      },
      {
        prompt: "An algorithm uses recursion with memoization to solve a problem. Without memoization it's O(2ⁿ) time, but with memoization it becomes O(n²). What's happening?",
        options: [
          "Memoization magically speeds up all algorithms exponentially",
          "Memoization caches results to avoid recomputing the same subproblems, reducing overlapping work from exponential to polynomial",
          "The algorithm was never really O(2ⁿ), memoization just exposed the true complexity",
          "Space and time complexity always trade off equally"
        ],
        correctIndex: 1,
        explanation: "Many recursive algorithms solve overlapping subproblems repeatedly. Memoization stores results so you compute each unique subproblem only once. This transforms exponential time (many redundant calculations) into polynomial time (one calculation per subproblem). This is the basis of dynamic programming.",
        difficulty: "advanced"
      }
    ],

    deeperConcepts: [
      {
        concept: "Amortized Analysis",
        explanation: "Some algorithms have expensive operations rarely but cheap operations frequently. Amortized analysis averages these costs. For example, dynamic arrays have O(n) amortized time for append because expensive resizing rarely happens—most appends are O(1). This is more realistic than worst-case analysis.",
        prerequisites: "Understanding of data structures like arrays and hash tables"
      },
      {
        concept: "Space-Time Trade-offs",
        explanation: "You can often use more memory to save time (like hash tables for O(1) lookup) or less memory to save time (like algorithms that iterate cleverly). Choosing the right trade-off depends on your constraints: Are you memory-limited (mobile devices) or CPU-limited (servers)? Is latency critical (trading systems) or throughput critical (batch processing)?",
        prerequisites: "Understanding of both time and space complexity basics"
      },
      {
        concept: "NP-Completeness & Computational Limits",
        explanation: "Some problems (like the Traveling Salesman Problem) don't have known polynomial-time solutions. These NP-Complete problems may require exponential or worse time. Understanding this helps you know when approximation algorithms or heuristics are more practical than searching for perfect polynomial solutions.",
        prerequisites: "Knowledge of P vs NP, Big O notation, and algorithm fundamentals"
      }
    ],

    researchConnections: [
      {
        title: "Quantum Computing & Algorithm Complexity",
        description: "Quantum computers could solve certain problems exponentially faster (O(2ⁿ) becomes O(√2ⁿ)). This would break current encryption and enable new algorithms for optimization and simulation."
      },
      {
        title: "Machine Learning & Scalability",
        description: "Modern deep learning trains on billions of data points. Researchers focus on algorithms with better complexity (O(n) vs O(n²)) and efficient implementations (GPUs, distributed computing) to make training feasible."
      },
      {
        title: "Approximation Algorithms",
        description: "For NP-Hard problems with no known polynomial solutions, researchers develop approximation algorithms that solve problems 'good enough' in polynomial time. This bridges the gap between theory and practice."
      }
    ],

    source: "Computer Science & Algorithm Theory",
    articleCount: 5
  });
});

/**
 * List all configured topics
 */
app.get('/api/topics/configured', (req, res) => {
  const TOPIC_CONFIG = {
    'dna-replication': { type: 'natural-science', field: 'Biology' },
    'forces-motion': { type: 'natural-science', field: 'Physics' },
    'time-space-complexity': { type: 'computer-science', field: 'Algorithms' },
    python: { type: 'computer-science', field: 'Programming' },
    javascript: { type: 'computer-science', field: 'Web Development' },
    react: { type: 'computer-science', field: 'Web Development' },
    sql: { type: 'computer-science', field: 'Databases' },
    dsa: { type: 'computer-science', field: 'Algorithms' },
    'system-design': { type: 'computer-science', field: 'Systems' },
    docker: { type: 'computer-science', field: 'DevOps' },
  };

  res.json({ configured: Object.keys(TOPIC_CONFIG), total: Object.keys(TOPIC_CONFIG).length });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Concept Bridge Backend - API Server                ║
║                                                              ║
║  Server running on port ${PORT}                             ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                ║
║  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8015'}           ║
║                                                              ║
║  Endpoints:                                                 ║
║  GET /health                                                ║
║  GET /api/topic/:slug                 (enriched content)    ║
║  GET /api/topic/:slug/raw              (raw external data)   ║
║  GET /api/topics/configured            (list all topics)     ║
║                                                              ║
║  Try: http://localhost:${PORT}/api/topic/dna-replication          ║
║  or:  http://localhost:${PORT}/api/topic/time-space-complexity    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
