"""Download the Emotion dataset train split from HuggingFace.

Source: https://huggingface.co/datasets/dair-ai/emotion (config "split")
Writes data/raw/emotion_train.parquet, which is gitignored -- rerun this
script to regenerate it.

Usage:  python scripts/fetch_dataset.py
"""

import urllib.request
from pathlib import Path

PARQUET_URL = (
    "https://huggingface.co/datasets/dair-ai/emotion/resolve/"
    "refs%2Fconvert%2Fparquet/split/train/0000.parquet"
)

REPO_ROOT = Path(__file__).resolve().parent.parent
DEST = REPO_ROOT / "data" / "raw" / "emotion_train.parquet"

# Index -> name mapping, taken from the dataset's own ClassLabel feature.
# Verified against the HuggingFace dataset info endpoint.
LABEL_NAMES = ["sadness", "joy", "love", "anger", "fear", "surprise"]


def main() -> None:
    DEST.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {PARQUET_URL}")
    urllib.request.urlretrieve(PARQUET_URL, DEST)
    print(f"Saved {DEST.relative_to(REPO_ROOT)} ({DEST.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
