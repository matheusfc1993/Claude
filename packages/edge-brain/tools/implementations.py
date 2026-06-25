"""
Edge Brain — Tool Implementations
All tools run locally. No LLM calls inside these functions.
"""

import math
import re
import json
import hashlib
import base64
import uuid
import datetime as dt
from typing import Any

# ─────────────────────────────────────────────
# T1 · CALC
# ─────────────────────────────────────────────
SAFE_MATH_GLOBALS = {
    "__builtins__": {},
    "math": math,
    "abs": abs, "round": round, "min": min, "max": max,
    "sum": sum, "pow": pow, "divmod": divmod,
}

def calc(expression: str, precision: int = 6) -> dict:
    try:
        result = eval(expression, SAFE_MATH_GLOBALS)  # noqa: S307 — sandboxed globals
        return {"result": round(float(result), precision), "expression": expression}
    except Exception as e:
        return {"error": str(e), "expression": expression}


# ─────────────────────────────────────────────
# T2 · DATETIME
# ─────────────────────────────────────────────
def datetime_op(op: str, input: str = None, delta: dict = None,
                format: str = None, from_tz: str = None, to_tz: str = None) -> dict:
    from zoneinfo import ZoneInfo

    def _parse(s):
        for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try: return dt.datetime.strptime(s, fmt)
            except ValueError: pass
        raise ValueError(f"Cannot parse date: {s}")

    if op == "now":
        return {"result": dt.datetime.now(dt.timezone.utc).isoformat()}

    if op == "parse":
        return {"result": _parse(input).isoformat()}

    if op == "add":
        base = _parse(input)
        d = delta or {}
        result = base + dt.timedelta(
            days=d.get("days", 0), hours=d.get("hours", 0),
            minutes=d.get("minutes", 0), seconds=d.get("seconds", 0)
        )
        return {"result": result.strftime(format or "%Y-%m-%d")}

    if op == "diff":
        parts = input.split("|")
        a, b = _parse(parts[0].strip()), _parse(parts[1].strip())
        return {"result": abs((b - a).total_seconds()), "unit": "seconds"}

    if op == "format":
        return {"result": _parse(input).strftime(format or "%Y-%m-%d %H:%M:%S")}

    if op == "tz_convert":
        base = _parse(input)
        src = ZoneInfo(from_tz) if from_tz else dt.timezone.utc
        tgt = ZoneInfo(to_tz)
        if base.tzinfo is None:
            base = base.replace(tzinfo=src)
        return {"result": base.astimezone(tgt).isoformat()}

    return {"error": f"Unknown op: {op}"}


# ─────────────────────────────────────────────
# T3 · MEMORY SEARCH  (in-memory stub; replace with vector DB)
# ─────────────────────────────────────────────
_MEMORY_STORE: list[dict] = []

def memory_search(query: str, layers: list = None, top_k: int = 5,
                  min_confidence: float = 0.5) -> list[dict]:
    q = query.lower()
    results = []
    for entry in _MEMORY_STORE:
        if layers and entry.get("layer") not in layers:
            continue
        if entry.get("confidence", 1.0) < min_confidence:
            continue
        if q in entry.get("content", "").lower():
            results.append(entry)
    results.sort(key=lambda e: e.get("access_count", 0), reverse=True)
    return results[:top_k]


# ─────────────────────────────────────────────
# T4 · MEMORY WRITE
# ─────────────────────────────────────────────
def memory_write(layer: str, content: str, tags: list = None,
                 ttl_seconds: int = None, confidence: float = 1.0) -> dict:
    entry = {
        "id": str(uuid.uuid4()),
        "layer": layer,
        "content": content,
        "tags": tags or [],
        "confidence": confidence,
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "last_accessed": dt.datetime.now(dt.timezone.utc).isoformat(),
        "access_count": 0,
        "ttl_seconds": ttl_seconds,
        "source": "tool_call",
    }
    _MEMORY_STORE.append(entry)
    return {"id": entry["id"], "layer": layer}


# ─────────────────────────────────────────────
# T5 · FILE READ
# ─────────────────────────────────────────────
import os
import csv
import yaml  # pip install pyyaml

WORKSPACE_ROOT = os.environ.get("EDGE_BRAIN_WORKSPACE", ".")

