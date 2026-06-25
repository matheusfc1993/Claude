# Edge Brain

Local second-brain system for Edge Gallery.

## Priorities
1. Speed — tools run off-LLM, <200ms median
2. Low consumption — no unnecessary LLM calls
3. Useful memory — 5-layer memory with TTL and confidence
4. Tool generation — schema-first, register via registry.json
5. Off-LLM computation — calc, datetime, text, code all run locally

## Structure
```
edge-brain/
├── core/
│   ├── system_prompt.md   # LLM system prompt
│   ├── agent_rules.md     # 12 operational rules
│   └── edge_brain.py      # runtime + REPL
├── schemas/
│   ├── tool_schema.json   # JSON Schema for tool definitions
│   └── memory_schema.json # JSON Schema for memory entries
└── tools/
    ├── registry.json      # 10 registered tools
    ├── implementations.py # All tool implementations
    └── generated/         # Auto-generated tools go here
```

## Quick Start
```bash
cd packages/edge-brain
pip install pyyaml
python core/edge_brain.py

# In the REPL:
> calc {"expression": "2**10"}
> datetime {"op": "now"}
> memory_write {"layer": "semantic", "content": "User prefers JSON output"}
> memory_search {"query": "output preference"}
> task_planner {"goal": "Read config file and store as memory"}
```

## Adding a New Tool
1. Define in `tools/registry.json` conforming to `schemas/tool_schema.json`
2. Implement in `tools/implementations.py`
3. Add to `TOOLS` dispatch table
4. Test via REPL: `meta_reflect {"focus": "tools"}`

## Memory Layers
| Layer      | TTL Default | Use for                        |
|------------|-------------|--------------------------------|
| working    | 3600s       | Current session context        |
| semantic   | permanent   | Facts, preferences, knowledge  |
| episodic   | permanent   | Events, past interactions      |
| tool       | permanent   | Tool capabilities, failures    |
| procedural | permanent   | How-to sequences, workflows    |

## Tool Cost Tiers
| Tier   | Target Latency | Examples               |
|--------|---------------|------------------------|
| free   | <10ms         | calc, text_transform   |
| low    | <300ms        | memory ops, planning   |
| medium | <2000ms       | code_run               |
| high   | <10000ms      | network, heavy compute |
