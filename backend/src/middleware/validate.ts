import type { RequestHandler } from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';
import type { z } from 'zod';

export type ApiHandler<T> = RequestHandler<ParamsDictionary, unknown, unknown, Query, { input: T }>;

export function validate<T extends z.ZodType>(schema: T): ApiHandler<z.output<T>> {
  return (req, res, next) => {
    res.locals.input = schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  };
}
