import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateContractDto, UpdateContractDto } from "../shared";
import { TemplateType } from "@prisma/client";

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // 1. Find all contracts
  async findAll() {
    return this.prisma.contract.findMany({
      include: { client: true, project: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Find one contract
  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { client: true, project: true, payments: true },
    });

    if (!contract) {
      throw new NotFoundException("العقد غير موجود");
    }

    return contract;
  }

  // 3. Create Contract
  async create(dto: CreateContractDto, user: any) {
    const contract = await this.prisma.contract.create({
      data: {
        projectId: dto.projectId,
        clientId: dto.clientId,
        value: dto.value,
        currency: dto.currency,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        warranty: dto.warranty,
        clauses: dto.clauses,
        secondPartyName: dto.secondPartyName,
        secondPartyRegister: dto.secondPartyRegister,
        secondPartyRepresentative: dto.secondPartyRepresentative,
        secondPartyRole: dto.secondPartyRole || "المالك",
        locationCity: dto.locationCity,
        locationDistrict: dto.locationDistrict,
        locationPlot: dto.locationPlot,
        locationPlan: dto.locationPlan,
        quotationNumber: dto.quotationNumber,
        quotationValue: dto.quotationValue,
        specs: dto.specs || [],
        payments: {
          create: dto.payments?.map((p) => ({
            label: p.label,
            percent: p.percent,
          })) || [],
        },
      },
      include: { payments: true },
    });

    await this.auditService.log(user.sub, "CREATE", "Contract", contract.id, null, contract);
    return contract;
  }

  async update(id: string, dto: UpdateContractDto, user: any) {
    const oldC = await this.findOne(id);

    const updatedC = await this.prisma.contract.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        clientId: dto.clientId,
        value: dto.value,
        currency: dto.currency,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        warranty: dto.warranty,
        clauses: dto.clauses,
        secondPartyName: dto.secondPartyName,
        secondPartyRegister: dto.secondPartyRegister,
        secondPartyRepresentative: dto.secondPartyRepresentative,
        secondPartyRole: dto.secondPartyRole,
        locationCity: dto.locationCity,
        locationDistrict: dto.locationDistrict,
        locationPlot: dto.locationPlot,
        locationPlan: dto.locationPlan,
        quotationNumber: dto.quotationNumber,
        quotationValue: dto.quotationValue,
        specs: dto.specs,
        payments: dto.payments ? {
          deleteMany: {},
          create: dto.payments.map((p) => ({
            label: p.label,
            percent: p.percent,
          })),
        } : undefined,
      },
      include: { payments: true },
    });

    await this.auditService.log(user.sub, "UPDATE", "Contract", id, oldC, updatedC);
    return updatedC;
  }

  // 4. Delete contract
  async delete(id: string, user: any) {
    const oldC = await this.findOne(id);
    await this.prisma.contract.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "Contract", id, oldC, null);
    return { ok: true };
  }

  // 5. Templates CRUD
  async getTemplate(type: TemplateType) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { type },
    });

    if (!template) {
      return this.prisma.contractTemplate.create({
        data: {
          type,
          content: `Default default content for ${type}`,
        },
      });
    }

    return template;
  }

  async updateTemplate(type: TemplateType, content: string, user: any) {
    const oldT = await this.prisma.contractTemplate.findUnique({
      where: { type },
    });

    const updatedT = await this.prisma.contractTemplate.upsert({
      where: { type },
      create: { type, content },
      update: { content },
    });

    await this.auditService.log(
      user.sub,
      "UPDATE",
      "ContractTemplate",
      type.toString(),
      oldT,
      updatedT,
    );

    return updatedT;
  }
}
