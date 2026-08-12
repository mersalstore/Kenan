import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateTeamDto,
  CreateAssignmentDto,
  UpsertAttendanceDto,
  CreateLeaveDto,
  CreatePayrollRunDto,
  UpdatePayrollRunDto,
} from "../shared";

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===== العمال =====
  async findWorkers() {
    return this.prisma.worker.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      include: { assignments: { where: { endDate: null }, select: { projectId: true } } },
    });
  }

  async createWorker(dto: CreateWorkerDto, user: any) {
    const worker = await this.prisma.worker.create({
      data: {
        name: dto.name,
        specialty: dto.specialty || "",
        phone: dto.phone || "",
        dailyRate: dto.dailyRate ?? 0,
        nationalId: dto.nationalId,
        employmentType: dto.employmentType || "يومي",
        monthlySalary: dto.monthlySalary ?? 0,
      },
    });
    await this.auditService.log(user.sub, "CREATE", "Worker", worker.id, null, worker);
    return worker;
  }

  async updateWorker(id: string, dto: UpdateWorkerDto, user: any) {
    const oldWorker = await this.prisma.worker.findUnique({ where: { id } });
    if (!oldWorker) throw new NotFoundException("العامل غير موجود");

    const updated = await this.prisma.worker.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        specialty: dto.specialty ?? undefined,
        phone: dto.phone ?? undefined,
        dailyRate: dto.dailyRate ?? undefined,
        nationalId: dto.nationalId ?? undefined,
        employmentType: dto.employmentType ?? undefined,
        monthlySalary: dto.monthlySalary ?? undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "Worker", id, oldWorker, updated);
    return updated;
  }

  async deleteWorker(id: string, user: any) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException("العامل غير موجود");

    // تعطيل بدل الحذف للحفاظ على سجلات الحضور والرواتب
    await this.prisma.worker.update({ where: { id }, data: { isActive: false } });
    await this.auditService.log(user.sub, "DELETE", "Worker", id, worker, null);
    return { ok: true };
  }

  // ===== فرق العمل والتعيينات =====
  async findTeams() {
    return this.prisma.workTeam.findMany({ orderBy: { createdAt: "asc" } });
  }

  async createTeam(dto: CreateTeamDto, user: any) {
    const team = await this.prisma.workTeam.create({
      data: {
        name: dto.name,
        subcontractorId: dto.subcontractorId || null,
        teamLead: dto.teamLead,
        trade: dto.trade,
      },
    });
    await this.auditService.log(user.sub, "CREATE", "WorkTeam", team.id, null, team);
    return team;
  }

  async deleteTeam(id: string, user: any) {
    const team = await this.prisma.workTeam.findUnique({ where: { id } });
    if (!team) throw new NotFoundException("الفريق غير موجود");

    await this.prisma.workTeam.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "WorkTeam", id, team, null);
    return { ok: true };
  }

  async updateTeam(id: string, dto: Partial<CreateTeamDto>, user: any) {
    const team = await this.prisma.workTeam.findUnique({ where: { id } });
    if (!team) throw new NotFoundException("الفريق غير موجود");

    const updated = await this.prisma.workTeam.update({
      where: { id },
      data: {
        name: dto.name ?? team.name,
        teamLead: dto.teamLead !== undefined ? dto.teamLead : team.teamLead,
        trade: dto.trade !== undefined ? dto.trade : team.trade,
        subcontractorId: dto.subcontractorId !== undefined ? (dto.subcontractorId || null) : team.subcontractorId,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "WorkTeam", id, team, updated);
    return updated;
  }

  async findAssignments() {
    return this.prisma.projectAssignment.findMany({ orderBy: { startDate: "desc" } });
  }

  async createAssignment(dto: CreateAssignmentDto, user: any) {
    const assignment = await this.prisma.projectAssignment.create({
      data: {
        projectId: dto.projectId,
        workerId: dto.workerId || null,
        contractorId: dto.contractorId || null,
        teamId: dto.teamId || null,
        roleOnSite: dto.roleOnSite || "",
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
    await this.auditService.log(user.sub, "CREATE", "ProjectAssignment", assignment.id, null, assignment);
    return assignment;
  }

  async updateAssignment(id: string, dto: Partial<CreateAssignmentDto>, user: any) {
    const assignment = await this.prisma.projectAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException("التعيين غير موجود");

    const updated = await this.prisma.projectAssignment.update({
      where: { id },
      data: {
        projectId: dto.projectId ?? assignment.projectId,
        teamId: dto.teamId !== undefined ? (dto.teamId || null) : assignment.teamId,
        workerId: dto.workerId !== undefined ? (dto.workerId || null) : assignment.workerId,
        roleOnSite: dto.roleOnSite ?? assignment.roleOnSite,
        startDate: dto.startDate ? new Date(dto.startDate) : assignment.startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : assignment.endDate,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "ProjectAssignment", id, assignment, updated);
    return updated;
  }

  async deleteAssignment(id: string, user: any) {
    const assignment = await this.prisma.projectAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException("التعيين غير موجود");

    await this.prisma.projectAssignment.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "ProjectAssignment", id, assignment, null);
    return { ok: true };
  }

  // ===== الحضور =====
  async findAttendance() {
    return this.prisma.attendanceRecord.findMany({ orderBy: { date: "desc" }, take: 500 });
  }

  async upsertAttendance(dto: UpsertAttendanceDto, user: any) {
    const date = new Date(dto.date);
    const record = await this.prisma.attendanceRecord.upsert({
      where: { workerId_date: { workerId: dto.workerId, date } },
      create: {
        workerId: dto.workerId,
        projectId: dto.projectId || null,
        date,
        status: dto.status as any,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        hours: dto.hours ?? 0,
        overtimeHours: dto.overtimeHours ?? 0,
      },
      update: {
        projectId: dto.projectId || null,
        status: dto.status as any,
        checkIn: dto.checkIn ?? undefined,
        checkOut: dto.checkOut ?? undefined,
        hours: dto.hours ?? undefined,
        overtimeHours: dto.overtimeHours ?? undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "AttendanceRecord", record.id, null, record);
    return record;
  }

  // ===== الإجازات =====
  async findLeaves() {
    return this.prisma.leave.findMany({ orderBy: { startDate: "desc" } });
  }

  async createLeave(dto: CreateLeaveDto, user: any) {
    const leave = await this.prisma.leave.create({
      data: {
        workerId: dto.workerId,
        type: dto.type as any,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason || "",
      },
    });
    await this.auditService.log(user.sub, "CREATE", "Leave", leave.id, null, leave);
    return leave;
  }

  async updateLeaveStatus(id: string, status: string, user: any) {
    const oldLeave = await this.prisma.leave.findUnique({ where: { id } });
    if (!oldLeave) throw new NotFoundException("طلب الإجازة غير موجود");

    const updated = await this.prisma.leave.update({
      where: { id },
      data: { status: status as any },
    });
    await this.auditService.log(user.sub, "UPDATE", "Leave", id, oldLeave, updated);
    return updated;
  }

  async deleteLeave(id: string, user: any) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException("طلب الإجازة غير موجود");

    await this.prisma.leave.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "Leave", id, leave, null);
    return { ok: true };
  }

  // ===== مسيرات الرواتب =====
  async findPayroll() {
    return this.prisma.payrollRun.findMany({
      include: { worker: true },
      orderBy: { period: "desc" },
    });
  }

  async createPayroll(dto: CreatePayrollRunDto, user: any) {
    const payroll = await this.prisma.payrollRun.create({
      data: {
        workerId: dto.workerId,
        period: dto.period,
        presentDays: dto.presentDays,
        baseAmount: dto.baseAmount,
        overtimeAmount: dto.overtimeAmount,
        deductions: dto.deductions,
        netAmount: dto.netAmount,
        status: dto.status ?? "DRAFT",
        notes: dto.notes,
      },
    });
    await this.auditService.log(user.sub, "CREATE", "PayrollRun", payroll.id, null, payroll);
    return payroll;
  }

  async updatePayroll(id: string, dto: UpdatePayrollRunDto, user: any) {
    const oldPayroll = await this.prisma.payrollRun.findUnique({ where: { id } });
    if (!oldPayroll) throw new NotFoundException("مسير الراتب غير موجود");

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        workerId: dto.workerId ?? undefined,
        period: dto.period ?? undefined,
        presentDays: dto.presentDays ?? undefined,
        baseAmount: dto.baseAmount ?? undefined,
        overtimeAmount: dto.overtimeAmount ?? undefined,
        deductions: dto.deductions ?? undefined,
        netAmount: dto.netAmount ?? undefined,
        status: dto.status ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
    await this.auditService.log(user.sub, "UPDATE", "PayrollRun", id, oldPayroll, updated);
    return updated;
  }

  async updatePayrollStatus(id: string, status: any, user: any) {
    const oldPayroll = await this.prisma.payrollRun.findUnique({ where: { id } });
    if (!oldPayroll) throw new NotFoundException("مسير الراتب غير موجود");

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: { status },
    });
    await this.auditService.log(user.sub, "UPDATE", "PayrollRun", id, oldPayroll, updated);
    return updated;
  }

  async deletePayroll(id: string, user: any) {
    const payroll = await this.prisma.payrollRun.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException("مسير الراتب غير موجود");

    await this.prisma.payrollRun.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "PayrollRun", id, payroll, null);
    return { ok: true };
  }
}
