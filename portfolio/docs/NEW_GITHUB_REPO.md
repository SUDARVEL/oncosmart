# Split into GitHub repo SUDARVEL/portfolio

Run these after you create an empty GitHub repo named **portfolio** under **SUDARVEL**.

```bash
# from monorepo (example)
cd /path/to/oncosmart/portfolio
git init
git add .
git commit -m "Initial UX portfolio shell"
git branch -M main
git remote add origin https://github.com/SUDARVEL/portfolio.git
git push -u origin main
```

Then connect that repo to Vercel (Root Directory = `.`).

Supabase stays a **separate** project named `portfolio` — never reuse the Oncosmart fitness project keys here.
