import type { Request, Response } from 'express';
import { EventService } from '../../infrastructure/services/event.service.js';

export class EventController {
  private service = new EventService();

  occupancy = async (req: Request, res: Response): Promise<void> => {
    const eventId = Number(req.params.eventId);

    const result = await this.service.getOccupancy(eventId);

    res.status(200).json(result);
  };
}
