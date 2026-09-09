"use client";

import { useState } from "react";
import InstructionsModal from "@/components/InstructionsModal";
import LabelingTask, { type PublicTweet } from "@/components/LabelingTask";

type Session = { sessionId: string; tweets: PublicTweet[] };

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(displayName: string) {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not start the task.");
      }
      setSession(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <main aria-hidden={!session}>
        {session && (
          <LabelingTask
            sessionId={session.sessionId}
            tweets={session.tweets}
            onShowInstructions={() => setReviewing(true)}
          />
        )}
      </main>

      {!session && (
        <InstructionsModal
          mode="intro"
          starting={starting}
          error={error}
          onStart={handleStart}
          onClose={() => {}}
        />
      )}

      {session && reviewing && (
        <InstructionsModal
          mode="review"
          onStart={() => {}}
          onClose={() => setReviewing(false)}
        />
      )}
    </>
  );
}
