# MEC Evaluator

A simple event-judging app: pick a category (Poster, PPT, Idea, Image, Video, Audio),
choose which criteria to score on, submit an entry, and get category-wise marks plus
a total scaled to the event's max marks.

## Why there's a backend folder

The AI scoring calls the Anthropic API, which needs a secret API key. Keys must
never live in front-end code (anyone could open dev tools and steal it), so this
project ships a tiny serverless function (`api/evaluate.js`) that holds the key
on the server and the React app talks to that function instead of Anthropic
directly.

## Run it locally

```bash
npm install
npm run dev
```

This starts the front end at `http://localhost:5173`, but the `/api/evaluate`
call will fail locally unless you also run it through Vercel's dev server
(recommended, see below) or wire up your own local API route.

## Deploy on Vercel (easiest)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), import the repo.
3. In the project's Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key (get one at console.anthropic.com)
4. Deploy. Vercel automatically detects `api/evaluate.js` as a serverless function.

To develop locally with the function working, install the Vercel CLI instead of `vite dev`:

```bash
npm i -g vercel
vercel dev
```

## Deploy elsewhere (Netlify, etc.)

Any host that supports serverless/edge functions will work — move the logic in
`api/evaluate.js` into that platform's function format (e.g. Netlify Functions),
keep the same request/response shape, and update the fetch URL in `src/App.jsx`
if the path differs.

## Notes

- Model used: `claude-sonnet-5`. Change it in `api/evaluate.js` if you'd like a
  different model.
- No database — every evaluation is a single request/response, nothing is stored.
- Image/PDF entries (Poster, PPT, Image) are sent to Claude directly for visual
  review. Video and Audio entries are scored from the judge's written
  description, since Claude cannot currently watch/listen to media files.
