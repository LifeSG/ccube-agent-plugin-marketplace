import Router from '@koa/router';

export const healthRouter = new Router({ prefix: '/api' });

healthRouter.get('/health', (ctx) => {
  ctx.body = {
    data: {
      status: 'healthy',
      uptime: process.uptime(),
    },
  };
});
