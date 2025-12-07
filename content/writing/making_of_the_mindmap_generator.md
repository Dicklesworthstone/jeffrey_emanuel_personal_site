---
title: "Engineering the Mindmap Generator"
date: "2025-02-25"
excerpt: "Why pipelines aren't enough. Details the 'non-linear exploration model' architecture needed to extract deep, hierarchical structure from complex documents without hallucination."
category: "Software Architecture"
author: "Jeffrey Emanuel"
source: "FMD"
---

## Introduction

In the crowded space of LLM applications (referred to in a denigrating sense as "wrappers"), most tools follow a predictable pattern: feed text to an LLM and receive a straightforward response. But what if we want to extract structured, hierarchical knowledge from documents? What if we need to organize complex information into an intuitive format that captures relationships between concepts? This was the fundamental challenge that drove the development of the Mindmap Generator.

The goal was ambitious: create a system that could take any text document, regardless of length, complexity, or domain, and generate a comprehensive, hierarchical mindmap that accurately represents its content. This wouldn't be a simple summarization task, but rather a complex knowledge extraction process that maintains fidelity to the source while organizing information into meaningful structures.

## The Problem Space

Traditional LLM applications typically operate with a simple "prompt → response" paradigm. The Mindmap Generator needed something fundamentally different— an intelligent exploratory system that could:

1. Detect the document's type and adapt extraction strategies accordingly
2. Identify main topics without missing critical content
3. Extract subtopics that meaningfully develop each main topic
4. Uncover specific details that support understanding
5. Maintain accuracy without introducing fictional content
6. Eliminate redundancy across the entire structure
7. Balance breadth and depth of analysis
8. Handle documents beyond LLM context windows
9. Visualize results in multiple useful formats

Solving these problems required a departure from conventional approaches to LLM application development. What emerged was a sophisticated system more akin to a cognitive exploration engine than a typical LLM application.

## Architecture: Beyond the Linear Pipeline

The fundamental insight that drove the architecture was that document analysis isn't a linear process; it's an iterative exploration with complex dependencies and feedback loops. Unlike most LLM applications that follow a simple pipeline pattern, the Mindmap Generator employs what I call a "non-linear exploration model."

Whereas traditional LLM applications typically follow a simple pattern:

```
Input → LLM Prompt → Output
```

Or perhaps a pipeline:

```
Input → LLM Prompt 1 → Output 1 → LLM Prompt 2 → Output 2 → Final Result
```

The Mindmap Generator operates as a multi-dimensional exploration system, where:

1. **Multiple parallel processes** explore different aspects of the document simultaneously
2. **Feedback loops** evaluate the quality and uniqueness of extracted information
3. **Heuristic-guided decisions** determine when to explore deeper or stop exploration
4. **Verification mechanisms** ensure factual accuracy throughout

This approach allows the system to efficiently navigate the vast conceptual space of the document while maintaining coherence and accuracy.

At its core, the system employs a multi-phase approach:

1. **Document Type Detection**: The system begins by sampling the document to determine its fundamental structure and purpose
2. **Intelligent Chunking**: Documents are split into overlapping segments to handle length constraints
3. **Parallel Topic Extraction**: Multiple processes simultaneously identify potential main concepts
4. **Hierarchical Descent**: For each topic, the system recursively explores subtopics and details
5. **Content Verification**: Generated content is verified against the source document
6. **Redundancy Elimination**: Multiple passes detect and remove duplicative content
7. **Hierarchical Organization**: The final structure is assembled into a coherent mindmap

![Mindmap Architecture:](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/refs/heads/main/screenshots/mindmap-architecture.svg)

Let's explore each of these phases in detail.

## Document Type Detection: The Foundation of Intelligent Extraction

The cornerstone of the system is its ability to recognize different document types. This isn't simply a classification task; it's about understanding the fundamental structure and organization of information.

The code implements a sophisticated detection system that distinguishes between:

```python
class DocumentType(Enum):
    """Enumeration of supported document types."""
    TECHNICAL = auto()
    SCIENTIFIC = auto()
    NARRATIVE = auto()
    BUSINESS = auto()
    ACADEMIC = auto()
    LEGAL = auto()      
    MEDICAL = auto()    
    INSTRUCTIONAL = auto() 
    ANALYTICAL = auto() 
    PROCEDURAL = auto() 
    GENERAL = auto()
```

For each document type, the system employs specialized prompt templates optimized for that particular structure. This allows the LLM to extract information in alignment with how that type of document naturally organizes concepts.

For example, technical documents focus on components, interfaces, and implementations, while narrative documents emphasize plot elements, character development, and themes. This adaptive approach significantly enhances extraction quality by aligning with the document's inherent organization.

Implementing this detection system wasn't trivial. The challenge was developing a prompt that could reliably distinguish between document types without being overly complicated. The solution involved carefully constructed discriminative features for each document type, combined with a detection prompt that encourages the LLM to reason through the classification (note that this just shows a portion of all the document types from the prompt):

```markdown
You are analyzing a document to determine its primary type and structure. This document requires the most appropriate conceptual organization strategy.

Key characteristics of each document type:

    TECHNICAL
    - Contains system specifications, API documentation, or implementation details
    - Focuses on HOW things work and technical implementation
    - Uses technical terminology, code examples, or system diagrams
    - Structured around components, modules, or technical processes
    Example indicators: API endpoints, code blocks, system requirements, technical specifications

    SCIENTIFIC
    - Presents research findings, experimental data, or scientific theories
    - Follows scientific method with hypotheses, methods, results
    - Contains statistical analysis or experimental procedures
    - References prior research or scientific literature
    Example indicators: methodology sections, statistical results, citations, experimental procedures

    NARRATIVE
    - Tells a story or presents events in sequence
    - Has character development or plot progression
    - Uses descriptive language and scene-setting
    - Organized chronologically or by story elements
    Example indicators: character descriptions, plot developments, narrative flow, dialogue

    BUSINESS
    - Focuses on business operations, strategy, or market analysis
    - Contains financial data or business metrics
    - Addresses organizational or market challenges
    - Includes business recommendations or action items
    Example indicators: market analysis, financial projections, strategic plans, ROI calculations
```

The prompt includes extensive differentiation criteria to help the LLM make fine-grained distinctions, such as the difference between technical and procedural documents or scientific and academic papers.

## The Challenge of Infinite Loops and Early Termination

One of the most vexing problems in developing the system was preventing "pathological" runs: those that either never terminate or stop prematurely without extracting sufficient content.

This challenge manifested in several ways:

1. **Unbounded Exploration**: The system could potentially continue finding new concepts indefinitely
2. **Circular References**: Topics referring back to each other created cycles in the exploration
3. **Premature Satisfaction**: The system might decide it had "enough" content before adequately covering the document
4. **Stalled Progress**: The system might get stuck generating repetitive content

Solving this required implementing multiple control mechanisms:

### Token Limits and Budgeting

At the technical level, the system implements sophisticated token tracking:

```python
class TokenUsageTracker:
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cost = 0
        self.call_counts = {}
        self.token_counts_by_task = {}
        self.cost_by_task = {}
        
        # Categorize tasks for better reporting
        self.task_categories = {
            'topics': ['extracting_main_topics', 'consolidating_topics', 'detecting_document_type'],
            'subtopics': ['extracting_subtopics', 'consolidate_subtopics'],
            'details': ['extracting_details', 'consolidate_details'],
            'similarity': ['checking_content_similarity'],
            'verification': ['verifying_against_source'],
            'emoji': ['selecting_emoji'],
            'other': []  # Catch-all for uncategorized tasks
        }
```

This tracking serves both cost control and termination purposes. By monitoring consumption across different categories, the system can enforce limits:

```python
# Set strict LLM call limits with increased bounds
max_llm_calls = {
    'topics': 20,      # Increased from 15
    'subtopics': 30,   # Increased from 20
    'details': 40      # Increased from 24
}
```

### Minimum Content Requirements

To prevent premature termination, the system implements minimum thresholds:

```python
# Set minimum content requirements with better distribution
min_requirements = {
    'topics': 4,       # Minimum topics to process
    'subtopics_per_topic': 2,  # Minimum subtopics per topic
    'details_per_subtopic': 3   # Minimum details per subtopic
}
```

These thresholds ensure the system doesn't terminate until it has extracted sufficient content to create a meaningful mindmap.

### Adaptive Exploration Strategy

Perhaps the most sophisticated mechanism is the adaptive exploration strategy. The system dynamically balances breadth (covering more topics) and depth (exploring topics in greater detail) based on document complexity.

This is implemented through a "sufficient content" heuristic:

```python
def has_sufficient_content():
    if completion_status['processed_topics'] < min_requirements['topics']:
        return False
    if completion_status['total_topics'] > 0:
        avg_subtopics_per_topic = (completion_status['processed_subtopics'] / 
                                completion_status['processed_topics'])
        if avg_subtopics_per_topic < min_requirements['subtopics_per_topic']:
            return False
    # Process at least 75% of available topics before considering early stop
    if completion_status['total_topics'] > 0:
        topics_processed_ratio = completion_status['processed_topics'] / completion_status['total_topics']
        if topics_processed_ratio < 0.75:
            return False
    return True
```

