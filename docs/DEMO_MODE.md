# Demo Mode

## What it does

Demo Mode allows you to run benchmarks **without calling any API**. Instead, it uses the Ground Truth *modernizada* text as the prediction. This is useful for:

- Demoing the application when API keys are invalid, expired, or missing
- Testing the end-to-end pipeline without spending API credits
- Validating that the UI correctly displays results, diffs, and scores

## How to activate

1. Go to **Settings**
2. Toggle the **Demo Mode** switch to ON
3. Run a benchmark as normal (via the Run Benchmark modal)

## What happens

- Tasks will show `🧪 DEMO MODE` in their logs
- Results are saved to the database with `_source: "ground_truth_demo"`
- The Workspace detail view shows a **DEMO** badge next to the model metrics
- CER and WER will be **0%** (since prediction = ground truth)
- Token count and latency will be **0** (no API call made)

## How to deactivate

Toggle the Demo Mode switch to OFF in Settings. New runs will call the API normally. Existing demo results remain in the database and can be deleted via "Clear All Data".

## For developers

The demo mode flag is stored in `localStorage` as `paleobench_demo_mode`. The bypass logic lives in `src/services/precompute.ts` at the top of `processTask()`.
