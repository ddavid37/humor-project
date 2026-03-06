# Humor Admin (Week 6)

Admin panel for the Humor Vault database. All routes (except login and auth callback) require **Google login** and **`profiles.is_superadmin === true`**.

## Run locally

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). Sign in with Google. You must be a superadmin to see the dashboard.

## How to avoid being locked out

You need at least one user with `profiles.is_superadmin = true` to use the admin area. Options:

1. **Supabase Dashboard → Table Editor → `profiles`**  
   After logging in once with Google, go to **Authentication → Users**, copy your user **UUID**. In **Table Editor → profiles**, find the row with that `id` and set `is_superadmin` to `true`.

2. **Supabase SQL Editor**  
   Run:
   ```sql
   UPDATE profiles SET is_superadmin = true WHERE id = 'YOUR_AUTH_USER_UUID';
   ```
   Replace `YOUR_AUTH_USER_UUID` with your user id from Authentication → Users.

Do **not** change RLS policies; use the above to bootstrap your own superadmin.

## Deploy (new repo + Vercel)

1. Create a **new GitHub repository** and a **new Vercel project** for the admin app.
2. Copy the contents of this `admin/` folder into the new repo (or use this folder as the root of the new repo).
3. In Vercel project settings, set:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same as your main app).
   - `NEXT_PUBLIC_MAIN_APP_URL` = your main app URL (e.g. `https://humor-project-wine.vercel.app`) so "View main site →" works in the header.
4. **Turn off Vercel “Deployment Protection”** (e.g. under Settings → Deployment Protection) so you can open the app in Incognito.
5. Submit the **commit-specific URL** of this admin app (and of your caption/rating app) in the course Submissions section.

## Features

- **Dashboard**: Counts (users, images, captions, votes), top captions by score, recent images.
- **Users**: Read-only list of profiles (id, is_superadmin, created_at).
- **Images**: Create (by URL), read, update (URL), delete.
- **Captions**: Read-only list with link to image.
