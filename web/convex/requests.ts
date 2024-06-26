import {
  query,
  internalMutation,
  internalAction,
  mutation,
} from "./_generated/server";
import { v } from "convex/values";

import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { FunctionReference, FunctionReturnType } from "convex/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("requests").collect();
  },
});

export const getRequestById = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, { requestId }) => {
    return await ctx.db.get(requestId);
  },
});

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("requests")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const postRequest = httpAction(async (ctx, request) => {
  const { sessionId, sessionName, requestMsg } = await request.json();

  const response = await ctx.runAction(internal.requests.createRequestAction, {
    sessionId,
    sessionName,
    requestMsg,
  });

  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Vary: "origin",
  });

  if (response.success) {
    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  }

  return new Response(null, {
    status: 500,
    headers,
  });
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("requests"),
    status: v.string(),
  },
  handler: async (ctx, { requestId, status }) => {
    const result = await ctx.db.patch(requestId, {
      status,
    });

    return {
      success: true,
      result,
    };
  },
});

export const updateRequestStatusWithContext = mutation({
  args: {
    requestId: v.id("requests"),
    context: v.string(),
  },
  handler: async (ctx, { requestId, context }) => {
    const result = await ctx.db.patch(requestId, {
      context: context,
    });

    return {
      success: true,
      result,
    };
  },
});

export const createRequestAction = internalAction({
  args: {
    sessionId: v.string(),
    sessionName: v.string(),
    requestMsg: v.string(),
  },
  handler: async (ctx, { sessionId, sessionName, requestMsg }) => {
    const result: FunctionReturnType<
      FunctionReference<"mutation", "internal">
    > = await ctx.runMutation(internal.requests.createRequestMutation, {
      sessionId,
      sessionName,
      requestMsg,
    });
    console.log(result);
    return result;
  },
});

export const createRequestMutation = internalMutation({
  args: {
    sessionId: v.string(),
    sessionName: v.string(),
    requestMsg: v.string(),
  },
  handler: async (ctx, { sessionId, sessionName, requestMsg }) => {
    const result = await ctx.db.insert("requests", {
      sessionId,
      sessionName,
      requestMsg,
      date: new Date().getTime(),
      status: "pending",
    });

    return {
      success: true,
      requestId: result,
    };
  },
});
