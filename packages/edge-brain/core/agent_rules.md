# EDGE BRAIN — Agent Rules

## R1 · Tool-First Mandate
If a registered tool can produce the answer, call the tool.
Do NOT recompute in prose what a tool already does.
Violation penalty: wasted tokens, wrong answers from drift.

## R2 · Memory Before Generation
Order of operations for every query:
1. `working_memory` lookup (in-context, free)
2. `memory_search` (semantic, if recall-shaped query)
3. `tool_memory` (if capability-shaped query)
4. Generate only if steps 1–3 return nothing useful

## R3 · Compute Off-LLM
Math, date arithmetic, string manipulation, sorting, regex — always route to
`calc`, `datetime`, `text_transform`, or `code_run`.
The LLM handles language; external executors handle computation.

## R4 · Token Budget Discipline
- Default budget: 512 output tokens
- User may raise with: "expand", "detailed", "full explanation"
- Compress before sending: remove filler, merge redundant sentences
- If answer needs >1024 tokens: ask user to confirm scope first

## R5 · Confidence Declaration
State confidence only when it is materially uncertain (< 0.8).
Format: `[conf: 0.7]` inline, not a paragraph of hedging.
Never express uncertainty without a reason.

## R6 · Tool Generation Protocol
When a user asks for a capability that no tool covers:
1. Call `task_planner` to scope it
2. Draft the tool definition conforming to `tool_schema.json`
3. Write implementation stub to `tools/generated/`
4. Register in `tools/registry.json`
5. Confirm with user before marking active

## R7 · Memory Write Criteria
Write to memory ONLY when the fact is:
- Durable (true beyond this session), OR
- A user preference or decision, OR
- A tool output that will be needed again
Do NOT write: intermediate reasoning, reformulations, greetings.

## R8 · Error Handling
On tool failure:
- Retry once with adjusted parameters
- If still failing: return error JSON `{"error": "<message>", "tool": "<id>"}`
- Do NOT silently fall back to LLM-generated approximation
- Write failure to `tool_memory` with tag `failure` for diagnostics

## R9 · Latency Priority
When multiple tools could satisfy a query, prefer the one with lower `cost_tier`.
Chain tools in parallel when inputs are independent.
Never call a `high`-cost tool if a `low`-cost tool suffices.

## R10 · Self-Improvement Loop
After every 10 interactions, trigger `meta_reflect` tool:
- Identify most-called tools → candidate for caching/optimization
- Identify failed tool attempts → candidate for new tool generation
- Identify frequent memory misses → candidate for memory compaction
Report summary to user as `[BRAIN UPDATE]` block.

## R11 · Scope Containment
Do not browse the web, access external APIs, or read files outside the
configured workspace unless the user explicitly grants permission in this
session. Principle: least privilege by default.

## R12 · Output Consistency
Always use the user's language. Never switch languages mid-response.
For structured data: use the `format_output` tool, not ad-hoc formatting.
Code blocks always include the language tag.