def file_read(path: str, encoding: str = "utf-8", lines: list = None,
              parse: bool = True) -> dict:
    full_path = os.path.normpath(os.path.join(WORKSPACE_ROOT, path))
    if not full_path.startswith(os.path.abspath(WORKSPACE_ROOT)):
        return {"error": "Path outside workspace"}
    with open(full_path, encoding=encoding) as f:
        raw = f.read()

    if lines:
        raw_lines = raw.splitlines()
        start, end = lines[0] - 1, lines[1]
        raw = "\n".join(raw_lines[start:end])

    size = len(raw.encode(encoding))
    fmt = "text"
    content: Any = raw

    if parse:
        if path.endswith(".json"):
            content = json.loads(raw); fmt = "json"
        elif path.endswith((".yml", ".yaml")):
            content = yaml.safe_load(raw); fmt = "yaml"
        elif path.endswith(".csv"):
            content = list(csv.DictReader(raw.splitlines())); fmt = "csv"

    return {"content": content, "size_bytes": size, "format": fmt, "path": path}


# ─────────────────────────────────────────────
# T6 · TEXT TRANSFORM
# ─────────────────────────────────────────────
def text_transform(op: str, input: str, pattern: str = None,
                   replacement: str = None, delimiter: str = None,
                   max_tokens: int = None, algorithm: str = "sha256") -> dict:
    if op == "regex_extract":
        return {"result": re.findall(pattern, input), "op": op}
    if op == "regex_replace":
        return {"result": re.sub(pattern, replacement or "", input), "op": op}
    if op == "split":
        return {"result": input.split(delimiter), "op": op}
    if op == "join":
        parts = json.loads(input) if input.startswith("[") else [input]
        return {"result": (delimiter or "").join(parts), "op": op}
    if op == "token_count":
        # Rough approximation: ~4 chars per token
        return {"result": max(1, len(input) // 4), "op": op}
    if op == "truncate":
        limit = (max_tokens or 512) * 4
        return {"result": input[:limit], "op": op}
    if op == "hash":
        h = hashlib.new(algorithm, input.encode()).hexdigest()
        return {"result": h, "op": op, "algorithm": algorithm}
    if op == "base64_encode":
        return {"result": base64.b64encode(input.encode()).decode(), "op": op}
    if op == "base64_decode":
        return {"result": base64.b64decode(input).decode(), "op": op}
    return {"error": f"Unknown op: {op}"}


# ─────────────────────────────────────────────
# T7 · CODE RUN
# ─────────────────────────────────────────────
import subprocess
import tempfile
import time

def code_run(lang: str, code: str, env: dict = None, timeout: int = 3000) -> dict:
    allowed = {"python", "javascript"}
    if lang not in allowed:
        return {"error": f"Language not allowed: {lang}"}

    cmd = {"python": ["python3", "-c", code], "javascript": ["node", "-e", code]}[lang]
    merged_env = {**os.environ, **(env or {})}
    start = time.time()

    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True,
            timeout=timeout / 1000, env=merged_env
        )
        return {
            "stdout": proc.stdout.strip(),
            "stderr": proc.stderr.strip(),
            "exit_code": proc.returncode,
            "duration_ms": round((time.time() - start) * 1000),
        }
    except subprocess.TimeoutExpired:
        return {"error": "Timeout", "duration_ms": timeout}
    except FileNotFoundError:
        return {"error": f"Runtime not found: {lang}"}


# ─────────────────────────────────────────────
# T8 · TASK PLANNER
# ─────────────────────────────────────────────
def task_planner(goal: str, context: dict = None, max_steps: int = 8,
                 constraints: list = None) -> dict:
    # Heuristic planner — maps goal keywords to tool sequences
    steps = []
    estimated_tokens = 0
    goal_lower = goal.lower()
    step_id = 1

    if any(w in goal_lower for w in ["read", "file", "load", "open"]):
        steps.append({"id": step_id, "description": "Read source files", "tool": "file_read",
                       "inputs": {}, "depends_on": []})
        step_id += 1; estimated_tokens += 100

    if any(w in goal_lower for w in ["calculate", "compute", "math", "number"]):
        steps.append({"id": step_id, "description": "Compute result", "tool": "calc",
                       "inputs": {}, "depends_on": [step_id - 1] if step_id > 1 else []})
        step_id += 1; estimated_tokens += 50

    if any(w in goal_lower for w in ["search", "find", "recall", "remember"]):
        steps.append({"id": step_id, "description": "Search memory", "tool": "memory_search",
                       "inputs": {}, "depends_on": []})
        step_id += 1; estimated_tokens += 80

    if any(w in goal_lower for w in ["store", "save", "remember", "persist"]):
        deps = [step_id - 1] if step_id > 1 else []
        steps.append({"id": step_id, "description": "Persist to memory", "tool": "memory_write",
                       "inputs": {}, "depends_on": deps})
        step_id += 1; estimated_tokens += 60

    if any(w in goal_lower for w in ["format", "output", "convert", "export"]):
        deps = [step_id - 1] if step_id > 1 else []
        steps.append({"id": step_id, "description": "Format output", "tool": "format_output",
                       "inputs": {}, "depends_on": deps})
        estimated_tokens += 40

    if not steps:
        steps = [{"id": 1, "description": goal, "tool": "code_run",
                  "inputs": {"lang": "python"}, "depends_on": []}]
        estimated_tokens = 200

    risk = "low" if len(steps) <= 3 else ("medium" if len(steps) <= 6 else "high")
    return {"steps": steps[:max_steps], "estimated_tokens": estimated_tokens, "risk": risk}


# ─────────────────────────────────────────────
# T9 · FORMAT OUTPUT
# ─────────────────────────────────────────────
def format_output(input: Any, to_format: str, schema: dict = None, pretty: bool = True) -> dict:
    if to_format == "json":
        result = json.dumps(input, indent=2 if pretty else None, ensure_ascii=False)
    elif to_format == "yaml":
        result = yaml.dump(input, allow_unicode=True, default_flow_style=False)
    elif to_format == "csv":
        import io
        buf = io.StringIO()
        if isinstance(input, list) and input and isinstance(input[0], dict):
            w = csv.DictWriter(buf, fieldnames=list(input[0].keys()))
            w.writeheader(); w.writerows(input)
        result = buf.getvalue()
    elif to_format == "md_table":
        if not isinstance(input, list) or not input:
            result = str(input)
        else:
            keys = list(input[0].keys())
            header = "| " + " | ".join(keys) + " |"
            sep    = "| " + " | ".join(["---"] * len(keys)) + " |"
            rows   = ["| " + " | ".join(str(row.get(k, "")) for k in keys) + " |" for row in input]
            result = "\n".join([header, sep] + rows)
    else:
        result = str(input)

    return {"result": result, "format": to_format}


# ─────────────────────────────────────────────
# T10 · META REFLECT
# ─────────────────────────────────────────────
_INTERACTION_LOG: list[dict] = []

def meta_reflect(window: int = 10, focus: str = "all") -> dict:
    recent = _INTERACTION_LOG[-window:]
    tool_counts: dict[str, int] = {}
    errors: list[dict] = []
    total_latency = 0

    for interaction in recent:
        tool = interaction.get("tool")
        if tool:
            tool_counts[tool] = tool_counts.get(tool, 0) + 1
        if interaction.get("error"):
            errors.append({"tool": tool, "error": interaction["error"]})
        total_latency += interaction.get("duration_ms", 0)

    hot_tools = sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    all_tool_ids = {t["id"] for t in json.loads(open(
        os.path.join(os.path.dirname(__file__), "registry.json")).read())["tools"]}
    unused = list(all_tool_ids - set(tool_counts.keys()))

    suggested = []
    if errors:
        suggested.append({"reason": "recurring failures", "tools": list({e["tool"] for e in errors})})

    return {
        "hot_tools": [{"tool": t, "calls": c} for t, c in hot_tools],
        "cold_tools": unused,
        "errors": errors,
        "suggested_new_tools": suggested,
        "avg_latency_ms": round(total_latency / max(len(recent), 1)),
        "token_efficiency": None,
        "window": window,
    }


# ─────────────────────────────────────────────
# TOOL DISPATCH TABLE
# ─────────────────────────────────────────────
TOOLS = {
    "calc":           calc,
    "datetime":       datetime_op,
    "memory_search":  memory_search,
    "memory_write":   memory_write,
    "file_read":      file_read,
    "text_transform": text_transform,
    "code_run":       code_run,
    "task_planner":   task_planner,
    "format_output":  format_output,
    "meta_reflect":   meta_reflect,
}

def dispatch(tool_id: str, params: dict) -> Any:
    fn = TOOLS.get(tool_id)
    if fn is None:
        return {"error": f"Unknown tool: {tool_id}"}
    start = time.time()
    result = fn(**params)
    _INTERACTION_LOG.append({
        "tool": tool_id,
        "duration_ms": round((time.time() - start) * 1000),
        "error": result.get("error") if isinstance(result, dict) else None,
    })
    return result
