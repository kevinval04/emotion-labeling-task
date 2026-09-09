# Tweet emotion labeling task

A web interface where participants read five randomly selected tweets and label
the emotion each expresses. CSE594 Human-AI Interaction, Assignment 1
(A1-2).

**Live task:** https://emotion-labeling-task.vercel.app

## What it does

- Has curated dataset of 78 tweets, 13 for each of six emotions: anger,
  fear, joy, love, sadness, surprise.
- Shows every participant an instructions popup before the task begins, which
  stays reopenable during it.
- Draws 5 tweets per participant uniformly at random, so no two participants
  see the same set.
- Records who labeled which tweet with which label, one row per judgment.

## Tech stack

Next.js 16 (App Router, TypeScript), Supabase (Postgres) for storage, deployed
on Vercel.

## Running it locally

Requires Node 18+ and a Supabase project.

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same page, the publishable key |

The publishable key is safe to expose in client code. The app never uses the
secret key. Both variables are required as the app throws on startup if either
is missing, so a misconfigured deployment fails,
dropping participant data.

### Database setup

Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor. It creates
two tables and their row-level security policies.

| Table | Contents |
| --- | --- |
| `sessions` | One row per participant: id, optional display name, the 5 tweet ids assigned to them, start and completion timestamps. |
| `labels` | One row per judgment: session id, tweet id, chosen label, timestamp. |

RLS allows inserts but grants no `SELECT`, so the publishable key can write
responses but cannot read anyone's data back. Responses are read through the
Supabase dashboard.

## The dataset

`data/tweets.json` holds the 78 tweets, each with `id`, `text`, and
`gold_label`. Gold labels stay server-side and are never sent to the browser.

Tweets were drawn from the [dair-ai/emotion](https://huggingface.co/datasets/dair-ai/emotion)
dataset. To rebuild the raw source:

```bash
python scripts/fetch_dataset.py     # downloads the train split to data/raw/
python scripts/inspect_dataset.py   # verifies the label index mapping
```

`inspect_dataset.py` checks the claimed label mapping empirically rather than
trusting the dataset metadata, using a keyword concentration matrix. All six
emotions pass.

Candidates were filtered for length, profanity, corrupt text, and
negation, then the final 78 were selected by hand.

## Design decisions

- **Balanced categories.** The source data is heavily skewed (joy 33.5%,
  surprise 3.6%). The task set is balanced at 13 per emotion so participants
  encounter every category.
- **Uniform random draw, not stratified.** Guaranteeing one tweet per category
  would let participants infer the structure and bias their later answers.
- **Two-step answering.** Selecting an emotion and submitting it are separate
  actions, so a misclick does not record an answer.
- **Answers save before advancing.** Each label is written as it is given. A
  failed write shows an error and stays on the tweet, and a participant who
  leaves early keeps the answers they did give.
- **Minimal personal data.** Participants are identified by a generated UUID.
  The name field is optional and the popup says so.
- **Accessibility.** The interface is set in Atkinson Hyperlegible, designed by
  the Braille Institute so similar letterforms stay distinguishable. The popup
  is a labelled dialog with managed focus, and controls have visible focus
  outlines.

## Project structure

```
app/
  page.tsx                  screen state: popup, task, completion
  api/session/route.ts      creates a session, returns 5 tweets without labels
  api/label/route.ts        records one label, completes the session
components/
  InstructionsModal.tsx     the instructions popup
  LabelingTask.tsx          the labeling screen
lib/
  supabase.ts               Supabase client, emotion constants
  tweets.ts                 dataset loading and random draw
data/tweets.json            the 78 curated tweets
scripts/                    dataset fetch and verification
supabase/migrations/        database schema
```
