import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(32),
});

export const loginSchema = schema;
