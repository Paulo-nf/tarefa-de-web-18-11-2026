import type { Request, Response } from 'express';
import { SessionService } from '../../infrastructure/services/session.service.js';

export class SessionController {
  private service = new SessionService();

  list = async (req: Request, res: Response) => {
    let { eventId, category, status, title } = req.query;
    if(eventId) eventId = Number(eventId);
    const data = await this.service.list({ eventId, category, status, title });
    res.json(data);
  };
};
