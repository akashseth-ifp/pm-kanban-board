import { NextFunction, Request, Response } from 'express'
import { ZodObject } from 'zod'

export const validateResource =
	(schema: ZodObject) =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params
			})
			next()
		} catch (e: any) {
			req.log.error(`validate Resource Failed. ${e}`)
			return res.status(400).send({ errors: e.issues, error_type: "validation_error" })
		}
	}