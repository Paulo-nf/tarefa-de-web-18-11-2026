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

export class RegistrationRepository {
  async findById(id: number): Promise<RegistrationWithSession | null> {
    return prisma.registration.findUnique({
      where: { id },
      include: { session: true },
    });
  }

  async findAttendee(id: number): Promise<Attendee | null> {
    return prisma.attendee.findUnique({
      where: { id },
    });
  }

  async findDuplicate(
    attendeeId: number,
    sessionId: number,
    excludeId?: number
  ): Promise<Registration | null> {
    return prisma.registration.findFirst({
      where: {
        attendeeId,
        sessionId,
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
    });
  }

  async countForSession(sessionId: number): Promise<number> {
    return prisma.registration.count({
      where: {
        sessionId,
      },
    });
  }

  async findConflict(
    attendeeId: number,
    startAt: Date,
    endAt: Date,
    excludeId?: number
  ): Promise<Registration | null> {
    return prisma.registration.findFirst({
      where: {
        attendeeId,
        ...(excludeId !== undefined && { id: { not: excludeId } }),
        session: {
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      },
    });
  }

  async create(data: CreateRegistration): Promise<Registration> {
    return prisma.registration.create({ data });
  }

  async update(id: number, data: UpdateRegistration): Promise<Registration> {
    return prisma.registration.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.registration.delete({
      where: { id },
    });
  }

  async countByEventId(eventId: number): Promise<number> {
    return prisma.registration.count({
      where: {
        session: {
          eventId,
        },
      },
    });
  }
}
