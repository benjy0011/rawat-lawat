---
name: smart-staged-commit
description: Commit the changes already staged in the current Git repository using concise, module-scoped Conventional Commit-style one-line messages. Use when asked to commit staged work, create a clean commit from the index, or split independent staged changes into focused commits without including unstaged changes.
---

# Smart Staged Commit

Inspect the index, create concise module-scoped Conventional Commit-style subjects, and leave unstaged work untouched.

## Workflow

1. Confirm the repository and inspect both the worktree and index:

   ```powershell
   git status --short
   git diff --cached --stat
   git diff --cached
   ```

2. Stop and report if nothing is staged. Do not stage, edit, discard, or amend anything unless the user explicitly asks.

3. Partition the staged work into the smallest coherent, reviewable groups before committing. Group files that implement one module or change together, such as `auth`, `onboarding`, `ocr`, `ui`, dependencies, or documentation. Create separate commits for independent modules. Make one commit only when every staged change is necessary for the same module-level behavior; never combine unrelated work merely to reduce the commit count.

4. Preserve every unstaged change. A partially staged file is not a reason to combine unrelated modules. Do not use a path-based `git commit`, `git add`, or other operation that could commit worktree content instead of the existing index.

5. For a single commit, use a module-scoped Conventional Commit-style subject with no body:

   ```powershell
   git commit -m "feat(auth): add auth flow"
   ```

   Use the form `<type>(<module>): <imperative summary>`. Derive the module from the affected area, such as `auth`, `onboarding`, `ocr`, `ui`, or `api`; use one concise lowercase scope. Select a truthful type such as `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `ci`, or `chore`. Keep the summary lowercase, specific, without a trailing period, and 72 characters or fewer.

6. For a split, create each commit from a temporary copy of the current index. This preserves staged hunks and all unstaged work:

   ```powershell
   $indexPath = git rev-parse --git-path index
   $tempIndex = Join-Path $env:TEMP "smart-staged-commit-$PID"
   Copy-Item $indexPath $tempIndex
   $env:GIT_INDEX_FILE = $tempIndex
   git restore --staged --source=HEAD -- <files-outside-this-group>
   git commit -m "feat(auth): add auth flow"
   Remove-Item Env:GIT_INDEX_FILE
   Remove-Item $tempIndex
   ```

   Start each group with a fresh temporary copy of the real index. Exclude every staged file outside the selected group, commit only the remaining index entries, then repeat for the next group. Re-check `git status --short` before every commit and after the final group.

7. Verify the result:

   ```powershell
   git status --short
   git log -n <number-of-new-commits> --oneline
   ```

Report the commit hash or hashes, subjects, and any staged work deliberately left uncommitted for safety.
