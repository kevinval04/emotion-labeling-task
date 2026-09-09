"use client";

import { useState } from "react";
import { EMOTIONS, type Emotion } from "@/lib/supabase";
import styles from "./LabelingTask.module.css";

export type PublicTweet = { id: string; text: string };

type Props = {
  sessionId: string;
  tweets: PublicTweet[];
  onShowInstructions: () => void;
};

const LABELS: Record<Emotion, string> = {
  anger: "Anger",
  fear: "Fear",
  joy: "Joy",
  love: "Love",
  sadness: "Sadness",
  surprise: "Surprise",
};

export default function LabelingTask({
  sessionId,
  tweets,
  onShowInstructions,
}: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Emotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = tweets.length;
  const done = index >= total;
  const tweet = done ? null : tweets[index];

  async function submit() {
    if (!selected || !tweet) return;
    setSaving(true);
    setError(null);

    const isLast = index === total - 1;
    try {
      const res = await fetch("/api/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tweetId: tweet.id,
          label: selected,
          isLast,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save that answer.");
      }
      // Only advance once the answer is safely stored, so a failed write
      // never silently loses a judgment.
      setIndex(index + 1);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className={styles.done}>
        <h2>All done — thank you</h2>
        <p>
          Your {total} labels have been recorded. You can close this page now.
        </p>
        <p className={styles.id}>Participant ID: {sessionId}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.progress}>
        <span className={styles.count}>
          Tweet {index + 1} of {total}
        </span>
        <span className={styles.dots} aria-hidden="true">
          {"●".repeat(index + 1)}
          {"○".repeat(total - index - 1)}
        </span>
      </div>

      <div className={styles.card}>
        <p className={styles.tweet}>{tweet!.text}</p>
      </div>

      <p className={styles.question} id="prompt">
        Which emotion does this tweet express?
      </p>

      <div className={styles.grid} role="group" aria-labelledby="prompt">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion}
            type="button"
            className={styles.option}
            aria-pressed={selected === emotion}
            onClick={() => setSelected(emotion)}
          >
            {LABELS[emotion]}
          </button>
        ))}
      </div>

      <button
        className={styles.submit}
        disabled={!selected || saving}
        onClick={submit}
      >
        {saving ? "Saving…" : "Submit and continue"}
      </button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.footer}>
        <button className={styles.link} onClick={onShowInstructions}>
          Instructions
        </button>
      </div>
    </div>
  );
}
