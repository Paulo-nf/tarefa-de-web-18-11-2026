import type { Request, Response } from 'express';
import { RegistrationService } from '../../infrastructure/services/registration.service.js';
import { createRegistrationSchema as createRegistration } from '../validators/registration.schemas.js';
// Trecho gerado por IA ..!
import { registrationId } from '../validators/registration.schemas.js';

export class RegistrationController {
  private service = new RegistrationService();

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createRegistration.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Body inválido.",
        errors: parsed.error.flatten(),
      });
      return;
    }

    try {
      const registration = await this.service.create(parsed.data);

      res.status(201).json(registration);
    } catch (error) {
      throw error;
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    // TODO: validar entrada, chamar o service e devolver a resposta HTTP.
    res.status(501).json({
      error: 'NOT_IMPLEMENTED',
      message: 'Endpoint ainda não implementado.'
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    // Trecho gerado por IA ..!
    const { id } = registrationId.parse(req.params);
    await this.service.delete(id);
    res.status(204).send();
  };
}
