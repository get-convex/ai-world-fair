import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    transcriptions: defineTable({
      requestId: v.string(),
      sessionId: v.string(),
      sessionName: v.string(),
      speakerIdentifier: v.string(),
      date: v.number(),
      text: v.string(),
      callSid: v.optional(v.string()),
      toNumber: v.optional(v.string()),
      toVendor: v.optional(v.string()),
    }),
    requests: defineTable({
      date: v.number(),
      description: v.optional(v.string()),
      details: v.optional(v.string()),
      sessionId: v.string(),
      sessionName: v.string(),
      status: v.string(),
      subdetails: v.optional(v.string()),
      requestMsg: v.string(),
      relevantContext: v.optional(v.array(v.string())),
      transcriptions: v.optional(v.array(v.id("transcriptions"))),
      transcript: v.optional(v.array(v.string())),
      sessionUser: v.optional(v.id("sessionUsers")),
      deductions: v.optional(v.array(v.string())),
      context: v.optional(v.string()),
    }),
    sessionUsers: defineTable({
      context: v.array(v.string()),
      email: v.string(),
      name: v.string(),
    }),
  },
  {
    schemaValidation: false,
  }
);
