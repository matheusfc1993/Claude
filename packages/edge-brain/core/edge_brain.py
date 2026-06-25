"""
Edge Brain — Main Entry Point
Minimal runtime: loads system prompt, validates tools, routes calls.
"""

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

def load_system_prompt() -> str:
    return (ROOT / "core" / "system_prompt.md").read_text()

def load_registry() -> list[dict]:
    data = json.loads((ROOT / "tools" / "registry.json").read_text())
    return data["tools"]

def run_tool(tool_id: str, params: dict) -> dict:
    from tools.implementations import dispatch
    return dispatch(tool_id, params)

def repl():
    """Minimal interactive loop for local testing."""
    import readline  # noqa: F401 — enables arrow keys
    from tools.implementations import dispatch

    print("Edge Brain v1.0 — local mode. Type 'help' for tool list, 'quit' to exit.")
    tools = load_registry()
    tool_ids = [t["id"] for t in tools]

    while True:
        try:
            line = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not line:
            continue
        if line == "quit":
            break
        if line == "help":
            for t in tools:
                print(f"  {t['id']:20s} {t['description'][:60]}")
            continue

        # Parse: tool_id {json_params}
        parts = line.split(None, 1)
        tid = parts[0]
        if tid not in tool_ids:
            print(f"Unknown tool: {tid}. Try 'help'.")
            continue
        params = json.loads(parts[1]) if len(parts) > 1 else {}
        result = dispatch(tid, params)
        print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    repl()
