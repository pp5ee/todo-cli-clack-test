Here's a thorough analysis of the `todo-cli` draft:

---

**CORE_RISKS**

- **JSON file corruption**: Concurrent writes (two terminals running `todo-cli` simultaneously) can corrupt the store; no locking mechanism is mentioned.
- **Storage location ambiguity**: "Local JSON file" is undefined — per-directory (project-scoped) vs. a single global file in `~/.config` or `~/` behave very differently for a globally installed CLI tool.
- **chalk version trap**: chalk v5+ is ESM-only; a CommonJS project using `require('chalk')` will silently fail or throw. The draft doesn't specify module format.
- **npm link fragility**: `npm link` behavior differs across npm versions and Node versions; it's environment-sensitive and often breaks in monorepo or nvm setups.
- **ID generation**: No strategy for task IDs is stated — auto-increment breaks if tasks are deleted (gaps); UUIDs are robust but verbose for a CLI.

---

**MISSING_REQUIREMENTS**

- **Task editing**: No `edit` or `rename` command; tasks with typos are stuck.
- **Due dates / priority**: Common in any real task manager; absence may feel incomplete to users.
- **Filtering/searching**: `list` with no filter is fine for <20 tasks but becomes painful quickly.
- **Undo/restore**: Once `delete` runs, there's no recovery path.
- **Output format options**: No `--json` or `--plain` flag for piping to other tools.
- **Task persistence scope**: No spec on whether tasks are global, per-project, or per-directory.
- **Exit codes**: Should non-zero exit on failure (missing task ID, file write error) — not mentioned.
- **Error messaging**: No guidance on what invalid input looks like (e.g., `todo add` with no text).

---

**TECHNICAL_GAPS**

- **Argument parsing**: `--help` is mentioned but no argument-parsing library is specified. Rolling a custom parser vs. using `commander` or `yargs` is a real architectural decision with significant scope impact.
- **chalk + ESM/CJS**: Must decide upfront: `"type": "module"` in `package.json` or CommonJS + chalk v4. This affects all import syntax.
- **Shebang + executable permissions**: `npm link` requires `bin` field in `package.json` and a correct `#!/usr/bin/env node` shebang with execute permissions (`chmod +x`). Omitting either silently breaks installation.
- **Atomic writes**: Writing JSON directly can leave a corrupt file on crash mid-write; `write-file-atomic` or a tmp-file + rename pattern should be used but isn't mentioned.
- **Cross-platform paths**: `path.join` vs. hardcoded `/` separators; Windows compatibility is entirely unaddressed.

---

**ALTERNATIVE_DIRECTIONS**

| Direction | Tradeoff |
|---|---|
| **SQLite instead of JSON** (via `better-sqlite3`) | More robust concurrent access, queries; heavier dependency, harder to hand-edit |
| **`~/.config/todo-cli/tasks.json` global store** | Consistent across directories; tasks don't follow the project |
| **`./todo.json` per-directory store** | Project-scoped tasks; surprising behavior when run from `~` or `/tmp` |
| **Use `commander` for CLI parsing** | Mature `--help` auto-generation, subcommand routing; one more dependency |
| **Use `yargs`** | More feature-rich (aliases, validation); heavier than commander |
| **ESM-first codebase** | Clean chalk v5 support; slightly more complex `npm link` debugging in some envs |
| **Zero-dependency approach** (Node built-ins only, no chalk) | More portable, no version conflicts; less visual appeal |

---

**QUESTIONS_FOR_USER**

1. **Storage scope**: Should tasks be global (one file per user, e.g. `~/.todo-cli.json`) or per-directory (local `todo.json`)? This is the single most consequential UX decision.
2. **Module format**: ESM (`import/export`) or CommonJS (`require`)? This gates the chalk version.
3. **Argument parser**: Use a library (`commander`, `yargs`) or hand-roll? Affects scope and `--help` quality.
4. **Task ID scheme**: Auto-increment integers (1, 2, 3...) or UUIDs? Integers are friendlier but gap after delete.
5. **Windows support**: Is cross-platform compatibility required, or Node.js on Unix/macOS only?
6. **Completed task behavior**: Are completed tasks kept in the list (shown with strikethrough/checkmark) or removed silently? Can they be un-completed?
7. **Test coverage**: Is a test suite (e.g. Jest/Vitest) expected, or is manual verification sufficient?

---

**CANDIDATE_CRITERIA**

- **AC-1 – Add task**: `todo add "Buy milk"` creates a task with a unique ID, timestamp, and `pending` status; running it twice with the same text creates two distinct tasks.
  - Positive: task appears in `todo list` with correct text and ID.
  - Negative: `todo add` (no text) exits non-zero and prints a usage error.

- **AC-2 – List tasks**: `todo list` prints all tasks with ID, status indicator (color-coded), and text; a summary line shows `N pending / M completed`.
  - Positive: empty store prints a friendly "No tasks yet" message.
  - Negative: list does not crash when the JSON file is absent (treats as empty).

- **AC-3 – Complete task**: `todo complete <id>` marks a task done; status reflected in subsequent `list`.
  - Positive: completing an already-completed task is a no-op or prints a warning.
  - Negative: `todo complete 999` (non-existent ID) exits non-zero with "Task not found".

- **AC-4 – Delete task**: `todo delete <id>` removes the task permanently from storage.
  - Positive: deleted ID no longer appears in `todo list`.
  - Negative: `todo delete` with no ID exits non-zero with usage hint.

- **AC-5 – Help flag**: `todo --help` prints all commands with descriptions; exit code 0.
  - Positive: help output lists `add`, `list`, `complete`, `delete` with argument signatures.
  - Negative: an unrecognized command (`todo foobar`) prints help hint and exits non-zero.

- **AC-6 – npm link installability**: After `npm link`, `todo` is available on `$PATH` and all commands function identically to `node index.js`.
  - Positive: `which todo` resolves; `todo list` works in a different directory.
  - Negative: running without Node shebang or without `bin` field fails at link time, not silently at runtime.
