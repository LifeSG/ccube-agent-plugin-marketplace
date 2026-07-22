import type Koa from 'koa';

export function errorHandler(): Koa.Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status ?? 500;
      ctx.status = status;
      console.error(
        process.env['NODE_ENV'] === 'production'
          ? { status, message: (err as Error).message }
          : err,
      );
      ctx.body = {
        error: {
          status: process.env['NODE_ENV'] === 'production' ? 500 : status,
          message:
            process.env['NODE_ENV'] === 'production'
              ? 'Internal Server Error'
              : (err as Error).message,
        },
      };
    }
  };
}
