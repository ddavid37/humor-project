# Week 8: Prompt Chain Tool

Manage humor flavors and humor flavor steps. Gated to users with `profiles.is_superadmin === true` or `profiles.is_matrix_admin === true`.

## Run locally (from this repo)

```bash
cd week8
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase → Settings → API)
npm install
npm run dev
```

Open http://localhost:3002. Sign in with Google (you must be superadmin or matrix admin).

## Features

- **Auth:** Google login; only superadmin or matrix admin can access.
- **Flavors:** Create, read, update, delete humor flavors.
- **Steps:** Create, update, delete steps for a flavor; reorder steps (move up/down).
- **Test:** Pick a flavor and an image ID, call `api.almostcrackd.ai` to generate captions.
- **Theme:** Dark / light / system toggle in the header.

---

## Standalone repo and Vercel

To run this app in a **new location** as its own repo and deploy on Vercel:

### 1. Create the standalone copy and init a repo

From the **root** of the `humor-project` repo:

```bash
bash week8/scripts/prepare-standalone.sh
```

This copies `week8/` to `../prompt-chain-tool` (no `.next`, `node_modules`, or `.env`), runs `npm install` there, and runs `git init`. To use a different folder:

```bash
bash week8/scripts/prepare-standalone.sh /path/to/my-prompt-chain-tool
```

### 2. Add env and run locally (optional)

```bash
cd ../prompt-chain-tool
cp .env.example .env
# Edit .env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (same as main app / admin)
npm run dev
```

### 3. Push to GitHub

```bash
cd ../prompt-chain-tool
git add .
git commit -m "Initial commit: Prompt Chain Tool"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 4. Deploy on Vercel

1. In [Vercel](https://vercel.com), **Add New** → **Project** → Import the new GitHub repo.
2. **Root Directory:** leave as `.` (the repo root is the app).
3. **Environment variables:** add (same values as your main app / admin):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Turn off **Deployment Protection** in Project Settings if you need to view in Incognito or for grading.

The app has no other secrets; those two variables are enough for auth and Supabase.

---

## Matrix admin

If your `profiles` table does not have `is_matrix_admin`, add it (e.g. in Supabase SQL):

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_matrix_admin boolean DEFAULT false;
UPDATE profiles SET is_matrix_admin = true WHERE id = 'YOUR_USER_UUID';
```
