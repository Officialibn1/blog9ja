import { z } from 'zod';

export const categorySchema = z.object({
	name: z.string().min(3)
});

export type CategorySchema = typeof categorySchema;
