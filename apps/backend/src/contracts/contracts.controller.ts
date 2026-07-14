import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import { CreateContractDto, UpdateContractDto } from "../shared";
import { TemplateType } from "@prisma/client";

@Controller("api/contracts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Patch(":id")
  @RequirePermission("contracts", "UPDATE")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateContractDto,
    @Req() req: any,
  ) {
    return this.contractsService.update(id, dto, req.user);
  }

  @Get()
  @RequirePermission("contracts", "READ")
  async findAll() {
    return this.contractsService.findAll();
  }

  @Get(":id")
  @RequirePermission("contracts", "READ")
  async findOne(@Param("id") id: string) {
    return this.contractsService.findOne(id);
  }

  @Post()
  @RequirePermission("contracts", "CREATE")
  async create(@Body() dto: CreateContractDto, @Req() req: any) {
    return this.contractsService.create(dto, req.user);
  }

  @Delete(":id")
  @RequirePermission("contracts", "DELETE")
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.contractsService.delete(id, req.user);
  }

  @Get("templates/:type")
  @RequirePermission("settings", "READ")
  async getTemplate(@Param("type") type: TemplateType) {
    return this.contractsService.getTemplate(type);
  }

  @Patch("templates/:type")
  @RequirePermission("settings", "UPDATE")
  async updateTemplate(
    @Param("type") type: TemplateType,
    @Body("content") content: string,
    @Req() req: any,
  ) {
    return this.contractsService.updateTemplate(type, content, req.user);
  }
}
