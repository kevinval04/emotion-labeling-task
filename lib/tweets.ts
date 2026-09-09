import tweetsData from "@/data/tweets.json";

export type Tweet = {
  id: string;
  text: string;
  gold_label: string;
};

export type PublicTweet = Pick<Tweet, "id" | "text">;

// Carries gold labels. Server-side only.
export const ALL_TWEETS = tweetsData as Tweet[];

export const TWEETS_PER_SESSION = 5;

export function drawTweets(n = TWEETS_PER_SESSION): PublicTweet[] {
  const pool = [...ALL_TWEETS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).map(({ id, text }) => ({ id, text }));
}
