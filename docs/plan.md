# todo-cli Implementation Plan

## Goal Description

Build a simple Node.js CLI task manager called `todo-cli` with the following features:
- Add tasks via `add` command
- List all tasks with `list` command
- Mark tasks as complete via `complete` command
- Delete tasks via `delete` command
- Store tasks in a local JSON file
- Colorful output using `chalk` package
- Show task counts (pending vs completed)
- Support `--help` flag
- Make it installable via `npm link`

## Acceptance Criteria

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: Add task functionality
  - Positive Tests (expected to PASS):
    - `todo add "Buy milk"` creates a task with a unique ID and displays a success message
    - Running `todo add "Buy milk"` twice creates two distinct tasks
    - New tasks appear in `todo list` output immediately after creation
  - Negative Tests (expected to FAIL):
    - `todo add` without task text displays usage error and exits non-zero
    - Empty task text (`todo add ""`) is rejected with error message

- AC-2: List tasks functionality
  - Positive Tests (expected to PASS):
    - `todo list` displays all tasks with ID, status indicator, and task text
    - Task counts are shown (e.g., "2 pending / 1 completed")
    - Empty task list shows a friendly "No tasks yet" message
  - Negative Tests (expected to FAIL):
    - Missing JSON file is handled gracefully (treated as empty)
    - Corrupted JSON file produces readable error message, not crash

- AC-3: Complete task functionality
  - Positive Tests (expected to PASS):
    - `todo complete <id>` marks the specified task as completed
    - Completed tasks show a visual indicator in `todo list` output
    - Re-completing an already completed task is a no-op (no error)
  - Negative Tests (expected to FAIL):
    - `todo complete` with no ID displays usage error and exits non-zero
    - `todo complete 999` (non-existent ID) exits non-zero with "Task not found" error

- AC-4: Delete task functionality
  - Positive Tests (expected to PASS):
    - `todo delete <id>` removes the task permanently from storage
    - Deleted task does not appear in subsequent `todo list` output
  - Negative Tests (expected to FAIL):
    - `todo delete` with no ID displays usage error and exits non-zero
    - `todo delete 999` (non-existent ID) exits non-zero with "Task not found" error

- AC-5: Help flag functionality
  - Positive Tests (expected to PASS):
    - `todo --help` displays help information for all commands
    - Help output includes descriptions for add, list, complete, delete commands
    - Exit code is 0 after `todo --help`
  - Negative Tests (expected to FAIL):
    - Unrecognized command (`todo foobar`) prints error hint and exits non-zero

- AC-6: npm link installability
  - Positive Tests (expected to PASS):
    - After `npm link`, `todo` command is available on PATH
    - All commands work identically from any directory
    - Executable has correct shebang (`#!/usr/bin/env node`)
  - Negative Tests (expected to FAIL):
    - Missing `bin` field in package.json causes npm link to fail with warning

- AC-7: Colorful output
  - Positive Tests (expected to PASS):
    - Pending tasks displayed in a distinct color (e.g., yellow/white)
    - Completed tasks displayed in a distinct color (e.g., green)
    - Success messages use color formatting
  - Negative Tests (expected to FAIL):
    - Command fails gracefully if chalk package is not installed

- AC-8: Task counts display
  - Positive Tests (expected to PASS):
    - List output shows count of pending tasks
    - List output shows count of completed tasks
    - Counts update correctly after add/complete/delete operations

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
The implementation includes all core features: add/list/complete/delete commands, JSON file storage, chalk-based colorful output, task counts display, --help flag, and npm link installability. It includes proper error handling for edge cases (missing file, invalid IDs, empty input) and maintains compatibility across Node.js versions.

### Lower Bound (Minimum Acceptable Scope)
The implementation provides a working CLI with add/list/complete/delete commands that store tasks in JSON format. It includes colorful output using chalk, task counts, --help flag, and npm link support. Basic error handling is present for common failure cases.

### Allowed Choices
- Can use: CommonJS or ESM module format
- Can use: Any argument parsing library (commander, yargs) or custom parsing
- Can use: Auto-incrementing IDs or UUIDs for task identification
- Can use: Global storage location (~/.todo-cli.json) or per-project storage (./todo.json)
- Cannot use: Database systems other than JSON file storage (per draft specification)
- Cannot use: Color libraries other than chalk (per draft specification)

> **Note on Deterministic Designs**: The draft specifies JSON file storage and chalk for colors. These are fixed requirements - the path boundaries reflect this constraint where upper and lower bounds converge on these specifications.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
A simple Node.js CLI using a main entry point that parses command-line arguments. Commands are handled via switch/case or subcommand routing. Task storage uses a JSON file with atomic writes (write to temp file then rename). Colorful output uses chalk with appropriate color selection based on task status.

