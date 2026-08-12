import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { HrService } from "./hr.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateTeamDto,
  CreateAssignmentDto,
  UpsertAttendanceDto,
  CreateLeaveDto,
  CreatePayrollRunDto,
  UpdatePayrollRunDto,
  UpdatePayrollStatusDto,
} from "../shared";

@Controller("api/hr")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ===== العمال =====
  @Get("workers")
  @RequirePermission("workers", "READ")
  async findWorkers() {
    return this.hrService.findWorkers();
  }

  @Post("workers")
  @RequirePermission("workers", "CREATE")
  async createWorker(@Body() dto: CreateWorkerDto, @Req() req: any) {
    return this.hrService.createWorker(dto, req.user);
  }

  @Patch("workers/:id")
  @RequirePermission("workers", "UPDATE")
  async updateWorker(@Param("id") id: string, @Body() dto: UpdateWorkerDto, @Req() req: any) {
    return this.hrService.updateWorker(id, dto, req.user);
  }

  @Delete("workers/:id")
  @RequirePermission("workers", "DELETE")
  async deleteWorker(@Param("id") id: string, @Req() req: any) {
    return this.hrService.deleteWorker(id, req.user);
  }

  // ===== فرق العمل =====
  @Get("teams")
  @RequirePermission("teams", "READ")
  async findTeams() {
    return this.hrService.findTeams();
  }

  @Post("teams")
  @RequirePermission("teams", "CREATE")
  async createTeam(@Body() dto: CreateTeamDto, @Req() req: any) {
    return this.hrService.createTeam(dto, req.user);
  }

  @Patch("teams/:id")
  @RequirePermission("teams", "UPDATE")
  async updateTeam(@Param("id") id: string, @Body() dto: Partial<CreateTeamDto>, @Req() req: any) {
    return this.hrService.updateTeam(id, dto, req.user);
  }

  @Delete("teams/:id")
  @RequirePermission("teams", "DELETE")
  async deleteTeam(@Param("id") id: string, @Req() req: any) {
    return this.hrService.deleteTeam(id, req.user);
  }

  // ===== التعيينات =====
  @Get("assignments")
  @RequirePermission("teams", "READ")
  async findAssignments() {
    return this.hrService.findAssignments();
  }

  @Post("assignments")
  @RequirePermission("teams", "CREATE")
  async createAssignment(@Body() dto: CreateAssignmentDto, @Req() req: any) {
    return this.hrService.createAssignment(dto, req.user);
  }

  @Patch("assignments/:id")
  @RequirePermission("teams", "UPDATE")
  async updateAssignment(@Param("id") id: string, @Body() dto: Partial<CreateAssignmentDto>, @Req() req: any) {
    return this.hrService.updateAssignment(id, dto, req.user);
  }

  @Delete("assignments/:id")
  @RequirePermission("teams", "DELETE")
  async deleteAssignment(@Param("id") id: string, @Req() req: any) {
    return this.hrService.deleteAssignment(id, req.user);
  }

  // ===== الحضور =====
  @Get("attendance")
  @RequirePermission("attendance", "READ")
  async findAttendance() {
    return this.hrService.findAttendance();
  }

  @Post("attendance")
  @RequirePermission("attendance", "CREATE")
  async upsertAttendance(@Body() dto: UpsertAttendanceDto, @Req() req: any) {
    return this.hrService.upsertAttendance(dto, req.user);
  }

  // ===== الإجازات =====
  @Get("leaves")
  @RequirePermission("leaves", "READ")
  async findLeaves() {
    return this.hrService.findLeaves();
  }

  @Post("leaves")
  @RequirePermission("leaves", "CREATE")
  async createLeave(@Body() dto: CreateLeaveDto, @Req() req: any) {
    return this.hrService.createLeave(dto, req.user);
  }

  @Patch("leaves/:id")
  @RequirePermission("leaves", "UPDATE")
  async updateLeaveStatus(
    @Param("id") id: string,
    @Body("status") status: "PENDING" | "APPROVED" | "REJECTED",
    @Req() req: any,
  ) {
    return this.hrService.updateLeaveStatus(id, status, req.user);
  }

  @Delete("leaves/:id")
  @RequirePermission("leaves", "DELETE")
  async deleteLeave(@Param("id") id: string, @Req() req: any) {
    return this.hrService.deleteLeave(id, req.user);
  }

  // ===== مسيرات الرواتب =====
  @Get("payroll")
  @RequirePermission("payroll", "READ")
  async findPayroll() {
    return this.hrService.findPayroll();
  }

  @Post("payroll")
  @RequirePermission("payroll", "CREATE")
  async createPayroll(@Body() dto: CreatePayrollRunDto, @Req() req: any) {
    return this.hrService.createPayroll(dto, req.user);
  }

  @Patch("payroll/:id")
  @RequirePermission("payroll", "UPDATE")
  async updatePayroll(
    @Param("id") id: string,
    @Body() dto: UpdatePayrollRunDto,
    @Req() req: any,
  ) {
    return this.hrService.updatePayroll(id, dto, req.user);
  }

  @Patch("payroll/:id/status")
  @RequirePermission("payroll", "UPDATE")
  async updatePayrollStatus(
    @Param("id") id: string,
    @Body() dto: UpdatePayrollStatusDto,
    @Req() req: any,
  ) {
    return this.hrService.updatePayrollStatus(id, dto.status, req.user);
  }

  @Delete("payroll/:id")
  @RequirePermission("payroll", "DELETE")
  async deletePayroll(@Param("id") id: string, @Req() req: any) {
    return this.hrService.deletePayroll(id, req.user);
  }
}
