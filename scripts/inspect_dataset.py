"""Inspect the raw Emotion dataset and verify the label index to name mapping.

The HuggingFace metadata claims index 0..5 maps to
sadness, joy, love, anger, fear, surprise. This file will verify that!

Verification is done in this way: tweets in this dataset are mostly "i feel <emotion>"
phrasing, so tweets containing an emotion's own vocabulary should concentrate
overwhelmingly in that emotion's label index. build a keyword-hit matrix
and check that the strongest column for each keyword group is the index the
metadata claims.

Usage:  python scripts/inspect_dataset.py
"""

import re
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW = REPO_ROOT / "data" / "raw" / "emotion_train.parquet"

# The mapping we are testing, as claimed by the dataset's ClassLabel feature.
CLAIMED = ["sadness", "joy", "love", "anger", "fear", "surprise"]

# Vocabulary that should be diagnostic of each emotion, chosen to avoid
# overlap between groups where possible.
KEYWORDS = {
    "sadness":  ["sad", "depress", "miserable", "unhappy", "gloomy", "heartbroken", "grief"],
    "joy":      ["happy", "joyful", "delighted", "cheerful", "glad", "ecstatic", "blessed"],
    "love":     ["love", "loving", "affection", "romantic", "adore", "tender", "beloved"],
    "anger":    ["angry", "anger", "furious", "irritated", "rage", "resentful", "annoyed"],
    "fear":     ["afraid", "scared", "terrified", "anxious", "nervous", "frightened", "panic"],
    "surprise": ["surprised", "amazed", "astonished", "shocked", "stunned", "startled"],
}


def hit_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Rows = keyword group, cols = label index, cells = % of that group's hits."""
    rows = {}
    for emotion, words in KEYWORDS.items():
        pattern = re.compile(r"\b(?:" + "|".join(words) + r")", re.IGNORECASE)
        hits = df[df["text"].str.contains(pattern, regex=True)]
        counts = hits["label"].value_counts().reindex(range(6), fill_value=0)
        pct = (counts / max(len(hits), 1) * 100).round(1)
        rows[emotion] = pct
    return pd.DataFrame(rows).T


def main() -> None:
    df = pd.read_parquet(RAW)

    print("=" * 72)
    print("CLASS DISTRIBUTION")
    print("=" * 72)
    counts = df["label"].value_counts().sort_index()
    for idx, n in counts.items():
        print(f"  {idx}  {CLAIMED[idx]:<9} {n:>6,}  ({n / len(df) * 100:5.1f}%)")
    print(f"  {'':3}{'TOTAL':<9} {len(df):>6,}")

    print()
    print("=" * 72)
    print("MAPPING VERIFICATION -- % of each keyword group's tweets, by label index")
    print("(the diagonal should dominate if the claimed mapping is correct)")
    print("=" * 72)
    matrix = hit_matrix(df)
    matrix.columns = [f"{i}:{CLAIMED[i][:4]}" for i in range(6)]
    print(matrix.to_string())

    print()
    verdict_ok = True
    for i, emotion in enumerate(CLAIMED):
        winner = int(matrix.loc[emotion].values.argmax())
        share = matrix.loc[emotion].values[winner]
        ok = winner == i
        verdict_ok &= ok
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] '{emotion}' vocabulary peaks at index {winner} "
              f"({share}%) -- expected {i}")
    print()
    print("VERDICT:", "mapping CONFIRMED" if verdict_ok else "mapping IS WRONG")

    print()
    print("=" * 72)
    print("TEXT LENGTH (chars) -- informs the sampling filter in step 1.3")
    print("=" * 72)
    lengths = df["text"].str.len()
    print(lengths.describe().round(1).to_string())
    in_band = ((lengths >= 40) & (lengths <= 180)).sum()
    print(f"\n  tweets within proposed 40-180 char band: {in_band:,} "
          f"({in_band / len(df) * 100:.1f}%)")

    print()
    print("=" * 72)
    print("SAMPLE TWEETS PER LABEL (eyeball check)")
    print("=" * 72)
    for idx in range(6):
        print(f"\n--- {idx}: {CLAIMED[idx]} ---")
        subset = df[df["label"] == idx].sample(4, random_state=42)
        for text in subset["text"]:
            print(f"  * {text[:110]}")


if __name__ == "__main__":
    main()