This function checks multiple criteria to determine if the current state of extraction is sufficient. It considers both absolute minimums and relative completeness, preventing both premature termination and endless exploration.

### Word Count Monitoring

Another critical mechanism is monitoring the overall word count:

```python
# Calculate document word count and set limit 
doc_words = len(document_content.split())
word_limit = min(doc_words * 0.9, 8000)  # Cap at 8000 words
current_word_count = 0

# Enhanced word limit check with buffer
if current_word_count > word_limit * 0.95:  # Increased from 0.9 to ensure more completion
    logger.info(f"Approaching word limit at {current_word_count}/{word_limit:.0f} words")
    break
```

This ensures the system doesn't generate more content than the original document, which would suggest potential confabulation.

## The Redundancy Problem: Fighting Against Information Duplication

One of the persistent challenges in developing the system was preventing redundancy, or the same information appearing multiple times in different parts of the mindmap. This is particularly difficult because:

1. Similar concepts might be expressed using different language
2. The same information might be relevant to multiple topics
3. Subtopics across different main topics might overlap
4. LLMs tend to repeat themselves when generating multiple items

Solving this required implementing multiple layers of redundancy detection:

### Multilevel Fuzzy Matching

The first line of defense is traditional fuzzy string matching:

```python
async def is_similar_to_existing(self, name: str, existing_names: Union[dict, set], content_type: str = 'topic') -> bool:
    """Check if name is similar to any existing names using stricter fuzzy matching thresholds."""
    # Lower thresholds to catch more duplicates
    base_threshold = {
        'topic': 75,      # Lower from 85 to catch more duplicates
        'subtopic': 70,   # Lower from 80 to catch more duplicates
        'detail': 65      # Lower from 75 to catch more duplicates
    }[content_type]
    
    # Get threshold for this content type
    threshold = base_threshold
    
    # Adjust threshold based on text length - be more lenient with longer texts
    if len(name) < 10:
        threshold = min(threshold + 10, 95)  # Stricter for very short texts
    elif len(name) > 100:
        threshold = max(threshold - 15, 55)  # More lenient for long texts
```

The system adjusts thresholds based on content type and text length, recognizing that different types of content have different natural levels of similarity. It then applies multiple similarity metrics:

```python
# Calculate multiple similarity metrics
basic_ratio = fuzz.ratio(name, existing_clean)
partial_ratio = fuzz.partial_ratio(name, existing_clean)
token_sort_ratio = fuzz.token_sort_ratio(name, existing_clean)
token_set_ratio = fuzz.token_set_ratio(name, existing_clean)
```

Each metric captures a different aspect of similarity, from character-level matching to token-level comparisons.

### LLM-Based Semantic Similarity

Fuzzy matching alone isn't sufficient to catch all redundancies, especially those expressed with different words but conveying the same concept. This is where LLM-based similarity detection comes in:

```python
async def check_similarity_llm(self, text1: str, text2: str, context1: str, context2: str) -> bool:
    """LLM-based similarity check between two text elements with stricter criteria."""
    prompt = f"""Compare these two text elements and determine if they express similar core information, making one redundant in the mindmap.

    Text 1 (from {context1}):
    "{text1}"

    Text 2 (from {context2}):
    "{text2}"

    A text is REDUNDANT if ANY of these apply:
    1. It conveys the same primary information or main point as the other text
    2. It covers the same concept from a similar angle or perspective
    3. The semantic meaning overlaps significantly with the other text
    4. A reader would find having both entries repetitive or confusing
    5. One could be safely removed without losing important information

    A text is DISTINCT ONLY if ALL of these apply:
    1. It focuses on a clearly different aspect or perspective
    2. It provides substantial unique information not present in the other
    3. It serves a fundamentally different purpose in context
    4. Both entries together provide significantly more value than either alone
    5. The conceptual overlap is minimal

    When in doubt, mark as REDUNDANT to create a cleaner, more focused mindmap.

    Respond with EXACTLY one of these:
    REDUNDANT (overlapping information about X)
    DISTINCT (different aspect: X)
```

This prompt instructs the LLM to perform a deep semantic comparison, looking not just at textual similarity but at conceptual overlap. The criteria are deliberately strict, favoring false positives (marking distinct content as redundant) over false negatives (missing redundancies).

### Batch Redundancy Processing

To make this process efficient, the system employs batch processing:

```python
async def _process_content_batch(self, content_items: List[ContentItem]) -> Set[int]:
    """Process a batch of content items to identify redundant content with parallel processing."""
    redundant_indices = set()
    comparison_tasks = []
    comparison_counter = 0
    
    # Create cache of preprocessed texts to avoid recomputing
    processed_texts = {}
    for idx, item in enumerate(content_items):
        # Normalize text for comparison
        text = re.sub(r'\s+', ' ', item.text.lower().strip())
        text = re.sub(r'[^\w\s]', '', text)
        processed_texts[idx] = text
    
    # Limit concurrent API calls
    semaphore = asyncio.Semaphore(10)  # Adjust based on API limits
```

This batching approach allows the system to efficiently process large numbers of comparisons in parallel, while still maintaining control over API usage through semaphores.

### Multi-Pass Filtering

The system implements multiple filtering passes at different stages:

1. **Early redundancy checks** during initial extraction
2. **Topic-level deduplication** to ensure main topics are distinct
3. **Subtopic filtering** across all topics
4. **Detail-level redundancy checks** within each subtopic
5. **Final full-hierarchy pass** to catch cross-level redundancies

This multi-layered approach ensures redundancy is caught at every level of the hierarchy.

## The Confabulation Problem: Ensuring Factual Accuracy

Perhaps the most insidious problem in LLM-based document analysis is what I would call "confabulation," or the generation of plausible-sounding content not supported by the source document. This is slightly different from the better known "hallucination" problem, because in many cases, these details might very well be true, but they are not contained in or derivable from the particular source document we are using. This happens because LLMs naturally fill in gaps based on their training data; that is, they already have all sorts of knowledge about the world, and sometimes can't help piping up when they think they can usefully add something. But this leads to some highly undesirable outcomes. For example, when we processed a document from 1914 (see below), before adding in the systems to avoid confabulation, the system would often add in details about statistics from 2023 or other anachronistic information.

To combat this, the Mindmap Generator implements a comprehensive verification system:

### Reality Checking Against Source

The core of this system is a verification process that checks every generated node against the original document:

```python
async def verify_mindmap_against_source(self, mindmap_data: Dict[str, Any], original_document: str) -> Dict[str, Any]:
    """Verify all mindmap nodes against the original document with lenient criteria and improved error handling."""
    try:
        logger.info("\n" + "="*80)
        logger.info(colored("🔍 STARTING REALITY CHECK TO IDENTIFY POTENTIAL CONFABULATIONS", "cyan", attrs=["bold"]))
        logger.info("="*80 + "\n")
```

The verification prompt carefully balances fact-checking against the need for reasonable interpretation:

```python
prompt = f"""You are an expert fact-checker verifying if information in a mindmap can be reasonably derived from the original document.

Task: Determine if this {node_type} is supported by the document text or could be reasonably inferred from it.

{node_type.title()}: "{node_text}"
Path: {path_str}

Document chunk:
{chunk}

VERIFICATION GUIDELINES:
1. The {node_type} can be EXPLICITLY mentioned OR reasonably inferred from the document, even through logical deduction
2. Logical synthesis, interpretation, and summarization of concepts in the document are STRONGLY encouraged
3. Content that represents a reasonable conclusion or implication from the document should be VERIFIED
4. Content that groups, categorizes, or abstracts ideas from the document should be VERIFIED
5. High-level insights that connect multiple concepts from the document should be VERIFIED
6. Only mark as unsupported if it contains specific claims that DIRECTLY CONTRADICT the document
7. GIVE THE BENEFIT OF THE DOUBT - if the content could plausibly be derived from the document, verify it
8. When uncertain, LEAN TOWARDS VERIFICATION rather than rejection - mindmaps are meant to be interpretive, not literal
9. For details specifically, allow for more interpretive latitude - they represent insights derived from the document
10. Consider historical and domain context that would be natural to include in an analysis
```

