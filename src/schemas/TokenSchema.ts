// src/schemas/TokenSchema.ts

import { z } from 'zod';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().nonempty('Refresh token is required'),
});

export const logoutSchema = z.object({
  accessToken: z.string().nonempty('Access token is required'),
  refreshToken: z.string().nonempty('Refresh token is required'),
});
