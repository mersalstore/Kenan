import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { QuotationsService } from "./quotations.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import { CreateQuotationDto, UpdateQuotationDto } from "../shared";
import { QuotationStatus } from "@prisma/client";
import type { Response } from "express";

@Controller("api/quotations")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Patch(":id")
  @RequirePermission("quotations", "UPDATE")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateQuotationDto,
    @Req() req: any,
  ) {
    return this.quotationsService.update(id, dto, req.user);
  }

  @Get()
  @RequirePermission("quotations", "READ")
  async findAll() {
    return this.quotationsService.findAll();
  }

  @Get(":id")
  @RequirePermission("quotations", "READ")
  async findOne(@Param("id") id: string) {
    return this.quotationsService.findOne(id);
  }

  @Post()
  @RequirePermission("quotations", "CREATE")
  async create(@Body() dto: CreateQuotationDto, @Req() req: any) {
    return this.quotationsService.create(dto, req.user);
  }

  @Patch(":id/status")
  @RequirePermission("quotations", "UPDATE")
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: QuotationStatus,
    @Req() req: any,
  ) {
    return this.quotationsService.updateStatus(id, status, req.user);
  }

  @Delete(":id")
  @RequirePermission("quotations", "DELETE")
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.quotationsService.delete(id, req.user);
  }

  // PDF Export (Supports both GET and POST)
  @Get(":id/pdf")
  async exportPdfGet(@Param("id") id: string, @Query() query: any, @Res() res: Response) {
    const buffer = await this.quotationsService.generatePdf(id, query);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=quotation-${id}.pdf`,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }

  @Post(":id/pdf")
  async exportPdfPost(@Param("id") id: string, @Body() body: any, @Res() res: Response) {
    const buffer = await this.quotationsService.generatePdf(id, body);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=quotation-${id}.pdf`,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }

  // Excel Export
  @Get(":id/excel")
  async exportExcel(@Param("id") id: string, @Res() res: Response) {
    const buffer = await this.quotationsService.generateExcel(id);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=quotation-${id}.xlsx`,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }
}
