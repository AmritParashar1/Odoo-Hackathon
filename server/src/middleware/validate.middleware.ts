import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors';

/**
 * Request validation middleware factory.
 * Validates request body, query, and/or params against Zod schemas.
 *
 * @example
 * router.post('/assets', validate({ body: createAssetSchema }), controller.create);
 * router.get('/assets', validate({ query: paginationSchema }), controller.list);
 * router.get('/assets/:id', validate({ params: idParamSchema }), controller.getById);
 */
export function validate(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });

        next(new ValidationError(fieldErrors));
      } else {
        next(error);
      }
    }
  };
}
