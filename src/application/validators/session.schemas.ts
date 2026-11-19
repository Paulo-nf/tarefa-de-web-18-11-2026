import { z } from 'zod';
import { SessionCategory, SessionStatus } from '@prisma/client';

export const sessionFiltersSchema = z.object({
  eventId: z.coerce.number().int().optional(),
  category: z.nativeEnum(SessionCategory).optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  title: z.string().optional(),
});

export type SessionFilters = z.infer<typeof sessionFiltersSchema>;
