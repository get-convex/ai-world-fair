import { FunctionReference, FunctionReturnType } from 'convex/server';
import { v } from 'convex/values';

import { internal } from './_generated/api';
import { internalAction, internalMutation, mutation, query } from './_generated/server';
import { httpAction } from './_generated/server';

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('requests').collect();
  },
});

export const addToTranscript = mutation({
  args: {
    requestId: v.id('requests'),
    transcriptEntry: v.string(),
  },
  handler: async (ctx, { requestId, transcriptEntry }) => {
    const request = await ctx.db.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const updatedTranscript = request.transcript ? [...request.transcript, transcriptEntry] : [transcriptEntry];

    const result = await ctx.db.patch(requestId, {
      transcript: updatedTranscript,
    });

    return {
      success: true,
      result,
    };
  },
});

export const getRequestById = query({
  args: {
    requestId: v.id('requests'),
  },
  handler: async (ctx, { requestId }) => {
    return await ctx.db.get(requestId);
  },
});

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('requests')
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();
  },
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id('requests'),
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
    requestId: v.id('requests'),
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

export const postRequest = httpAction(async (ctx, request) => {
  const { sessionId, sessionName, requestMsg } = await request.json();

  const response = await ctx.runAction(internal.requests.createRequestAction, {
    sessionId,
    sessionName,
    requestMsg,
  });

  if (response.success) {
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        Vary: 'origin',
      }),
    });
  }

  return new Response(null, {
    status: 500,
  });
});

export const createRequestAction = internalAction({
  args: {
    sessionId: v.string(),
    sessionName: v.string(),
    requestMsg: v.string(),
  },
  handler: async (ctx, { sessionId, sessionName, requestMsg }) => {
    const result: FunctionReturnType<FunctionReference<'mutation', 'internal'>> = await ctx.runMutation(
      internal.requests.createRequestMutation,
      {
        sessionId,
        sessionName,
        requestMsg,
      }
    );
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
    const result = await ctx.db.insert('requests', {
      sessionId,
      sessionName,
      requestMsg,
      date: new Date().getTime(),
      status: 'pending',
    });

    return {
      success: true,
      requestId: result,
    };
  },
});
