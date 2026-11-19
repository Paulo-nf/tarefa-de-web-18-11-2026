import type { Session, Event, Registration, Attendee } from '@prisma/client';
import type {
  SessionFilters,
  SessionWithCount,
  RegistrationWithSession,
  CreateRegistration,
  UpdateRegistration
} from '../../shared/types.js';
import { prisma } from '../prisma/index.js';
import { AppError } from '../../shared/errors/AppError.js';

export class EventRepository {
  async findById(id: number): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } })
  }

  async sessionsWithCounts(eventId: number): Promise<SessionWithCount[]> {
    return prisma.session.findMany({
      where: { eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }
}
