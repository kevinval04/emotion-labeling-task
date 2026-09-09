"use client";

import { useState } from "react";
import InstructionsModal from "@/components/InstructionsModal";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  function handleStart(name: string) {
    setDisplayName(name);
    setStarted(true);
  }

  return (
    <>
      <main aria-hidden={!started}>
        {started ? (
          <>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Labeling screen goes here.
              {displayName && ` Participant: ${displayName}.`}
            </p>
            <button
              onClick={() => setReviewing(true)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "0.813rem",
                color: "var(--muted)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Instructions
            </button>
          </>
        ) : null}
      </main>

      {!started && (
        <InstructionsModal
          mode="intro"
          onStart={handleStart}
          onClose={() => {}}
        />
      )}

      {started && reviewing && (
        <InstructionsModal
          mode="review"
          onStart={() => {}}
          onClose={() => setReviewing(false)}
        />
      )}
    </>
  );
}
