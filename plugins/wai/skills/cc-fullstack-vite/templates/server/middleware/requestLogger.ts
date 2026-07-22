import type Koa from 'koa';

export function requestLogger(): Koa.Middleware {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.status} — ${ms}ms`);
  };
}