```
// Conceptual structure
- package.json: bin field pointing to cli.js, dependencies: chalk
- cli.js:#!/usr/bin/env node entry point, argument parsing, command routing
- commands/: add.js, list.js, complete.js, delete.js
- storage.js: read/write JSON file, atomic writes
- index.js: exports commands and storage modules
```

### Relevant References
- Node.js `fs` module for JSON file operations
- `chalk` package for colored terminal output
- `commander` or `yargs` for argument parsing (optional)
- `package.json` `bin` field for npm link installability

## Dependencies and Sequence

### Milestones
1. Project Setup: Create package.json with dependencies and bin configuration
   - Install chalk dependency
   - Configure bin field for npm link
   - Set up module format (CJS or ESM)

2. Core Implementation: Build CLI entry point and command handlers
   - Implement argument parsing
   - Create add command
   - Create list command
   - Create complete command
   - Create delete command
   - Implement --help flag

3. Storage Layer: Implement JSON file persistence
   - Create storage module for read/write
   - Implement atomic writes
   - Handle missing/corrupted file cases

4. Output Enhancement: Add colorful formatting
   - Integrate chalk for colored output
   - Display task counts
   - Format success/error messages

5. Verification: Test all commands and npm link
   - Test add/list/complete/delete operations
   - Test --help flag
   - Test npm link installability
   - Verify error handling

## Task Breakdown

Each task must include exactly one routing tag:
- `coding`: implemented by Claude
- `analyze`: executed via Codex (`/humanize:ask-codex`)

| Task ID | Description | Target AC | Tag (`coding`/`analyze`) | Depends On |
|---------|-------------|-----------|----------------------------|------------|
| task1 | Create package.json with dependencies and bin configuration | AC-6 | coding | - |
| task2 | Implement CLI entry point with argument parsing | AC-5 | coding | task1 |
| task3 | Implement storage module for JSON file operations | AC-2, AC-4 | coding | task1 |
| task4 | Implement add command | AC-1 | coding | task3 |
| task5 | Implement list command | AC-2, AC-7, AC-8 | coding | task3 |
| task6 | Implement complete command | AC-3 | coding | task3 |
| task7 | Implement delete command | AC-4 | coding | task3 |
| task8 | Integrate chalk for colorful output | AC-7 | coding | task2 |
| task9 | Test npm link installability | AC-6 | coding | task1 |

## Claude-Codex Deliberation

### Agreements
- Both Claude and Codex agree on the core feature set: add/list/complete/delete commands with JSON storage
- Both agree that colorful output via chalk and task counts are essential features
- Both agree that npm link installability requires proper bin field and shebang configuration

### Resolved Disagreements
- N/A - Direct mode was used, skipping convergence loop

### Convergence Status
- Final Status: `partially_converged`
- Note: Direct mode was used (--direct flag), so no convergence rounds were executed. Human review is recommended before implementation.

## Pending User Decisions

- DEC-1: Storage scope (global vs per-directory)
  - Claude Position: Global storage (~/.todo-cli.json) is more intuitive for a globally installed CLI
  - Codex Position: Per-directory storage allows project-scoped tasks
  - Tradeoff Summary: Global storage means tasks persist across all directories; per-directory means tasks are tied to the current directory
  - Decision Status: PENDING

- DEC-2: Module format (CommonJS vs ESM)
  - Claude Position: CommonJS is more compatible with older Node.js versions and chalk v4
  - Codex Position: ESM is the future and works with chalk v5
  - Tradeoff Summary: CommonJS has broader compatibility; ESM is modern but requires Node 12+
  - Decision Status: PENDING

- DEC-3: Task ID scheme (auto-increment vs UUID)
  - Claude Position: Auto-increment integers are friendlier for CLI users
  - Codex Position: UUIDs are more robust when tasks are deleted
  - Tradeoff Summary: Auto-increment creates gaps after deletion; UUIDs are longer but more robust
  - Decision Status: PENDING

- DEC-4: Argument parsing approach
  - Claude Position: Use a library like commander for robust --help generation
  - Codex Position: Custom argument parsing keeps dependencies minimal
  - Tradeoff Summary: Library approach adds a dependency but provides better UX; custom is zero-dependency but more code to maintain
  - Decision Status: PENDING

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific terminology such as "AC-", "Milestone", "Step", "Phase", or similar workflow markers
- These terms are for plan documentation only, not for the resulting codebase
- Use descriptive, domain-appropriate naming in code instead

--- Original Design Draft Start ---

# Requirement

Build a simple Node.js CLI task manager called todo-cli. Features: add/list/complete/delete tasks stored in a local JSON file. Include colorful output using chalk, show task counts, and support --help flag. Make it installable via npm link.

--- Original Design Draft End ---
