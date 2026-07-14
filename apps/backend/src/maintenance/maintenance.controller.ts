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
import { MaintenanceService } from "./maintenance.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import {
  CreateMaintenanceContractDto,
  UpdateMaintenanceContractDto,
  CreateMaintenanceVisitDto,
  UpdateMaintenanceVisitDto,
  CompleteMaintenanceVisitDto,
} from "../shared";

@Controller("api/maintenance")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // ===== العقود =====
  @Get("contracts")
  @RequirePermission("maintenance", "READ")
  async findContracts() {
    return this.maintenanceService.findContracts();
  }

  @Get("contracts/:id")
  @RequirePermission("maintenance", "READ")
  async findContract(@Param("id") id: string) {
    return this.maintenanceService.findContract(id);
  }

  @Post("contracts")
  @RequirePermission("maintenance", "CREATE")
  async createContract(@Body() dto: CreateMaintenanceContractDto, @Req() req: any) {
    return this.maintenanceService.createContract(dto, req.user);
  }

  @Patch("contracts/:id")
  @RequirePermission("maintenance", "UPDATE")
  async updateContract(
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceContractDto,
    @Req() req: any,
  ) {
    return this.maintenanceService.updateContract(id, dto, req.user);
  }

  @Delete("contracts/:id")
  @RequirePermission("maintenance", "DELETE")
  async deleteContract(@Param("id") id: string, @Req() req: any) {
    return this.maintenanceService.deleteContract(id, req.user);
  }

  // ===== الزيارات =====
  @Get("visits")
  @RequirePermission("maintenance", "READ")
  async findVisits() {
    return this.maintenanceService.findVisits();
  }

  @Post("visits")
  @RequirePermission("maintenance", "CREATE")
  async createVisit(@Body() dto: CreateMaintenanceVisitDto, @Req() req: any) {
    return this.maintenanceService.createVisit(dto, req.user);
  }

  @Patch("visits/:id")
  @RequirePermission("maintenance", "UPDATE")
  async updateVisit(
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceVisitDto,
    @Req() req: any,
  ) {
    return this.maintenanceService.updateVisit(id, dto, req.user);
  }

  @Patch("visits/:id/complete")
  @RequirePermission("maintenance", "UPDATE")
  async completeVisit(
    @Param("id") id: string,
    @Body() dto: CompleteMaintenanceVisitDto,
    @Req() req: any,
  ) {
    return this.maintenanceService.completeVisit(id, dto, req.user);
  }

  @Delete("visits/:id")
  @RequirePermission("maintenance", "DELETE")
  async deleteVisit(@Param("id") id: string, @Req() req: any) {
    return this.maintenanceService.deleteVisit(id, req.user);
  }
}
