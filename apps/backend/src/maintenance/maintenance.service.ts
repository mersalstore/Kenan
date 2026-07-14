import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  CreateMaintenanceContractDto,
  UpdateMaintenanceContractDto,
  CreateMaintenanceVisitDto,
  UpdateMaintenanceVisitDto,
  CompleteMaintenanceVisitDto,
} from "../shared";

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===== العقود =====
  async findContracts() {
    return this.prisma.maintenanceContract.findMany({
      include: {
        client: true,
        project: true,
        visits: true,
      },
      orderBy: { contractNumber: "asc" },
    });
  }

  async findContract(id: string) {
    const contract = await this.prisma.maintenanceContract.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        visits: { orderBy: { scheduledDate: "asc" } },
      },
    });
    if (!contract) throw new NotFoundException("عقد الصيانة غير موجود");
    return contract;
  }

  async createContract(dto: CreateMaintenanceContractDto, user: any) {
    const contract = await this.prisma.maintenanceContract.create({
      data: {
        contractNumber: dto.contractNumber,
        clientId: dto.clientId,
        projectId: dto.projectId || null,
        value: dto.value,
        currency: dto.currency || "SAR",
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        frequency: dto.frequency || "MONTHLY",
        status: dto.status || "ACTIVE",
        notes: dto.notes || "",
      },
    });
    await this.auditService.log(user.sub, "CREATE", "MaintenanceContract", contract.id, null, contract);
    return contract;
  }

  async updateContract(id: string, dto: UpdateMaintenanceContractDto, user: any) {
    const oldContract = await this.prisma.maintenanceContract.findUnique({ where: { id } });
    if (!oldContract) throw new NotFoundException("عقد الصيانة غير موجود");

    const updated = await this.prisma.maintenanceContract.update({
      where: { id },
      data: {
        contractNumber: dto.contractNumber ?? undefined,
        clientId: dto.clientId ?? undefined,
        projectId: dto.projectId ?? undefined,
        value: dto.value ?? undefined,
        currency: dto.currency ?? undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        frequency: dto.frequency ?? undefined,
        status: dto.status ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "MaintenanceContract", id, oldContract, updated);
    return updated;
  }

  async deleteContract(id: string, user: any) {
    const contract = await this.prisma.maintenanceContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException("عقد الصيانة غير موجود");

    await this.prisma.maintenanceContract.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "MaintenanceContract", id, contract, null);
    return { ok: true };
  }

  // ===== الزيارات =====
  async findVisits() {
    return this.prisma.maintenanceVisit.findMany({
      include: {
        contract: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });
  }

  async createVisit(dto: CreateMaintenanceVisitDto, user: any) {
    const visit = await this.prisma.maintenanceVisit.create({
      data: {
        contractId: dto.contractId,
        scheduledDate: new Date(dto.scheduledDate),
        completedDate: dto.completedDate ? new Date(dto.completedDate) : null,
        status: dto.status || "SCHEDULED",
        performedBy: dto.performedBy || "",
        notes: dto.notes || "",
      },
    });
    await this.auditService.log(user.sub, "CREATE", "MaintenanceVisit", visit.id, null, visit);
    return visit;
  }

  async updateVisit(id: string, dto: UpdateMaintenanceVisitDto, user: any) {
    const oldVisit = await this.prisma.maintenanceVisit.findUnique({ where: { id } });
    if (!oldVisit) throw new NotFoundException("الزيارة غير موجودة");

    const updated = await this.prisma.maintenanceVisit.update({
      where: { id },
      data: {
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        completedDate: dto.completedDate ? new Date(dto.completedDate) : undefined,
        status: (dto.status as any) ?? undefined,
        performedBy: dto.performedBy ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "MaintenanceVisit", id, oldVisit, updated);
    return updated;
  }

  async completeVisit(id: string, dto: CompleteMaintenanceVisitDto, user: any) {
    const oldVisit = await this.prisma.maintenanceVisit.findUnique({ where: { id } });
    if (!oldVisit) throw new NotFoundException("الزيارة غير موجودة");

    const updated = await this.prisma.maintenanceVisit.update({
      where: { id },
      data: {
        status: "DONE",
        completedDate: dto.completedDate ? new Date(dto.completedDate) : new Date(),
        performedBy: dto.performedBy ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "MaintenanceVisit", id, oldVisit, updated);
    return updated;
  }

  async deleteVisit(id: string, user: any) {
    const visit = await this.prisma.maintenanceVisit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException("الزيارة غير موجودة");

    await this.prisma.maintenanceVisit.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "MaintenanceVisit", id, visit, null);
    return { ok: true };
  }
}
