# Portfolio GitHub repo (empty Cloud Agent error)

## What went wrong

`https://github.com/SUDARVEL/Portfolio` was created **with no commits**. Cursor Cloud Agents require a non-empty GitHub repo, which produces:

`GitHub repository is empty` / `scmFailureReason: repo_empty`  
Request ID example: `b9569dc6-6791-4bb6-a2e8-05ef063fa34b`

Oncosmart (`SUDARVEL/oncosmart`) is fine and already has history. Portfolio code was removed from this monorepo on purpose.

## Fix (you must run this — Cursor cannot push to Portfolio)

Cursor’s GitHub App on this workspace only has access to **oncosmart**, not **Portfolio**. Push the prepared initial commit from your machine:

```bash
git fetch https://github.com/SUDARVEL/oncosmart.git cursor/portfolio-initial-7312
git push https://github.com/SUDARVEL/Portfolio.git FETCH_HEAD:main
```

Or:

```bash
git clone https://github.com/SUDARVEL/oncosmart.git
cd oncosmart
git checkout origin/cursor/portfolio-initial-7312
git remote add portfolio https://github.com/SUDARVEL/Portfolio.git
git push -u portfolio HEAD:main
```

Branch `cursor/portfolio-initial-7312` is an **orphan** tree (portfolio as repo root). **Do not merge it into Oncosmart `master`.**

## After the first commit

1. GitHub → **Settings** → **Applications** → **Cursor** → grant access to **`SUDARVEL/Portfolio`**
2. In Cursor, select the **Portfolio** repo and start a Cloud Agent again

## Related

- Prepared content branch: `cursor/portfolio-initial-7312` on oncosmart
- Target repo: https://github.com/SUDARVEL/Portfolio
