# Fix: empty `SUDARVEL/Portfolio` (Cloud Agent error)

Cloud Agents need **at least one commit** on the GitHub repo. `SUDARVEL/Portfolio` was created empty, which caused:

`GitHub repository is empty` / `scmFailureReason: repo_empty`

## One-time publish (run on your machine)

You already have write access to `SUDARVEL/Portfolio`. This Cloud Agent does **not** (Cursor GitHub App is only installed on `oncosmart`).

```bash
# From a clone of oncosmart:
git fetch origin
git checkout origin/cursor/portfolio-initial-7312
# Detach this tree into the Portfolio repo:
git push https://github.com/SUDARVEL/Portfolio.git HEAD:main
```

Or with a fresh folder:

```bash
git clone https://github.com/SUDARVEL/oncosmart.git
cd oncosmart
git checkout origin/cursor/portfolio-initial-7312
git remote add portfolio https://github.com/SUDARVEL/Portfolio.git
git push -u portfolio HEAD:main
```

## Then enable Cloud Agents on Portfolio

1. GitHub → **Settings** → **Applications** → **Cursor** → **Configure**
2. Grant repository access to **`SUDARVEL/Portfolio`** (or “All repositories”)
3. In Cursor, open/select the **Portfolio** repo (not Oncosmart) and start a Cloud Agent again

After `main` has a commit and Cursor can access the repo, the empty-repo error goes away.
