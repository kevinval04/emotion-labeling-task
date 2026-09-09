import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { EMOTIONS, type Emotion } from "@/lib/supabase";
import { ALL_TWEETS, TWEETS_PER_SESSION } from "@/lib/tweets";

const VALID_TWEET_IDS = new Set(ALL_TWEETS.map((t) => t.id));

export async function POST(request: Request) {
  let body: { sessionId?: string; tweetId?: string; label?: string; isLast?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { sessionId, tweetId, label, isLast } = body;

  if (!sessionId || !tweetId || !label) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }
  if (!VALID_TWEET_IDS.has(tweetId)) {
    return NextResponse.json({ error: "Unknown tweet." }, { status: 400 });
  }
  if (!EMOTIONS.includes(label as Emotion)) {
    return NextResponse.json({ error: "Unknown label." }, { status: 400 });
  }

  const { error } = await supabase
    .from("labels")
    .insert({ session_id: sessionId, tweet_id: tweetId, label });

  if (error) {
    console.error("Failed to record label:", error);
    return NextResponse.json(
      { error: "Could not save that answer." },
      { status: 500 },
    );
  }

  if (isLast) {
    const { error: completeError } = await supabase
      .from("sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (completeError) {
      // The labels are already saved, so this is not worth failing the
      // request over -- it only affects completion reporting.
      console.error("Failed to mark session complete:", completeError);
    }
  }

  return NextResponse.json({ ok: true, remaining: TWEETS_PER_SESSION });
}
