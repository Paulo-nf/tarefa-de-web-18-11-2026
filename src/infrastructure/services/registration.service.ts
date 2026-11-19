import type { Registration, Session } from '@prisma/client';
import type { CreateRegistration, UpdateRegistration } from '../../shared/types.js';
import { RegistrationRepository } from '../repositories/registration.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { AppError } from '../../shared/errors/AppError.js';

export class RegistrationService {
  private registrationRepo = new RegistrationRepository();
  private sessionRepo = new SessionRepository();

  async create(data: CreateRegistration): Promise<Registration> {
    const { attendeeId, sessionId } = data;

    const attendee = await this.registrationRepo.findAttendee(attendeeId);
    if (!attendee) {
      throw new AppError(
        404,
        'ATENDENTE_NÃO_ENCONTRADO',
        'Não existe um participante com esse id.'
      );
    }

    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new AppError(
        404,
        'SESSÃO_NÃO_ENCONTRADA',
        'Não existe uma sessão com esse id.'
      );
    }

    await this.validateAvailability(attendeeId, session, 400);
    return this.registrationRepo.create(data);
  }

  private async validateAvailability(attendeeId: number, session: Session, status: number, excludeId?: number): Promise<void> {
    const duplicate = await this.registrationRepo.findDuplicate(attendeeId, session.id, excludeId);
    if (duplicate) {
      throw new AppError(
        status,
        'JA_REGISTRADO',
        'O participante já está registrado para essa sessão.'
      );
    }

    if (session.startAt <= new Date() || session.status !== "SCHEDULED") {
      throw new AppError(
        status,
        'SESSÃO_JÁ_INICIADA',
        'Não é possível registrar em uma sessão que já começou ou não está marcada.'
      );
    }

    const conflict = await this.registrationRepo.findConflict(attendeeId, session.startAt, session.endAt, excludeId);
    if (conflict) {
      throw new AppError(
        status,
        'SESSÃO_CONFLITANTE',
        'O participante já está registrado em outra sessão que conflita no horário com essa.'
      );
    }


    const countCapacity = await this.registrationRepo.countForSession(session.id);
    if (countCapacity >= session.capacity) {
      throw new AppError(
        status,
        'SESSÃO_LOTADA',
        'Não é possível registrar, essas sessão  já atingiu sua capacidade máxima.'
      );
    }
  }

  async update(id: number, data: UpdateRegistration): Promise<Registration> {
    const registration = await this.registrationRepo.findById(id);
    if (!registration) {
      throw new AppError(404, 'INSCRICAO_NAO_ENCONTRADA', 'Inscrição não encontrada.');
    }
    if (registration.session.startAt <= new Date()) {
      throw new AppError(409, 'SESSAO_INICIADA', 'A sessão original já iniciou.');
    }
    const session = await this.sessionRepo.findById(data.sessionId);
    if (!session) {
      throw new AppError(404, 'SESSAO_NAO_ENCONTRADA', 'Sessão não encontrada.');
    }
    if (session.id === registration.sessionId) {
      throw new AppError(409, 'MESMA_SESSAO', 'A nova sessão deve ser diferente da original.');
    }
    if (session.eventId !== registration.session.eventId) {
      throw new AppError(409, 'EVENTO_DIFERENTE', 'A nova sessão deve pertencer ao mesmo evento.');
    }
    await this.validateAvailability(registration.attendeeId, session, 409, id);
    return this.registrationRepo.update(id, { sessionId: session.id });
  }

  async delete(id: number): Promise<void> {
    const registration = await this.registrationRepo.findById(id);
    if (!registration) {
      throw new AppError(404, 'INSCRICAO_NAO_ENCONTRADA', 'Inscrição não encontrada.');
    }
    await this.registrationRepo.delete(id);
  }
}
