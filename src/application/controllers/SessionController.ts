import type { Request, Response } from 'express';
import { SessionService } from '../../infrastructure/services/session.service.js';
import { sessionFiltersSchema } from '../../application/validators/session.schemas.js';


export class SessionController {
  private service = new SessionService();

  list = async (req: Request, res: Response) => {
    const filters = sessionFiltersSchema.parse(req.query);
    const data = await this.service.list(filters);
    res.json(data);
  };
};
