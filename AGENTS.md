# Code quality

- Write code for people to read and maintain first; use clear names, small focused functions, and straightforward control flow.
- Prefer explicit, idiomatic code over clever, overly compact, or highly abstract implementations.
- Format code consistently: indent nested blocks, break long expressions and argument lists across logical lines, and keep related statements visually grouped.
- Run the project's formatter when one is available; otherwise, preserve the surrounding file's established indentation and line-break style.
- Add comments only to explain non-obvious intent, constraints, or trade-offs—not to restate the code.
- Before finishing a change, review it for readability and simplify confusing logic, names, and structure.

## Frontend structure

- Keep pages focused on composing a screen. Extract meaningful sections, reusable UI, and non-trivial presentation logic into focused components instead of placing everything in a single page or `App.tsx` file.
- Co-locate a component's styles, types, and small helpers when that makes ownership clear; avoid extracting trivial one-line markup solely for abstraction.
