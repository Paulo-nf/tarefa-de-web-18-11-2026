import type { Occupancy } from '../../shared/types.js';
import { EventRepository } from '../repositories/event.repository.js';
import { RegistrationRepository } from '../repositories/registration.repository.js';
import { AppError } from '../../shared/errors/AppError.js';

export class EventService {
  private repo = new EventRepository();
  private registrationrepo = new RegistrationRepository();

  async getOccupancy(eventId: number): Promise<Occupancy> {
    const event = await this.repo.findById(eventId);

    if (!event){
      throw new AppError (404, "NOT_FOUND", "O Evento não foi encontrado");
    }

    const occupied = await this.registrationrepo.countByEventId(eventId);

    const capacity = event.capacity;

    const available = Math.max(0, capacity - occupied);

    return {
      eventId: event.id,
      capacity,
      occupied,
      available,
    }
  }
}
