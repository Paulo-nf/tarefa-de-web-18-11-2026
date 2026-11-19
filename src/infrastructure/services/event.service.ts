import type { Occupancy, SessionOccupancy } from '../../shared/types.js';
import { EventRepository } from '../repositories/event.repository.js';
import { AppError } from '../../shared/errors/AppError.js';

function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100 * 100) / 100;
}

export class EventService {
  private repo = new EventRepository();

  async getOccupancy(eventId: number): Promise<Occupancy> {
    const event = await this.repo.findById(eventId);

    if (!event) {
      throw new AppError(404, 'NOT_FOUND', 'O Evento não foi encontrado');
    }

    const sessionsWithCounts = await this.repo.sessionsWithCounts(eventId);

    const sessions: SessionOccupancy[] = sessionsWithCounts.map((session) => {
      const registered = session._count.registrations;
      const capacity = session.capacity;

      return {
        sessionId: session.id,
        title: session.title,
        capacity,
        registered,
        available: Math.max(0, capacity - registered), occupancyPercentage: percentage(registered, capacity)
      };
    });

    const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
    const totalRegistrations = sessions.reduce((sum, s) => sum + s.registered, 0);

    return {
      eventId: event.id,
      eventName: event.name,
      totalSessions: sessions.length,
      totalRegistrations,
      totalCapacity,
      overallOccupancyPercentage: percentage(totalRegistrations, totalCapacity),
      sessions,
    };
  }
}
