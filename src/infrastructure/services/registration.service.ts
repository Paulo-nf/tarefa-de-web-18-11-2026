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
    const date = new Date();

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

    const duplicate = await this.registrationRepo.findDuplicate(attendeeId, sessionId);
    if (duplicate) {
      throw new AppError(
        400,
        'JA_REGISTRADO',
        'O participante já está registrado para essa sessão.'
      );
    }

    if (session.startAt < date || session.status !== "SCHEDULED") {
      throw new AppError(
        400,
        'SESSÃO_JÁ_INICIADA',
        'Não é possível registrar em uma sessão que já começou ou não está marcada.'
      );
    }

    const conflict = await this.registrationRepo.findConflict(attendeeId, session.startAt, session.endAt);
    if (conflict) {
      throw new AppError(
        400,
        'SESSÃO_CONFLITANTE',
        'O participante já está registrado em outra sessão que conflita no horário com essa.'
      );
    }


    const countCapacity = await this.registrationRepo.countForSession(sessionId);
    if (countCapacity >= session.capacity) {
      throw new AppError(
        400,
        'SESSÃO_LOTADA',
        'Não é possível registrar, essas sessão  já atingiu sua capacidade máxima.'
      );
    }

    return this.registrationRepo.create(data);
  }

  async update(id: number, data: UpdateRegistration): Promise<Registration> {
    // TODO: implementar a funcionalidade e as regras de negócio aplicáveis.
    throw new AppError(
      501,
      'NOT_IMPLEMENTED',
      'Funcionalidade ainda não implementada.'
    );
  }

  async delete(id: number): Promise<void> {
    const registration = await this.registrationRepo.findById(id);
    if (!registration) {
      throw new AppError(404, 'INSCRICAO_NAO_ENCONTRADA', 'Inscrição não encontrada.');
    }
    await this.registrationRepo.delete(id);
  }
}
