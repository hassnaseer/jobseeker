import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@/modules/admin/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async record(input: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    ip?: string | null;
  }): Promise<AuditLog> {
    return this.auditLogRepository.save(
      this.auditLogRepository.create({
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata ?? null,
        ip: input.ip ?? null,
      }),
    );
  }

  async list(options: { entityType?: string; actorId?: string } = {}): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        ...(options.entityType ? { entityType: options.entityType } : {}),
        ...(options.actorId ? { actorId: options.actorId } : {}),
      },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
