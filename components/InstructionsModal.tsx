"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./InstructionsModal.module.css";

const DEFINITIONS: [string, string][] = [
  ["Anger", "Irritation, frustration, or feeling wronged"],
  ["Fear", "Worry, dread, or feeling threatened"],
  ["Joy", "Happiness, contentment, pride, gratitude"],
  ["Love", "Affection or caring toward someone specific"],
  ["Sadness", "Unhappiness, loneliness, grief"],
  ["Surprise", "Astonishment or being caught off guard"],
];

type Props = {
  mode: "intro" | "review";
  starting?: boolean;
  error?: string | null;
  onStart?: (displayName: string) => void;
  onClose?: () => void;
};

export default function InstructionsModal({
  mode,
  starting = false,
  error = null,
  onStart = () => {},
  onClose = () => {},
}: Props) {
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Not wired up for the intro: dismissing it would strand the participant.
  useEffect(() => {
    if (mode !== "review") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className={styles.scrim} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className={styles.head}>
          <span className={styles.eyebrow}>
            {mode === "intro" ? "Before you start" : "Instructions"}
          </span>
          {mode === "review" && (
            <button
              className={styles.close}
              onClick={onClose}
              aria-label="Close instructions"
            >
              &#10005;
            </button>
          )}
        </div>

        <div className={styles.body}>
          <h1 id="instructions-title" className={styles.title}>
            Tweet emotion labeling
          </h1>
          <p className={styles.lede}>
            You&rsquo;ll read five short tweets, one at a time, and choose the
            single emotion the writer was expressing.
          </p>

          <p className={styles.sectionLabel}>The six emotions</p>
          <dl style={{ margin: 0 }}>
            {DEFINITIONS.map(([term, meaning]) => (
              <div key={term} className={styles.row}>
                <dt>{term}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.guidance}>
            Choose the answer that fits best. If you&rsquo;re not sure, go with
            your first instinct.
          </p>

          {mode === "intro" && (
            <>
              <p className={styles.privacy}>
                I record which tweets you saw and the labels you chose. Your
                name is optional.
              </p>
              <label>
                <span className="sr-only">Your name or initials, optional</span>
                <input
                  className={styles.field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or initials (optional)"
                  maxLength={80}
                />
              </label>
            </>
          )}
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.foot}>
          {mode === "intro" ? (
            <button
              className={styles.start}
              disabled={starting}
              onClick={() => onStart(name.trim())}
            >
              {starting ? "Starting…" : "Start labeling"}
            </button>
          ) : (
            <button className={styles.start} onClick={onClose}>
              Back to the task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
