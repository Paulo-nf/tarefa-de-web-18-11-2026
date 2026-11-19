import { z } from "zod";

// TODO: definir e exportar os schemas Zod para o body de criação e atualização.
// Os contratos estão no enunciado.

export const registrationId = z.object({
  id: z.coerce.number().int().positive().max(2147483647),
});

export const createRegistrationSchema = z.object({
  attendeeId: z.number().int().positive().max(2147483647),
  sessionId: z.number().int().positive().max(2147483647),
}).strict();

export const updateRegistrationSchema = z.object({
  sessionId: z.number().int().positive().max(2147483647)
}).strict();

export type CreateRegistrationSchema = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationSchema = z.infer<typeof updateRegistrationSchema>;
export type RegistrationIdSchema = z.infer<typeof registrationId>;
