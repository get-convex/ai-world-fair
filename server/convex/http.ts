import { httpRouter } from 'convex/server';

import { httpAction } from './_generated/server';
import { postRequest } from './requests';

const http = httpRouter();

http.route({
  path: '/request',
  method: 'POST',
  handler: postRequest,
});

http.route({
  path: '/request',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    return new Response(null, {
      status: 204,
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }),
    });
  }),
});

export default http;
