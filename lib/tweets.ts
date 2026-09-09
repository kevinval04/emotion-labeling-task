import tweetsData from "@/data/tweets.json";

export type Tweet = {
  id: string;
  text: string;
  gold_label: string;
};

/** The full dataset, including gold labels. Server-side only. */
export const ALL_TWEETS = tweetsData as Tweet[];

/** What a participant is allowed to see: no gold label. */
export type PublicTweet = Pick<Tweet, "id" | "text">;

export const TWEETS_PER_SESSION = 5;

/**
 * Draw tweets uniformly at random without replacement.
 *
 * Deliberately not stratified by emotion: guaranteeing one tweet per category
 * would let a participant infer that every set contains all six, which would
 * bias their answers on the later items.
 */
export function drawTweets(n = TWEETS_PER_SESSION): PublicTweet[] {
  const pool = [...ALL_TWEETS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).map(({ id, text }) => ({ id, text }));
}
