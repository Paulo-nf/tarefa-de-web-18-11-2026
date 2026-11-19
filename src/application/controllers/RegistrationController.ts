import type { Request, Response } from 'express';
import { RegistrationService } from '../../infrastructure/services/registration.service.js';
import { createRegistrationSchema as createRegistration } from '../validators/registration.schemas.js';
import { registrationId, updateRegistrationSchema } from '../validators/registration.schemas.js';

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
    const { id } = registrationId.parse(req.params);
    const data = updateRegistrationSchema.parse(req.body);
    const registration = await this.service.update(id, data);
    res.status(200).json(registration);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = registrationId.parse(req.params);
    await this.service.delete(id);
    res.status(204).send();
  };
}
