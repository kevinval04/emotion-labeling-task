import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { drawTweets } from "@/lib/tweets";

export async function POST(request: Request) {
  let displayName: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.displayName === "string" && body.displayName.trim()) {
      displayName = body.displayName.trim().slice(0, 80);
    }
  } catch {
    displayName = null;
  }

  // Generated here rather than by the database: with no SELECT policy an
  // INSERT cannot return the new row.
  const sessionId = randomUUID();
  const tweets = drawTweets();

  const { error } = await supabase.from("sessions").insert({
    id: sessionId,
    display_name: displayName,
    assigned_tweet_ids: tweets.map((t) => t.id),
  });

  if (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Could not start the task. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ sessionId, tweets });
}
