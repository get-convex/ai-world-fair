import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all transcriptions for a provided sessionId
export const getTranscriptionsBySessionId = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("sessionId"), sessionId))
      .collect();
  },
});

// Get a transcription for a provided requestId
export const getTranscriptionByRequestId = query({
  args: { requestId: v.string() },
  handler: async (ctx, { requestId }) => {
    return await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("requestId"), requestId))
      .first();
  },
});

// Append additional transcription text to an existing row, or create one if it doesn't exist yet
export const appendTranscription = mutation({
  args: {
    requestId: v.string(),
    sessionId: v.string(),
    speakerIdentifier: v.string(),
    date: v.number(),
    text: v.string(),
    callSid: v.string(),
    toNumber: v.string(),
    toVendor: v.string(),
  },
  handler: async (
    ctx,
    { requestId, sessionId, speakerIdentifier, date, text }
  ) => {
    const existingTranscription = await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("requestId"), requestId))
      .first();
    if (existingTranscription) {
      await ctx.db.patch(existingTranscription._id, {
        text: existingTranscription.text + " " + text,
        date,
        speakerIdentifier,
      });
    } else {
      await ctx.db.insert("transcriptions", {
        requestId,
        sessionId,
        sessionName: "",
        speakerIdentifier,
        date,
        text,
        callSid: "",
        toNumber: "",
        toVendor: "",
      });
    }
  },
});
