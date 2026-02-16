This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Accessing your Supabase database

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)** and sign in.
2. Open your project (the one whose URL and anon key are in `.env.local`).
3. In the left sidebar, open **Table Editor**.
4. Click the **caption_votes** table.
5. You’ll see the list of columns and their types. Note the **exact** column names (e.g. `caption_id`, `user_id`, or `captionId`, `userId`, etc.).

Once you vote, the next pege will be loaded

If voting fails with “Could not find the '…' column”, the insert is using the wrong names. Update `app/api/captions/[captionId]/vote/route.ts` so the object passed to `.insert({ ... })` uses the exact column names from the Table Editor.
