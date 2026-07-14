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
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { InventoryService } from "./inventory.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import { CreateInventoryItemDto, UpdateInventoryItemDto, IssueInventoryDto, ImportInventoryDto } from "../shared";

@Controller("api/inventory")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermission("inventory", "READ")
  async findAll() {
    return this.inventoryService.findAll();
  }

  @Get("export/excel")
  @RequirePermission("inventory", "READ")
  async exportExcel(@Res() res: Response) {
    const buffer = await this.inventoryService.exportExcel();
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=inventory.xlsx`,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }

  @Post()
  @RequirePermission("inventory", "CREATE")
  async create(@Body() dto: CreateInventoryItemDto, @Req() req: any) {
    return this.inventoryService.create(dto, req.user);
  }

  @Post("import")
  @RequirePermission("inventory", "CREATE")
  async bulkImport(@Body() dto: ImportInventoryDto, @Req() req: any) {
    return this.inventoryService.bulkImport(dto, req.user);
  }

  @Post(":id/issue")
  @RequirePermission("inventory", "UPDATE")
  async issue(@Param("id") id: string, @Body() dto: IssueInventoryDto, @Req() req: any) {
    return this.inventoryService.issue(id, dto, req.user);
  }

  @Patch(":id")
  @RequirePermission("inventory", "UPDATE")
  async update(@Param("id") id: string, @Body() dto: UpdateInventoryItemDto, @Req() req: any) {
    return this.inventoryService.update(id, dto, req.user);
  }

  @Delete(":id")
  @RequirePermission("inventory", "DELETE")
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.inventoryService.delete(id, req.user);
  }
}
