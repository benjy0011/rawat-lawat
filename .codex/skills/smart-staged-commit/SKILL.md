---
name: smart-staged-commit
description: Commit the changes already staged in the current Git repository using concise Conventional Commit-style one-line messages. Use when asked to commit staged work, create a clean commit from the index, or split independent staged changes into focused commits without including unstaged changes.
---

# Smart Staged Commit

Inspect the index, create concise Conventional Commit-style subjects, and leave unstaged work untouched.

## Workflow

1. Confirm the repository and inspect both the worktree and index:

   ```powershell
   git status --short
   git diff --cached --stat
   git diff --cached
   ```

2. Stop and report if nothing is staged. Do not stage, edit, discard, or amend anything unless the user explicitly asks.

3. Assess whether the staged changes are one coherent unit. Make one commit by default. Split only when staged changes form clearly independent, reviewable units with separate subjects (for example, a feature and an unrelated documentation correction).

4. Preserve every unstaged change. If any staged file also has unstaged modifications, keep all staged work in a single commit unless there is a safe, clearly separable grouping. Do not use a path-based `git commit` that could commit worktree content instead of the index.

5. For a single commit, use a Conventional Commit-style subject with no body:

   ```powershell
   git commit -m "feat: add auth components/ui"
   ```

   Use the form `<type>: <imperative summary>`. Select a truthful type such as `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `ci`, or `chore`. Keep the summary lowercase, specific, without a trailing period, and 72 characters or fewer.

6. When safely splitting fully staged, clean files, commit one logical group at a time. Unstage only files outside the current group, commit the remaining indexed group, then re-stage the clean remaining files. Re-check `git status --short` before every commit. Never use this process for a file with unstaged changes or partially staged hunks.

7. Verify the result:

   ```powershell
   git status --short
   git log -n <number-of-new-commits> --oneline
   ```

Report the commit hash or hashes, subjects, and any staged work deliberately left uncommitted for safety.