This prompt allows for reasonable interpretation and synthesis (a mindmap isn't meant to be a direct quote of the document) while still rejecting claims that contradict or aren't supported by the source.

### Verification Statistics Tracking

The system tracks detailed verification statistics:

```python
# Track verification statistics
verification_stats = {
    'total': len(all_nodes),
    'verified': 0,
    'not_verified': 0,
    'by_type': {
        'topic': {'total': 0, 'verified': 0},
        'subtopic': {'total': 0, 'verified': 0},
        'detail': {'total': 0, 'verified': 0}
    }
}
```

These statistics help assess the overall accuracy of the mindmap and identify potential issues.

### Parallel Processing with Rate Limiting

To optimize throughput while controlling costs, the system employs parallel processing with rate limiting:

```python
# Limit concurrent API calls
semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)

async def process_chunk(chunk: str) -> List[Dict[str, Any]]:
    """Process a single chunk with semaphore control."""
    async with semaphore:
        return await self._retry_with_exponential_backoff(
            lambda: extract_from_chunk(chunk)
        )

# Process chunks concurrently
chunk_results = await asyncio.gather(
    *(process_chunk(chunk) for chunk in content_chunks)
)
```

This approach maximizes throughput while preventing overloading of API limits.

### Progressive Exploration with Early Stopping

Rather than exhaustively analyzing the entire document, the system uses progressive exploration with early stopping:

```python
# Don't stop early if we haven't processed minimum topics
should_continue = (topic_idx <= min_requirements['topics'] or 
                not has_sufficient_content() or
                completion_status['processed_topics'] < len(main_topics) * 0.75)
                
if not should_continue:
    logger.info(f"Stopping after processing {topic_idx} topics - sufficient content gathered")
    break
```

This heuristic-based approach ensures the system focuses computational resources where they provide the most value.

## The Emoji Selection Subsystem

A seemingly minor but surprisingly complex component of the system is the emoji selection subsystem. This enhances the visual representation of concepts in the mindmap:

```python
async def _select_emoji(self, text: str, node_type: str = 'topic') -> str:
    """Select appropriate emoji for node content with persistent cache."""
    cache_key = (text, node_type)
    
    # First check in-memory cache
    if cache_key in self._emoji_cache:
        return self._emoji_cache[cache_key]
        
    # If not in cache, generate emoji
    try:
        prompt = f"""Select the single most appropriate emoji to represent this {node_type}: "{text}"

        Requirements:
        1. Return ONLY the emoji character - no explanations or other text
        2. Choose an emoji that best represents the concept semantically
        3. For abstract concepts, use metaphorical or symbolic emojis
        4. Default options if unsure:
        - Topics: 📄 (document)
        - Subtopics: 📌 (pin)
        - Details: 🔹 (bullet point)
        5. Be creative but clear - the emoji should intuitively represent the concept
```

This system includes:

1. Persistent caching to disk for reuse across runs
2. Node type-specific defaults
3. Fallback strategies for error conditions
4. Asynchronous cache saving to avoid blocking

The result is a visually enhanced mindmap where each concept has an intuitive emoji representation.

## Asynchronous Design Patterns

An important architectural decision was implementing the system using asynchronous programming patterns. This wasn't just for performance— it was essential for handling the complex dependencies and parallel operations:

```python
async def _retry_with_exponential_backoff(self, func, *args, **kwargs):
    """Enhanced retry mechanism with jitter and circuit breaker."""
    retries = 0
    max_retries = self.retry_config['max_retries']
    base_delay = self.retry_config['base_delay']
    max_delay = self.retry_config['max_delay']
    
    while retries < max_retries:
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            retries += 1
            if retries >= max_retries:
                raise
                
            delay = min(base_delay * (2 ** (retries - 1)), max_delay)
            actual_delay = random.uniform(0, delay)
            
            logger.warning(f"Attempt {retries}/{max_retries} failed: {str(e)}. "
                        f"Retrying in {actual_delay:.2f}s")
            
            await asyncio.sleep(actual_delay)
```

This exponential backoff pattern with jitter is a classic approach to handling transient failures in distributed systems. It allows the system to gracefully recover from API errors or rate limiting.

The system also uses semaphores to control concurrency:

```python
# Initialize concurrent processing controls
semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)
```

And employs event-based early stopping:

```python
early_stop = asyncio.Event()

async def process_chunk(chunk: str) -> List[Dict[str, Any]]:
    """Process a single chunk with semaphore control."""
    if early_stop.is_set():
        return []
        
    async with semaphore:
        chunk_details = await self._retry_with_exponential_backoff(
            lambda: extract_from_chunk(chunk)
        )
        
        # Check if we've reached minimum details
        if len(self._current_details) >= MINIMUM_VALID_DETAILS:
            early_stop.set()
        
        return chunk_details
```

These asynchronous patterns allow the system to efficiently manage complex dependencies while maximizing throughput.

## Output Formats and Visualization

The final challenge was presenting the extracted knowledge in useful formats. The system generates three complementary outputs:

### Mermaid Mindmap Syntax

The primary output is a Mermaid mindmap diagram (to see a real example, click [here](https://mermaid.live/edit#pako:eNqlWtuO3MYR_ZXGvIwEzC7WkmJ5901XywHsCFolARL5oYfsIdtLdtPd5IxGgt_y6CBA4pckCIwAcb7B3-MfiD8hp6ov5MzOaBfJQivscsju6qpTp04V9_2ssKWaXcxabcpWdm-MwNedOz9__5c_3L0bfktX_vyDeFZYY1tdCGlK8dI2uteFbMQTa7z6elCmUF7YlfitdNOHeQGs-K14pdeycVvxWPUbpYx4ZqqGlqLvT5VrpdkK6YUUT2Qvm63vxco6Xm53Nfr6_U9__fd_fvzTxAzZNFqSDQvhh6KmleKic6zZ6Mq0yvRio_taPBp877Q8eTGYSsIisiBag5txG_0Ltz53tCjf8WrwXsuFKJXqlFGlKPVae43j88fKwwzZ43pfK9FZWkTDMDrERrrTL4-f4jUeMHJNp3CtF05ix-VxLy1EJx1OPTTSNdvJMdXbThqyiOKgey9e6KoWlwq-eN4o1S9ErXClZ-vx_2h84RSbLoXHZcXPG7XWvVw2SiDwq0YX_cEz_Pz9dz-O2Chs26keMYERdPKqsUucq5XuSvVhL6e8HRyhRRs2YqWxswvoWFDglhaeN7Jn83AzTBa9Dcdj92qHjRpryL-q7TSW5KWB4xDaRpQwx1Ds9o0GGP_1j9Hg3wyNUU4uNQEpLnPZO3ijwqePEqqwNCGd3fABPOZl13vL4vHkRfHOGk4VHF74XrVi5WwLNHk3dIwfJ0slnB16QnNylwC-XKF7chFs3Ch5xXHUZuUkDj0U_eDUAl4CfNwS3jMVYLhWrt9G5_g-GLQ94BMk6GdtJ2EeYv8Fg_Gl3SgnEMhPQxBfs13soKHrgLwntcSid4-BgmCtWkthxNMRb7R8z3h3cLJeK6H9FJbLrXg6OGPXFoDurIMztng6PjVv9EqdwISTEoCtBZ27qho1_1C-nIoXClnrC6eXcDytA09cUbApZ7SPqboIKU-fl2oVEsJrHHklC3KmFPMVUdNcIDQAujrFEWH9eEZEoqU7B1Mq5wvr4naVk8ilbTpFRkKEs6gpT6NNlDXTBFgQwmvp9TtaubabSBUdRwfbG9uLrwB72NdbG1zFkVoOdK1UPdxAucChDavieT-4NeXcFAt37vz0t-8Ix4mrlzdxdQHXOawW8zyd7FoFiOvu1JCAsrTVdeqPsLtF2gVqNifBtHj8njhNUwptag0WQ4LJcg03yIo8GZ8RsnJEpSF54FIOjy-0HTwgblSF4AZatwDCGnZNWUatVWM7Ki1Ud6pKec47lc4ZaY3iJEXnbDmEDOtQuIqtKGqriV2QCjWi2ddkkNnh3qlHPkjEO75A8vjMYvsUoU3RDCXZSeAbzEob7Wsc8RUdh3aC73yiVPjy6wErwUjdbCT5pN9Yd7Vg2DaUuZ6rzWA6p1CaVGnoaTJYimeDs53CmVADd6FMe-O75WrTQok4o98xOnNaBxMaazmrjp0e7PXtHwFL22U1MPJ2SjGQl_EwqQ07YMvHmsq1m0AQ9ciKz4EFnbPkw_KDGK60xRCkhXSG0l1S1kUkBh6B5UNTkkRB9qZUwlYlDkOOraXztYCXwPKUrJ5ExhoRCySeE86UqUrQZXK5s4AIZ86V2sYqy45P6K6sLf0kUsnxE4D6K9Zt7c65k6_9raC2p6_SEVW7tE3JtL4vuXB6aYx6Kx5bjzLOZ3uh3Duk2xpWAKNNMzCCE-tlgYeUMFltoTxWexaHMO4eB7HxVFpY59CKe_X5uLKhEM-fAjwVqBO68ldULebiqaPShX3Imc8QKsrwVGPKEBKnCsVZ1tUKzsa3mchS4Wu96ilNisHTSlnRRG4glyCisK9VgdJAMVty6Zg_am2bIQG6mmZAyn5KAUpa1hioVr11_HnWirhEtRlhKg44Arn13Q_iMwg1R378tQExgOoubUGWvsr7L3KijSoCuUPq4YsUhMskP-7eJIWTNACflBxSlF4ftnR5yzmJquAEFWpbyLY9eYybknLf1ETv9EgrvSfP4NeSImkIHC3RQWB1z5Ky0VdKNEGzIvEA4GVwNl0Cma90f-KRvIgGQqP6nF3I3EoF5Q_94HEMWVKhwa0yPN3IJT4d2J2BMzbMEbg7eOmdijKJNjxYo68z2iPknU1F0E1JTYZ8OAmiAV0GMHq0VjOdPgsJdmjlHbq8fZGm0PbqLdiQMI2OMWijxFS266znxmFOmdSSl7iDIAnL5EL9UQEqNQlHnDUNQon4wMee7glgpMiZQJJ005xbMr9FuW1sxToMnQ7kB6K0qbGIkyvuToQuoaCYxEjZ2Y0BOZsylxGUMQuu1h1VvCgXsbcuQ5jmQRC2qpddzfHd1YFy6HGZzqd9Ce0caiTAutJFyvycvqFa563R84xNJc7Ea6MuBpyMXppPqgLO03IycOJUyAikP50-J1MIsb-pO-W4hQKXNCx0CYy0Xc1d3-4MQI4COuVeTGXW0SkRKKcGtCqhbZ-mRKATWqa1qNDIhpJQS5grZMfCiEoWXNjjmxa1Du44FZ9x-QMUlBfXGIO4gKpma5F0OJEj8UEZ5KP0D08QI3rgBOl1nAKquC9otgiY68ia0CdAUrai0xzAoPZ8f5K0QC3tDfWGvT0RV9cHCpE4Mrch6J9Dr2LXUA8nUxB6-IkcCumHgKXXA1QCWGbC2XTKRtfQCpzsqwqg13QLXLUOIaNOr4-7sZtl41FlySZrkon4MGYmgcCIoYO84DQ04rk27Ee9EpcbhXIjvrJYczwAEYDBen6v-OcbpjWbc5_bJDT6JLpDS0GxhxSBOVTokWeDixHZ7U9u4X_0ChYgV0nIlrprLHEtNJPswP4FadckefJohsmtGCs0aSGIa-BTJ3oi5yTWi6sW3P-skNMyMB0KV6u5IzTB264KhClTEEBM1PvRxKXFmh21wzvqi-c6WCkcgPBi2Rk4EiXmigwqm-0JCSsawCQu2DkQC7W11YhbqYg8w7CN6l_mqqNaMYxaDk1TaIGno0MvgxQCSkK7cPcWmrMlGLCUVEVtAq-Dez3CT3SKPg8-XMriCrRVxvyeNDO1kustc2_TKJo7IQg1sWk1UPYE-hlbqL3ehxB64gfNjgwDPpZpoW7h-a4JMwNUCe4HPESK2-lBVU4qUJwSfBl6cWyYzO2oeRoXmkiW4-wQuJCuINGXMLMzRcxFMzZXXrl10l3gWYRHRU8QDReOQ5XQFSaGXGPmg4Gtg6PJSFLpotwaif5ikesUbUJiCUec2AUlMUQ8rECSKiKUlemHkzRlEHzl4dA4xqXg8HFYFmA7qik0sZ1wu_Sddmm4wriIa_ig_Oj5Y6qP1kdJRzzVVXQbiiAPXVCYAEjeIWhDgoH1gX8msIzkNCnDQ0doxA86lgrAiQS6KvqYkiRUwQeIG4BTHm6Ad2YrO90wNyvOXxNyr-MI-DaiLUtxpqCdZfIkeYOsGDuzKDyXziLpxtkFrqMeh6qS-YCjYHkGkvHPWpVa4SzQw7SCEpirYJGnvn5YkYIiNt4tEikTeNawseNMzalVo4os2GkS7WChwbU4voCzsiljZ3Wbyp2GHFH0xdzg0Ti2HwvkJCd_CVFjUj_zHNGnlnJBo71goeyjBKQ5iQ-DQ7STJ8mpocbiDPjQx3FDQ00Hh8CHUVJulXNuauRmx70fwzHVKnQHOgppxrcMQ608Hc0BH0NzqPXY7VoYo-Nwihh_FwNJjOjcQKb2wJ6wf8BVR94uTVeelJVXahxMXG9Pj6x-A9saCmOjgO-9YVlqzdVE0iTsH5iM8ThsZywTlAPNUmXnk1Ql0UgvZHZHeHya3FzkQZ6roMCD9ipLMip-4nmgzQlSfHDY8SjNrfJ4KIrWzR6iwqwqzq94aB_rwi7fZ0eM2MStwBwQEqsjdwt7w6txJEs9URiaxpds05cbO_OOhMkD3Pj3f1L0Rhly6JXP0-jnJzUAqUwVXtmkGvM8ysqXPJm5jTqZqMUVpAM1cqMk58nddQ2ZSis2fonIRmp4rZf85i5BJcBCtzyzDXm_arj1ogfJk7EFOGXA8gug2tlN8DT2PEmnimV4ut8KYYKZHb14CYWLdEGv-1AB9_tZlKQxw2j9nWRubKDRUUWtLDjeNuWNoqbAs7F3on0eyyYp_McQVlfhnSaQGCk0w0IF54477r-HA_zQJelwuKKgbKQ3i97H5irnW0suiPXF20bGkWuYo43NGIvnvfea1wdQ8aUPVwcOw3QqfjwdRzRFlkaMw3tVRmN8D7HN3EbHyR0G9gM3c01MD1CrMBikS3yzmhiLfZa4an0gO5KMJvZapPlNoh0OCDbkvjsgNHBX2jbOM4k4Ai1FTsqEl493eAC5r23Gl_4g8yYfJ1dUOOwylZfcctzA61lN2m4IfRCzVtHEGTKsJweQ1s2vh7KkbBfz3ZBLpFY1qsqJcFx8uK8fReo4tZiW2czLYEi1joOTTa2RxcXB-SGPywCR1eBYXe2PTG_xlwn_TzdMbWtWMDk6UWechJ6Y_5IidcH6WBccQS77SSebWthjvStzU7ymWRdNehzPr17WWm1CgCormxvUXRpcJlo6MLL0_-vM8nazwgbFAEXxZNKQQcmGCRaSzZAqTnlJvueQ7Dp_OmNMNoUE9EQu05na1F-Ladc29oenX84Ws5b8rcvZxew9ue_NjF_rvZld4EcQqkQpfzN7Y77BrTiVvdyaYnYBLaMWM0d_3TG7WMH3-G3oSgTlqaYJYZtugTb7nbXTX2cX72dvZxf3Hp6dPvjk4wcPzh8-PD8_v__gF4vZFpfvnd679-Cjj--fnZ19dH52_tH9bxazd7zC2enD80_O8Anu_uTB_bOH59_8F4cLXVI)):

```python
def _generate_mermaid_mindmap(self, concepts: Dict[str, Any]) -> str:
    """Generate complete Mermaid mindmap syntax from concepts.
    
    Args:
        concepts (Dict[str, Any]): The complete mindmap concept hierarchy
        
    Returns:
        str: Complete Mermaid mindmap syntax
    """
    mindmap_lines = ["mindmap"]
    
    # Start with root node - ignore any name/text for root, just use document emoji
    self._add_node_to_mindmap({'name': ''}, mindmap_lines, indent_level=1)
    
    # Add all main topics under root
    for topic in concepts.get('central_theme', {}).get('subtopics', []):
        self._add_node_to_mindmap(topic, mindmap_lines, indent_level=2)
    
    return "\n".join(mindmap_lines)
```

This syntax is then transformed into an interactive HTML visualization:

```python
def generate_mermaid_html(mermaid_code):
    # Remove leading/trailing triple backticks if present
    mermaid_code = mermaid_code.strip()
    if mermaid_code.startswith('```') and mermaid_code.endswith('```'):
        mermaid_code = mermaid_code[3:-3].strip()
    # Create the data object to be encoded
    data = {
        "code": mermaid_code,
        "mermaid": {"theme": "default"}
    }
    json_string = json.dumps(data)
    compressed_data = zlib.compress(json_string.encode('utf-8'), level=9)
    base64_string = base64.urlsafe_b64encode(compressed_data).decode('utf-8').rstrip('=')
    edit_url = f'https://mermaid.live/edit#pako:{base64_string}'
    # Now generate the HTML template
    html_template = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mermaid Mindmap</title>
  <!-- Tailwind CSS -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <!-- Mermaid JS -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.min.js"></script>
  ...
```

### Markdown Outline

The system also generates a markdown outline for easy reference (to see a real example, click [here](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap_outline__deepseek.md)):

```python
def _convert_mindmap_to_markdown(self, mermaid_syntax: str) -> str:
    """Convert Mermaid mindmap syntax to properly formatted Markdown outline.
    
    Args:
        mermaid_syntax (str): The Mermaid mindmap syntax string
        
    Returns:
        str: Properly formatted Markdown outline
    """
    markdown_lines = []
    
    # Split into lines and process each (skip the 'mindmap' header)
    lines = mermaid_syntax.split('\n')[1:]
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue
            
        # Count indentation level (number of 4-space blocks)
        indent_level = len(re.match(r'^\s*', line).group()) // 4
        
        # Extract the content between node shapes
        content = line.strip()
        
        # Handle different node types based on indent level
        if indent_level == 1 and '((📄))' in content:  # Root node
            continue  # Skip the document emoji node
            
        elif indent_level == 2:  # Main topics
            # Extract content between (( and ))
            node_text = re.search(r'\(\((.*?)\)\)', content)
            if node_text:
                if markdown_lines:  # Add extra newline between main topics
                    markdown_lines.append("")
                current_topic = node_text.group(1).strip()
                markdown_lines.append(f"# {current_topic}")
                markdown_lines.append("")  # Add blank line after topic
                
        elif indent_level == 3:  # Subtopics
            # Extract content between ( and )
            node_text = re.search(r'\((.*?)\)', content)
            if node_text:
                if markdown_lines and not markdown_lines[-1].startswith("#"):
                    markdown_lines.append("")
                current_subtopic = node_text.group(1).strip()
                markdown_lines.append(f"## {current_subtopic}")
                markdown_lines.append("")  # Add blank line after subtopic
                
        elif indent_level == 4:  # Details
            # Extract content between [ and ]
            node_text = re.search(r'\[(.*?)\]', content)
            if node_text:
                detail_text = node_text.group(1).strip()
                markdown_lines.append(detail_text)
                markdown_lines.append("")  # Add blank line after each detail
```

These multiple formats ensure the extracted knowledge is accessible in different contexts and for different purposes.

## Performance and Results

The end result is a system that can efficiently process documents of arbitrary complexity and generate insightful mindmaps. Testing across different document types and LLM providers yielded some interesting insights:

1. **Provider Strengths**: Different LLM providers excel at different document types. For technical content, GPT models often produced more precise hierarchies, while Claude models excelled at narrative documents.

2. **Cost vs. Quality**: The system's optimizations allow it to work effectively with more affordable models, though premium models naturally produce higher quality results.

3. **Size Handling**: The system effectively handles documents of any size, from short articles to book-length manuscripts, maintaining consistent quality.

4. **Domain Adaptation**: The document-type detection system allows effective adaptation to various domains without requiring specialized training.

The most compelling validation came from the Durnovo Memo test case, a complex historical document that predicted World War I with remarkable accuracy. The system successfully extracted a comprehensive mindmap that captured the memo's key predictions and analyses, demonstrating its ability to handle sophisticated content.

## The Durnovo Memo: A Test Case Across LLM Providers

This repository includes a fascinating historical document as a test case - the famous Durnovo memo from 1914, which remarkably predicted World War I and the Russian Revolution. For more about this incredible document, see my article about it [here](/writing/the_most_impressive_prediction_of_all_time).

### Historical Significance

The [Durnovo Memorandum](sample_input_document_as_markdown__durnovo_memo.md) was written by Pyotr Durnovo, a Russian statesman, to Tsar Nicholas II in February 1914, months before the outbreak of World War I. With astonishing prescience, Durnovo warned about:

- The inevitability of war between Germany and Russia if European tensions continued
- How such a war would lead to social revolution in Russia
- The collapse of monarchies across Europe
- The specific dangers Russia faced in a prolonged European conflict

The memo has been hailed as one of the most accurate political predictions in modern history (indeed, the title of my article about it is *"The Most Impressive Prediction of All Time"*). It's long, complex, and makes sophisticated arguments based on evidence, logic, and analysis, all of which makes it an excellent test document for putting the mindmap generator through its paces.

### Cross-Provider Comparison

We've processed this document using all four supported LLM providers to demonstrate how each handles the complex historical content. The results showcase each provider's strengths and unique approaches to concept extraction and organization.

#### OpenAI (GPT-4o-mini)

OpenAI's model produced a concise, well-structured mindmap with clear hierarchical organization:

- [Mermaid Syntax](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__openai.txt) (2.8 KB)
- [Interactive HTML](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__openai.html) (5.7 KB)
- [Markdown Outline](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap_outline__openai.md) (2.5 KB)

GPT-4o-mini excels at producing compact, efficient mindmaps that capture essential concepts without redundancy. Its output is characterized by clear categorization and precise language. Best of all, it's incredibly fast and cheap.

#### Anthropic (Claude)

Claude produced a more detailed mindmap with richer contextual information:

- [Mermaid Syntax](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__anthropic.txt) (4.1 KB)
- [Interactive HTML](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__anthropic.html) (7.3 KB)
- [Markdown Outline](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap_outline__anthropic.md) (3.8 KB)

Claude's approach tends to include more nuanced historical context and captures subtle relationships between concepts. Its output is particularly strong in preserving the memo's analytical reasoning. The only problem is cost: it is many times more expensive than all the other options, but the results are not necessarily better.

#### DeepSeek

DeepSeek generated the most comprehensive mindmap with extensive subtopics and details:

- [Mermaid Syntax](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__deepseek.txt) (9.0 KB)
- [Interactive HTML](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__deepseek.html) (15 KB)
- [Markdown Outline](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap_outline__deepseek.md) (8.4 KB)

DeepSeek's output is notable for its thoroughness and depth of analysis, although I didn't like how it kept referencing "the text" in its extracted details, unlike the other models (this could easily be fixed by tweaking the prompts, though). It extracts more subtleties from the document and was generally very strong. The only issue I noticed in my testing was some performance and reliability issues with their API; it seemed to run much more slowly than, say, the OpenAI model.

#### Google Gemini

Gemini created a balanced mindmap with strong thematic organization:

- [Mermaid Syntax](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__gemini.txt) (5.5 KB)
- [Interactive HTML](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap__gemini.html) (9.6 KB)
- [Markdown Outline](https://raw.githubusercontent.com/Dicklesworthstone/mindmap-generator/main/mindmap_outputs/sample_input_document_as_markdown__durnovo_memo_mindmap_outline__gemini.md) (5.0 KB)

Although I am generally critical of Google's AI offerings when it comes to difficult coding challenges, I was pleasantly surprised by the quality of the output from Gemini, and it is the cheapest by far of the four models, with quite good performance. The main annoyance is how complicated and time-consuming it is to figure out how to get an API key that isn't rate-limited to death, which requires wading through endless, complex screens in their Google Cloud Console.

If someone from Google is reading this: you guys really need to simplify this process and make a simple, standalone API key available for people who just want to use the Gemini API without all the extra stuff. This isn't rocket science— you can literally just copy the interface from OpenAI, DeepSeek, or Anthropic for this. They've all figured out that you just need to make it really simple and obvious. You just need to get a credit card (or even use Google Pay) and generate an API key. It does not need to be integrated with the global system for all Google Cloud services on the front end (it can be on the backend, but that's an internal implementation detail and of no interest to potential users). You are preventing people from even trying your service my throwing up all these pointless barriers, presumably because of dysfunctional internal politics and bureaucracy.

### Key Observations from Cross-Provider Testing

This multi-provider approach reveals interesting patterns:

1. **Content Organization Differences**: Each provider structures the document's concepts differently, revealing their unique approaches to conceptual organization
2. **Detail Granularity Variance**: The level of detail varies significantly, with DeepSeek providing the most comprehensive extraction and OpenAI the most concise
3. **Emoji Selection Patterns**: Each model has distinct tendencies in selecting representative emojis for concepts
4. **Historical Context Sensitivity**: Models differ in how they handle historical context, with Claude showing particular strength in preserving historical nuance
5. **Structured Knowledge Representation**: The differences highlight various approaches to knowledge organization from the different AI research teams

The sample outputs serve as both demonstration of the tool's capabilities and an interesting comparative study of how different LLM providers approach the same complex historical document.

## Integrated Logging System for Process Visualization

The Mindmap Generator implements a sophisticated logging system that provides clear visibility into the complex internal processes. This system transforms diagnostic output into a functional interface that streamlines development and debugging:

```python
def get_logger():
    """Mindmap-specific logger with colored output for generation stages."""
    logger = logging.getLogger("mindmap_generator")
    if not logger.handlers:
        handler = logging.StreamHandler()
        
        # Custom formatter that adds colors specific to mindmap generation stages
        def colored_formatter(record):
            message = record.msg
            
            # Color-code specific mindmap generation stages and metrics
            if "Starting mindmap generation" in message:
                message = colored("🚀 " + message, "cyan", attrs=["bold"])
            elif "Detected document type:" in message:
                doc_type = message.split(": ")[1]
                message = f"📄 Document Type: {colored(doc_type, 'yellow', attrs=['bold'])}"
            # ...more color-coding logic...
```

The color-coded logging serves several practical purposes:

1. Creating visual separation between concurrent processes
2. Using color conventions to signal errors (red), warnings (yellow), and successes (green)
3. Employing emoji prefixes to mark different stages of mindmap generation
4. Visualizing progress metrics to track system advancement

In a system with multiple concurrent processes and non-linear execution flow, this logging approach creates a comprehensible narrative of the system's operation. It transforms raw diagnostic information into a readable process visualization, significantly improving debugging efficiency and system monitoring capabilities. To see what the logging output looks like in practice, see [here](https://github.com/Dicklesworthstone/mindmap-generator/raw/refs/heads/main/screenshots/logging_output_during_run.webp).

## Semantic Boundary Preservation in Text Chunking

To avoid overwhelming the model's context windows (and even if we can fit within the context windows, with these "value priced" models, the more context you use, the worse the models perform in a very drastic way), we employ a text chunking strategy that goes well beyond simple character-count splitting. This approach recognizes that proper handling of document boundaries is crucial for maintaining semantic coherence:

```python
# Create overlapping chunks with boundary optimization
chunk_size = min(8000, len(content) // 3) if len(content) > 6000 else 4000
overlap = 250  # Characters of overlap between chunks

# Create overlapping chunks
content_chunks = []
start = 0
while start < len(content):
    end = min(start + chunk_size, len(content))
    # Extend to nearest sentence end if possible
    if end < len(content):
        next_period = content.find('.', end)
        if next_period != -1 and next_period - end < 200:  # Don't extend too far
            end = next_period + 1
    chunk = content[start:end]
    content_chunks.append(chunk)
    start = end - overlap if end < len(content) else end
```

This chunking implementation includes several technical innovations:

1. Adaptive sizing that adjusts chunk size based on document length
2. Boundary detection that extends chunks to coincide with sentence endings
3. Controlled overlap to maintain context between adjacent chunks
4. Safeguards against excessive chunk growth when seeking sentence boundaries

By preserving semantic units and maintaining context across chunk boundaries, this approach significantly improves concept extraction quality compared to fixed-size chunking methods. It demonstrates how fundamental operations like text splitting require careful engineering in LLM applications to maintain semantic integrity.

## Multi-Metric Similarity Detection for Redundancy Elimination

We also implement a fairly sophisticated redundancy detection system that combines multiple similarity metrics to identify conceptual duplicates even when they use different phrasing:

```python
# Calculate multiple similarity metrics
basic_ratio = fuzz.ratio(name, existing_clean)
partial_ratio = fuzz.partial_ratio(name, existing_clean)
token_sort_ratio = fuzz.token_sort_ratio(name, existing_clean)
token_set_ratio = fuzz.token_set_ratio(name, existing_clean)

# For numbered items, compare without numbers
existing_without_number = numbered_pattern.sub(r'\1', existing_clean)
if name_without_number != name or existing_without_number != existing_clean:
    number_ratio = fuzz.ratio(name_without_number, existing_without_number)
    basic_ratio = max(basic_ratio, number_ratio)

# Weight ratios differently based on content type
if content_type == 'topic':
    final_ratio = max(
        basic_ratio,
        token_sort_ratio * 1.1,  # Increased weight
        token_set_ratio * 1.0    # Increased weight
    )
```

The system incorporates several advanced techniques:

1. Content-specific thresholds that adjust based on whether comparisons involve topics, subtopics, or details
2. Length-adaptive thresholds that apply different standards to short versus long text
3. Special case handling for numbered items to properly compare content like "1. Introduction" vs "2. Overview"
4. Weighted combinations of different similarity metrics optimized for each content type
5. Multi-stage filtering that uses computationally efficient methods before more expensive semantic comparisons

This approach addresses the complex challenge of identifying when differently worded concepts express the same fundamental idea. It demonstrates the technical sophistication required to identify semantic redundancy across varying phrasings and contexts.

## Incremental Processing with Adaptive Early Termination

The Mindmap Generator implements an efficient incremental processing system that continuously evaluates when additional computation would yield diminishing returns:

```python
# Continue processing based on multiple criteria
should_continue = (topic_idx <= min_requirements['topics'] or 
                not has_sufficient_content() or
                completion_status['processed_topics'] < len(main_topics) * 0.75)
                
if not should_continue:
    logger.info(f"Stopping after processing {topic_idx} topics - sufficient content gathered")
    break
```

The early termination logic incorporates several technical considerations:

1. Minimum content requirements ensure basic coverage across topics and subtopics:
   ```python
   min_requirements = {
       'topics': 4,       # Minimum topics to process
       'subtopics_per_topic': 2,  # Minimum subtopics per topic
       'details_per_subtopic': 3   # Minimum details per subtopic
   }
   ```

2. Content balance evaluation tracks whether extracted content maintains appropriate distribution:
   ```python
   def has_sufficient_content():
       if completion_status['processed_topics'] < min_requirements['topics']:
           return False
       if completion_status['total_topics'] > 0:
           avg_subtopics_per_topic = (completion_status['processed_subtopics'] / 
                                   completion_status['processed_topics'])
           if avg_subtopics_per_topic < min_requirements['subtopics_per_topic']:
               return False
       # ... more checks ...
   ```

3. Proportional coverage ensures processing of at least 75% of identified topics before considering termination

4. Document-proportional word limits prevent generating content that exceeds appropriate bounds:
   ```python
   # Calculate document word count and set limit 
   doc_words = len(document_content.split())
   word_limit = min(doc_words * 0.9, 8000)  # Cap at 8000 words
   ```

This adaptive approach optimizes computational resource allocation by focusing processing on areas that provide the greatest value. It exemplifies the classic computer science tradeoff between exploration (examining more content) and exploitation (analyzing specific content in greater depth).

## Structural Integrity Preservation During Verification

The verification system in the Mindmap Generator incorporates sophisticated logic to maintain structural coherence even when strict verification would otherwise create fragmented outputs:

```python
# Apply structure preservation when verification would remove too much content
min_topics_required = 3
min_verification_ratio = 0.4  # Lower threshold - only filter if less than 40% verified

# Count verified topics
verified_topics = len([n for n in all_nodes if n.get('type') == 'topic' and n.get('verified', False)])

# If verification removed too much content, we need to preserve structure
if verified_topics < min_topics_required or verification_percentage < min_verification_ratio * 100:
    logger.warning(f"Verification would remove too much content (only {verified_topics} topics verified). Using preservation mode.")
    
    # Mark important structural nodes as verified to preserve mindmap structure
    for node in all_nodes:
        # Always keep root and topic nodes
        if node.get('type') in ['root', 'topic']:
            node['verified'] = True
        # Keep subtopics with a high enough importance
        elif node.get('type') == 'subtopic' and not node.get('verified', False):
            # Keep subtopics if they have verified details or are needed for structure
            has_verified_details = any(
                n.get('verified', False) and n.get('type') == 'detail' and n.get('path') == node.get('path', []) + [node.get('text', '')]
                for n in all_nodes
            )
            if has_verified_details:
                node['verified'] = True
```

This implementation provides several technical advantages:

1. Minimum viable structure requirements (at least 3 topics, at least 40% verified content)
2. Hierarchical verification influence, where verified details can preserve parent subtopics
3. Graceful degradation that maintains structural integrity even with partial verification
4. Explicit thresholds that make preservation behavior predictable and adjustable
5. Transparent logging when preservation mode activates

This approach illustrates the engineering challenge of balancing competing requirements - in this case, factual accuracy versus structural coherence. The system resolves this tension through nuanced preservation strategies that maintain output utility even when strict verification cannot be fully achieved.

## Cost-Efficiency Implementation

Another challenge was balancing the quality of extraction against computational cost. LLM API calls can get expensive, especially when you're making hundreds or even thousands of them, and naive implementations could easily rack up substantial costs.

The system implements multiple cost-optimization strategies:

### Provider-Specific Adjustments

First, we estimate the rough cost of each LLM API call based on the provider's pricing model and the purpose of the call within the larger system:

```python
# Cost tracking (prices in USD per token)
OPENAI_INPUT_TOKEN_PRICE = 0.15/1000000  # GPT-4o-mini input price
OPENAI_OUTPUT_TOKEN_PRICE = 0.60/1000000  # GPT-4o-mini output price
ANTHROPIC_INPUT_TOKEN_PRICE = 0.80/1000000  # Claude 3.5 Haiku input price
ANTHROPIC_OUTPUT_TOKEN_PRICE = 4.00/1000000  # Claude 3.5 Haiku output price
DEEPSEEK_CHAT_INPUT_PRICE = 0.27/1000000  # Chat input price (cache miss)
DEEPSEEK_CHAT_OUTPUT_PRICE = 1.10/1000000  # Chat output price
DEEPSEEK_REASONER_INPUT_PRICE = 0.14/1000000  # Reasoner input price (cache miss)
DEEPSEEK_REASONER_OUTPUT_PRICE = 2.19/1000000  # Reasoner output price (includes CoT)
GEMINI_INPUT_TOKEN_PRICE = 0.075/1000000  # Gemini 2.0 Flash Lite input price estimate
GEMINI_OUTPUT_TOKEN_PRICE = 0.30/1000000  # Gemini 2.0 Flash Lite output price estimate
```

The Mindmap Generator implements precise cost tracking and optimization techniques to maximize output quality while minimizing API expenses.

The system employs multiple cost-optimization techniques:

1. Provider-specific cost calculations that account for different pricing models
2. Extensive caching to prevent redundant API calls (similar caching is implemented for topics, subtopics, details, and even emoji selections):
```python
# Check cache first for document type with strict caching
doc_type_key = hashlib.md5(document_content[:1000].encode()).hexdigest()
if doc_type_key in self._content_cache:
    doc_type = self._content_cache[doc_type_key]
else:
    doc_type = await self.detect_document_type(document_content, request_id)
    self._content_cache[doc_type_key] = doc_type
    self._llm_calls['topics'] += 1
```

3. Concurrency control using semaphores to optimize throughput while respecting rate limits:
   ```python
   # Limit concurrent API calls
   semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)
   ```

4. Statistical tracking that breaks down token usage by task category:
   ```python
   self.task_categories = {
       'topics': ['extracting_main_topics', 'consolidating_topics', 'detecting_document_type'],
       'subtopics': ['extracting_subtopics', 'consolidate_subtopics'],
       'details': ['extracting_details', 'consolidate_details'],
       'similarity': ['checking_content_similarity'],
       'verification': ['verifying_against_source'],
       'emoji': ['selecting_emoji'],
       'other': []  # Catch-all for uncategorized tasks
   }
   ```

5. Early stopping mechanisms that terminate processing when additional computation would yield minimal improvements

This comprehensive approach to cost management enables efficient utilization of LLM capabilities while maintaining predictable and reasonable expenses. The detailed token tracking also provides transparency into how computational resources are allocated across different system components.

## Detailed Token Usage Reporting

We include a comprehensive token usage reporting system that provides fine-grained analytics on system operation:

```python
def print_usage_report(self):
    """Print a detailed usage report to the console."""
    summary = self.get_enhanced_summary()
    
    # Helper to format USD amounts
    def fmt_usd(amount):
        return f"${amount:.6f}"
    
    # Helper to format percentages
    def fmt_pct(percentage):
        return f"{percentage:.2f}%"
    
    # Helper to format numbers with commas
    def fmt_num(num):
        return f"{num:,}"
    
    # Find max task name length for proper column alignment
    max_task_length = max([len(task) for task in summary['calls_by_task'].keys()], default=30)
    task_col_width = max(max_task_length + 2, 30)
    
    report = [
        "\n" + "="*80,
        colored("📊 TOKEN USAGE AND COST REPORT", "cyan", attrs=["bold"]),
        "="*80,
        "",
        f"Total Tokens: {fmt_num(summary['total_tokens'])} (Input: {fmt_num(summary['total_input_tokens'])}, Output: {fmt_num(summary['total_output_tokens'])})",
        f"Total Cost: {fmt_usd(summary['total_cost_usd'])}",
        f"Total API Calls: {fmt_num(summary['total_calls'])}",
        "",
        colored("BREAKDOWN BY CATEGORY", "yellow", attrs=["bold"]),
        "-"*80,
        "Category".ljust(15) + "Calls".rjust(10) + "Call %".rjust(10) + "Tokens".rjust(12) + "Token %".rjust(10) + "Cost".rjust(12) + "Cost %".rjust(10),
        "-"*80
    ]
```

The reporting system provides several analytical capabilities:

1. Category-based metrics that group related operations (topics, subtopics, details, verification)
2. Properly formatted financial calculations showing precise costs to six decimal places
3. Proportional analysis showing percentage breakdowns of calls, tokens, and costs
4. Sorting by cost to highlight the most expensive operations first
5. Consistent tabular formatting with careful alignment for readability

The enhanced summary generation function provides a structured data representation:

```python
def get_enhanced_summary(self) -> Dict[str, Any]:
    """Get enhanced usage summary with category breakdowns and percentages."""
    total_calls = sum(self.call_counts.values())
    total_cost = sum(self.cost_by_task.values())
    
    # Calculate percentages for call counts by category
    call_percentages = {}
    for category, count in self.call_counts_by_category.items():
        call_percentages[category] = (count / total_calls * 100) if total_calls > 0 else 0
        
    # Calculate percentages for token counts by category
    token_percentages = {}
    for category, counts in self.token_counts_by_category.items():
        total_tokens = counts['input'] + counts['output']
        token_percentages[category] = (total_tokens / (self.total_input_tokens + self.total_output_tokens) * 100) if (self.total_input_tokens + self.total_output_tokens) > 0 else 0
        
    # Calculate percentages for cost by category
    cost_percentages = {}
    for category, cost in self.cost_by_category.items():
        cost_percentages[category] = (cost / total_cost * 100) if total_cost > 0 else 0
    
    return {
        "total_input_tokens": self.total_input_tokens,
        "total_output_tokens": self.total_output_tokens,
        "total_tokens": self.total_input_tokens + self.total_output_tokens,
        "total_cost_usd": round(self.total_cost, 6),
        "total_calls": total_calls,
        "calls_by_task": dict(self.call_counts),
        "token_counts_by_task": self.token_counts_by_task,
        "cost_by_task": {task: round(cost, 6) for task, cost in self.cost_by_task.items()},
        "categories": {
            category: {
                "calls": count,
                "calls_percentage": round(call_percentages[category], 2),
                "tokens": self.token_counts_by_category[category],
                "tokens_percentage": round(token_percentages[category], 2),
                "cost_usd": round(self.cost_by_category[category], 6),
                "cost_percentage": round(cost_percentages[category], 2)
            }
            for category, count in self.call_counts_by_category.items()
        }
    }
```

This detailed reporting serves multiple practical purposes:

1. Cost optimization by identifying the most expensive operations
2. Performance tuning by highlighting operations with high token consumption
3. Architectural refinement by revealing patterns in API usage
4. Budget planning by providing accurate cost projections

The token usage reporting system exemplifies how instrumentation and analytics can provide valuable insights into complex system operations, enabling data-driven optimization and performance tuning. You can see an example of what the token tracking looks like in practice [here](https://github.com/Dicklesworthstone/mindmap-generator/raw/refs/heads/main/screenshots/token_usage_report.webp).

## Node Shape System for Visual Hierarchy

The Mindmap Generator implements a formal node shape system that enhances the visual hierarchy of the generated mindmaps:

```python
class NodeShape(Enum):
    """Enumeration of node shapes for the mindmap structure."""
    ROOT = '(())'        # Double circle for root node (📄)
    TOPIC = '(())'       # Double circle for main topics
    SUBTOPIC = '()'      # Single circle for subtopics
    DETAIL = '[]'        # Square brackets for details

    def apply(self, text: str) -> str:
        """Apply the shape to the text."""
        return {
            self.ROOT: f"(({text}))",
            self.TOPIC: f"(({text}))",
            self.SUBTOPIC: f"({text})",
            self.DETAIL: f"[{text}]"
        }[self]
```

This shape system is applied systematically when generating the Mermaid mindmap syntax:

```python
def _format_node_line(self, node: Dict[str, Any], indent_level: int) -> str:
    """Format a single node in Mermaid syntax."""
    indent = '    ' * indent_level
    
    # For root node, always return just the document emoji
    if indent_level == 1:
        return f"{indent}((📄))"
    
    # Get the node text and escape it
    if 'text' in node:
        # For detail nodes
        importance = node.get('importance', 'low')
        marker = {'high': '♦️', 'medium': '🔸', 'low': '🔹'}[importance]
        text = self._escape_text(node['text'])
        return f"{indent}[{marker} {text}]"
    else:
        # For topic and subtopic nodes
        node_name = self._escape_text(node['name'])
        emoji = node.get('emoji', '')
        if emoji and node_name:
            node_name = f"{emoji} {node_name}"
        
        # For main topics (level 2)
        if indent_level == 2:
            return f"{indent}(({node_name}))"
        
        # For subtopics (level 3)
        return f"{indent}({node_name})"
```

The node shape system provides several visual benefits:

1. Clear hierarchical distinction between different levels of information
2. Visual grouping through consistent shape usage at each level
3. Importance indicators for details through differentiated markers (♦️, 🔸, 🔹)
4. Consistent indentation that reinforces the hierarchical structure
5. Special handling for the root node to create a visually distinct starting point

The system also includes careful text escaping to ensure proper rendering:

```python
def _escape_text(self, text: str) -> str:
    """Replace parentheses with Unicode alternatives and handle other special characters."""
    # Replace regular parentheses in content text with Unicode alternatives
    for original, replacement in self.paren_replacements.items():
        text = text.replace(original, replacement)
        
    # Handle percentages
    text = self.percentage_regex1.sub(r'\1%', text)
    text = self.percentage_regex2.sub('%', text)
    
    # Replace special characters while preserving needed symbols
    text = self.special_chars_regex.sub('', text)
    
    # Clean up multiple backslashes
    text = self.backslash_regex.sub(r'\\', text)
    
    return text
```

This escaping logic prevents syntax conflicts between content and Mermaid's structural markers, ensuring reliable rendering regardless of the content's complexity.

The result is a visually structured mindmap where the hierarchy is immediately apparent through consistent shape conventions, enhancing readability and information access.

## Document Type-Specific Prompt Templates

The Mindmap Generator implements a comprehensive system of document type-specific prompts that adapt extraction strategies based on document structure:

```python
def _initialize_prompts(self) -> None:
    """Initialize type-specific prompts from a configuration file or define them inline."""
    self.type_specific_prompts = {
        DocumentType.TECHNICAL: {
            'topics': """Analyze this technical document focusing on core system components and relationships.
            
First, identify the major architectural or technical components that form complete, independent units of functionality.
Each component should be:
- A distinct technical system, module, or process
- Independent enough to be understood on its own
- Critical to the overall system functionality
- Connected to at least one other component

Avoid topics that are:
- Too granular (implementation details)
- Too broad (entire system categories)
- Isolated features without system impact
- Pure documentation elements

Think about:
1. What are the core building blocks?
2. How do these pieces fit together?
3. What dependencies exist between components?
4. What are the key technical boundaries?

Format: Return a JSON array of component names that represent the highest-level technical building blocks.""",
```

This template system includes specialized prompts for multiple document types, including:

1. Technical documents focusing on system components and interfaces
2. Scientific documents emphasizing research methodologies and results
3. Narrative documents highlighting plot elements and character development
4. Business documents extracting strategic initiatives and market opportunities
5. Academic documents focusing on theoretical frameworks and scholarly arguments
6. Legal documents identifying principles, rights, and obligations
7. Medical documents emphasizing clinical approaches and treatment protocols
8. Instructional documents extracting learning objectives and skill development

Each document type has tailored prompts for three extraction levels:

1. Topics: The main conceptual areas of the document
2. Subtopics: Supporting elements for each main topic
3. Details: Specific facts, examples, or explanations for each subtopic

The system automatically falls back to general prompts when needed:

```python
# Add default prompts for any missing document types
for doc_type in DocumentType:
    if doc_type not in self.type_specific_prompts:
        self.type_specific_prompts[doc_type] = self.type_specific_prompts[DocumentType.GENERAL]
```

This approach enables the system to adapt its extraction strategy based on the document's structure and purpose. A technical document is analyzed differently from a narrative document, with extraction focused on the elements most relevant to that document type.

The type-specific templates represent a form of domain knowledge encoding - they embed understanding of different document structures directly into the extraction process, significantly improving the quality and relevance of the generated mindmaps.

## JSON Response Parsing and Error Recovery

The Mindmap Generator implements a robust system for parsing and normalizing JSON responses from LLMs, with extensive error recovery mechanisms:

```python
def _clean_json_response(self, response: str) -> str:
    """Enhanced JSON response cleaning with advanced recovery and validation."""
    if not response or not isinstance(response, str):
        logger.warning("Empty or invalid response type received")
        return "[]"  # Return empty array as safe default
        
    try:
        # First try to find complete JSON structure
        def find_json_structure(text: str) -> Optional[str]:
            # Look for array pattern
            array_match = re.search(r'\[[\s\S]*?\](?=\s*$|\s*[,}\]])', text)
            if array_match:
                return array_match.group(0)
                
            # Look for object pattern
            object_match = re.search(r'\{[\s\S]*?\}(?=\s*$|\s*[,\]}])', text)
            if object_match:
                return object_match.group(0)
            
            return None

        # Handle markdown code blocks first
        if '```' in response:
            code_blocks = re.findall(r'```(?:json)?([\s\S]*?)```', response)
            if code_blocks:
                for block in code_blocks:
                    if json_struct := find_json_structure(block):
                        response = json_struct
                        break
        else:
            if json_struct := find_json_structure(response):
                response = json_struct
```

The system includes multiple layers of error handling:

1. Character cleaning for problematic control characters and quotes:
   ```python
   # Remove control characters while preserving valid whitespace
   text = self.control_chars_regex.sub('', text)
   
   # Normalize quotes and apostrophes
   text = text.replace('"', '"').replace('"', '"')  # Smart double quotes to straight double quotes
   text = text.replace(''', "'").replace(''', "'")  # Smart single quotes to straight single quotes
   text = text.replace("'", '"')  # Convert single quotes to double quotes
   ```

2. JSON syntax fixing for common structural issues:
   ```python
   # Fix trailing/multiple commas
   text = re.sub(r',\s*([\]}])', r'\1', text)  # Remove trailing commas
   text = re.sub(r',\s*,', ',', text)  # Remove multiple commas
   
   # Fix missing quotes around keys
   text = re.sub(r'(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', text)
   ```

3. Bracket balancing for unclosed structures:
   ```python
   # Ensure proper array/object closure
   brackets_stack = []
   for char in text:
       if char in '[{':
           brackets_stack.append(char)
       elif char in ']}':
           if not brackets_stack:
               continue  # Skip unmatched closing brackets
           if (char == ']' and brackets_stack[-1] == '[') or (char == '}' and brackets_stack[-1] == '{'):
               brackets_stack.pop()
           
   # Close any unclosed brackets
   while brackets_stack:
       text += ']' if brackets_stack.pop() == '[' else '}'
   ```

4. Structure normalization to ensure consistent formats:
   ```python
   def normalize_structure(text: str) -> str:
       try:
           # Try parsing to validate
           parsed = json.loads(text)
           
           # Ensure we have an array
           if isinstance(parsed, dict):
               # Convert single object to array
               return json.dumps([parsed])
           elif isinstance(parsed, list):
               return json.dumps(parsed)
           else:
               return json.dumps([str(parsed)])
               
       except json.JSONDecodeError:
           # If still invalid, attempt emergency recovery
           if text.strip().startswith('{'):
               return f"[{text.strip()}]"  # Wrap object in array
           elif not text.strip().startswith('['):
               return f"[{text.strip()}]"  # Wrap content in array
           return text
   ```

5. Final validation with safe fallbacks:
   ```python
   # Final validation
   try:
       json.loads(response)  # Verify we have valid JSON
       return response
   except json.JSONDecodeError as e:
       logger.warning(f"Final JSON validation failed: {str(e)}")
       # If all cleaning failed, return empty array
       return "[]"
   ```

This comprehensive approach to JSON parsing addresses the common challenge of inconsistent LLM outputs. Rather than failing on imperfect responses, the system implements multiple recovery strategies that transform problematic text into usable data structures. This error recovery capability is essential for maintaining system reliability when working with inherently variable LLM outputs.

## Conclusion: Beyond Traditional LLM Applications

The Mindmap Generator represents a departure from conventional approaches to LLM applications. Rather than treating LLMs as simple text-in/text-out systems, it leverages them as components in a sophisticated cognitive architecture.

The key insights from this project have broader implications for LLM application development:

1. **Non-Linear Architectures**: Complex tasks benefit from non-linear architectures with feedback loops and adaptive exploration.

2. **Specialized Task Decomposition**: Breaking complex tasks into highly specialized subtasks allows for more precise control and better results.

3. **Verification as First-Class Concern**: Fact-checking and verification should be core components, not afterthoughts.

4. **Cost as Design Constraint**: API costs should be treated as fundamental design constraints, driving architectural decisions.

5. **Rich Visualization**: The value of LLM-extracted knowledge is amplified through appropriate visualization and presentation.

Perhaps most importantly, this project demonstrates that with careful engineering, LLMs can be guided to perform complex structural tasks that go far beyond the simple text generation they're typically used for. The future of LLM applications lies not in prompting wizardry, but in sophisticated architectures that combine LLM capabilities with traditional software engineering principles.

---

Thanks for reading this blog post! I hope you enjoyed it. If you did, I would really appreciate it if you checked out my web app, [FixMyDocuments.com](https://fixmydocuments.com/). It's a very useful service that leverages powerful AI tools to transform your documents from poorly formatted or scanned PDFs into beautiful, markdown formatted versions that can be easily edited and shared. Once you have processed a document, you can generate all sorts of derived documents from it with a single click, including:

* Real interactive multiple choice quizzes you can take and get graded on (and share with anyone using a publicly accessible custom hosted URL).
* Anki flashcards for studying, with a slick, interactive interface (and which you can also share with others).
* A slick HTML presentation slide deck based on your document, or a PDF presentation formatted using LaTeX.
* A really detailed and penetrating executive summary of your document.
* Comprehensive "mindmap" diagrams and outlines that explore your document thoroughly.
* Readability analysis and grade level versions of your original document.
* Lesson plans generated from your document, where you can choose the level of the target audience.

It's useful for teachers, tutors, business people, and more. When you sign up using a Google account, you get enough free credits that let you process several documents. Give it a try!