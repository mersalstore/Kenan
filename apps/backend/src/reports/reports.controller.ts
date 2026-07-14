import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import type { Response } from "express";

@Controller("api/reports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("project/:projectId")
  @RequirePermission("reports", "READ")
  async getProjectReport(@Param("projectId") projectId: string) {
    return this.reportsService.getProjectReport(projectId);
  }

  @Get("financial")
  @RequirePermission("reports", "READ")
  async getFinancialReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.reportsService.getFinancialReport(startDate, endDate);
  }

  // Export Project PDF
  @Post("project/:projectId/pdf")
  async exportProjectPdf(
    @Param("projectId") projectId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateProjectPdf(projectId, body);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=project-report-${projectId}.pdf`,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }

  // Export Project Excel
  @Get("project/:projectId/excel")
  async exportProjectExcel(
    @Param("projectId") projectId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateProjectExcel(projectId);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=project-report-${projectId}.xlsx`,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }
}
