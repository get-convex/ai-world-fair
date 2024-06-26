import { v } from 'convex/values';

import { query } from './_generated/server';

export const getSessionUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('sessionUsers')
      .filter((q) => q.eq(q.field('email'), email))
      .first();
  },
});
