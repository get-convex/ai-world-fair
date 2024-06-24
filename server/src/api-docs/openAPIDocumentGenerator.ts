import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { healthCheckRegistry } from '@/api/healthCheck/healthCheckRouter';
import { userRegistry } from '@/api/user/userRouter';

export const streamRegistry = new OpenAPIRegistry();
streamRegistry.registerPath({
  method: 'get',
  path: '/stream',
  tags: ['Stream'],
  responses: {
    200: {
      description: 'Stream XML file',
      content: {
        'application/xml': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  },
});

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([healthCheckRegistry, userRegistry, streamRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
