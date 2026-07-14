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
import { ProjectsService } from "./projects.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import { CreateProjectDto, UpdateProjectDto, UpdateStageDto, CreateStageDto, CreateClientDto, UpdateClientDto, CreateDailyReportDto, CreateSystemDto, UpdateSystemDto, CreateComponentDto, UpdateComponentDto, CreateSupplyOrderDto, UpdateSupplyOrderDto } from "../shared";

@Controller("api/projects")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @RequirePermission("projects", "READ")
  async findAll(@Req() req: any) {
    return this.projectsService.findAll(req.user);
  }

  @Get("clients")
  @RequirePermission("projects", "READ")
  async findClients() {
    return this.projectsService.findClients();
  }

  @Post("clients")
  @RequirePermission("projects", "CREATE")
  async createClient(@Body() dto: CreateClientDto, @Req() req: any) {
    return this.projectsService.createClient(dto, req.user);
  }

  @Patch("clients/:id")
  @RequirePermission("projects", "UPDATE")
  async updateClient(
    @Param("id") id: string,
    @Body() dto: UpdateClientDto,
    @Req() req: any,
  ) {
    return this.projectsService.updateClient(id, dto, req.user);
  }

  @Delete("clients/:id")
  @RequirePermission("projects", "DELETE")
  async deleteClient(@Param("id") id: string, @Req() req: any) {
    return this.projectsService.deleteClient(id, req.user);
  }

  @Get(":id")
  @RequirePermission("projects", "READ")
  async findOne(@Param("id") id: string, @Req() req: any) {
    return this.projectsService.findOne(id, req.user);
  }

  @Post()
  @RequirePermission("projects", "CREATE")
  async create(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.projectsService.create(dto, req.user);
  }

  @Patch(":id")
  @RequirePermission("projects", "UPDATE")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    return this.projectsService.update(id, dto, req.user);
  }

  @Delete(":id")
  @RequirePermission("projects", "DELETE")
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.projectsService.delete(id, req.user);
  }

  @Patch("stages/:stageId")
  @RequirePermission("stages", "UPDATE")
  async updateStage(
    @Param("stageId") stageId: string,
    @Body() dto: UpdateStageDto,
    @Req() req: any,
  ) {
    return this.projectsService.updateStage(stageId, dto, req.user);
  }

  @Post(":projectId/deficiencies")
  @RequirePermission("deficiencies", "CREATE")
  async addDeficiency(
    @Param("projectId") projectId: string,
    @Body("description") description: string,
    @Body("severity") severity: "LOW" | "MEDIUM" | "HIGH",
    @Req() req: any,
  ) {
    return this.projectsService.addDeficiency(projectId, description, severity, req.user);
  }

  @Patch("deficiencies/:deficiencyId")
  @RequirePermission("deficiencies", "UPDATE")
  async updateDeficiency(
    @Param("deficiencyId") deficiencyId: string,
    @Body("status") status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
    @Req() req: any,
  ) {
    return this.projectsService.updateDeficiency(deficiencyId, status, req.user);
  }

  @Post(":projectId/stages")
  @RequirePermission("stages", "CREATE")
  async addStage(
    @Param("projectId") projectId: string,
    @Body() dto: CreateStageDto,
    @Req() req: any,
  ) {
    return this.projectsService.addStage(projectId, dto, req.user);
  }

  @Delete("stages/:stageId")
  @RequirePermission("stages", "DELETE")
  async deleteStage(@Param("stageId") stageId: string, @Req() req: any) {
    return this.projectsService.deleteStage(stageId, req.user);
  }

  @Delete("deficiencies/:deficiencyId")
  @RequirePermission("deficiencies", "DELETE")
  async deleteDeficiency(@Param("deficiencyId") deficiencyId: string, @Req() req: any) {
    return this.projectsService.deleteDeficiency(deficiencyId, req.user);
  }

  @Get(":projectId/systems")
  @RequirePermission("systems", "READ")
  async getSystems(@Param("projectId") projectId: string, @Req() req: any) {
    return this.projectsService.getSystems(projectId, req.user);
  }

  @Post(":projectId/systems")
  @RequirePermission("systems", "CREATE")
  async addSystem(
    @Param("projectId") projectId: string,
    @Body() dto: CreateSystemDto,
    @Req() req: any,
  ) {
    return this.projectsService.addSystem(projectId, dto, req.user);
  }

  @Patch("systems/:systemId")
  @RequirePermission("systems", "UPDATE")
  async updateSystem(
    @Param("systemId") systemId: string,
    @Body() dto: UpdateSystemDto,
    @Req() req: any,
  ) {
    return this.projectsService.updateSystem(systemId, dto, req.user);
  }

  @Delete("systems/:systemId")
  @RequirePermission("systems", "DELETE")
  async deleteSystem(@Param("systemId") systemId: string, @Req() req: any) {
    return this.projectsService.deleteSystem(systemId, req.user);
  }

  @Post("systems/:systemId/components")
  @RequirePermission("systems", "CREATE")
  async addComponent(
    @Param("systemId") systemId: string,
    @Body() dto: CreateComponentDto,
    @Req() req: any,
  ) {
    return this.projectsService.addComponent(systemId, dto, req.user);
  }

  @Patch("components/:componentId")
  @RequirePermission("systems", "UPDATE")
  async updateComponent(
    @Param("componentId") componentId: string,
    @Body() dto: UpdateComponentDto,
    @Req() req: any,
  ) {
    return this.projectsService.updateComponent(componentId, dto, req.user);
  }

  @Delete("components/:componentId")
  @RequirePermission("systems", "DELETE")
  async deleteComponent(@Param("componentId") componentId: string, @Req() req: any) {
    return this.projectsService.deleteComponent(componentId, req.user);
  }

  @Get(":projectId/supply-orders")
  @RequirePermission("supplyOrders", "READ")
  async getSupplyOrders(@Param("projectId") projectId: string, @Req() req: any) {
    return this.projectsService.getSupplyOrders(projectId, req.user);
  }

  @Post(":projectId/supply-orders")
  @RequirePermission("supplyOrders", "CREATE")
  async createSupplyOrder(
    @Param("projectId") projectId: string,
    @Body() dto: CreateSupplyOrderDto,
    @Req() req: any,
  ) {
    return this.projectsService.createSupplyOrder(projectId, dto, req.user);
  }

  @Patch(":projectId/supply-orders/:orderId")
  @RequirePermission("supplyOrders", "UPDATE")
  async updateSupplyOrder(
    @Param("projectId") projectId: string,
    @Param("orderId") orderId: string,
    @Body() dto: UpdateSupplyOrderDto,
    @Req() req: any,
  ) {
    return this.projectsService.updateSupplyOrder(projectId, orderId, dto, req.user);
  }

  @Get(":projectId/daily-reports")
  @RequirePermission("dailyReports", "READ")
  async getDailyReports(@Param("projectId") projectId: string, @Req() req: any) {
    return this.projectsService.getDailyReports(projectId, req.user);
  }

  @Post(":projectId/daily-reports")
  @RequirePermission("dailyReports", "CREATE")
  async createDailyReport(
    @Param("projectId") projectId: string,
    @Body() dto: CreateDailyReportDto,
    @Req() req: any,
  ) {
    return this.projectsService.createDailyReport(projectId, dto, req.user);
  }
}
