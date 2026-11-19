import type { Request, Response } from 'express';
import { SessionService } from '../../infrastructure/services/session.service.js';

export class SessionController {
  private service = new SessionService();

  list = async (req: Request, res: Response) => {
    const data = await this.service.list(req.query);
    res.json(data);
  };
};

//const { page, limit, status } = req.query; // e.g., page="2" from /users?page=2
//const data = await this.service.list({ page, limit, status });
