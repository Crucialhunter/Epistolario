# PaleoBench Transcription Presets & Engines

PaleoBench supports different "Engines" (execution presets) for benchmarking AI transcription capabilities. Each engine optimizes for a specific tradeoff between thoroughness, accuracy, and speed.

## Supported Engines

### 1. Unified Engine (Smart - 1 API Call)
The **Unified Engine** is the default general-purpose engine. It is designed to extract everything in a single LLM API call, maximizing context retention while saving time and tokens.

- **Prompt**: Requests a comprehensive JSON object containing `idioma_detectado`, `metadatos`, `transcripcion_literal`, and `transcripcion_modernizada`.
- **Output**: Full JSON extraction.
- **Performance**: Balanced. 1 API call per document. Token usage is higher per-call but overall throughput is optimized.

### 2. FAST Engine (Speed - Modernizada Only)
The **FAST Engine** is heavily optimized for speed and cost. Instead of requiring the dense, computationally heavy literal transcription or the metadata extraction, it requests a minimal schema.

- **Prompt**: Requests ONLY `idioma_detectado` and `transcripcion_modernizada`.
- **Output**: Minimal JSON.
- **Performance**: Extremely fast. Requires only 1 rapid API call per document, minimizing token generation time. Ideal for bulk processing where strict academic literal formatting is not needed immediately.

### 3. Split Engine (Legacy - 2 API Calls)
The **Split Engine** is the legacy method of processing. It processes paleographic transcriptions in two isolated cycles.

- **Prompt**: Separate prompts for `literal` and `modernizada` passes.
- **Output**: Raw string text (legacy mode).
- **Performance**: Slow. Takes 2 separate API calls per document. Context from one generation (e.g. literal) isn't necessarily passed properly onto the next without string concatenation overhead. Less efficient than Unified.

---

## The Precompute Pipeline & Recovery Fallbacks

The LLM pipeline internally executes several stability and recovery routines ensuring the AI engines output stable benchmark data.

#### Configurable Retry Policy
Every preset contains natively configurable retry policies:
- **Max Retries**: Default 3. How many times the LLM API is allowed to fail (timeouts, 503s, invalid formats) before the task hard fails.
- **Backoff Increment**: Default 2000ms. Incremental sleep timer added to retries strictly increasing safety buffer intervals upon rate-limits.

#### Badges & Passes Tracking
When viewing the "Benchmark Queue" or the "Document Inspector", you'll often see distinct colored badges indicating exactly how the LLM performed a task:
- `P1`: The initial prompt extraction pass completely succeeded natively on Attempt 1.
- `P2`: The task took 2 logical passes to complete, usually because the initial JSON generation failed and triggered an invisible recovery prompt.
- `OCR (Red Badge)`: This indicates that the AI model failed to produce structured JSON natively, and instead hallucinated an array of bounding boxes `("box_2d", "text_content")`. The system successfully detected this, concatenated the layout boxes chronologically, and executed an invisible secondary "P2 textual formatting" pass recovering structured layout cleanly.
- `FAST (Green Badge)`: Engine explicit flag for benchmarking speeds natively.

#### Array Recovery 
Sometimes the LLM correctly parses the text but decides to return an array of JSON objects (e.g., `[ { ... }, { ... } ]`) where one structure is "attempting" the format or where it lists out languages. The `precompute.ts` pipeline aggressively filters these arrays, mathematically selecting the object that contains the longest transcribed text volume (`transcripcion_modernizada`) as the definitive 'best' output object.
