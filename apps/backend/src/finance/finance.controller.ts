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
import { FinanceService } from "./finance.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "../shared";

@Controller("api/finance")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ===== الفواتير (Invoices) =====
  @Get("invoices")
  @RequirePermission("finance", "READ")
  async findInvoices() {
    return this.financeService.findInvoices();
  }

  @Post("invoices")
  @RequirePermission("finance", "CREATE")
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.financeService.createInvoice(dto, req.user);
  }

  @Patch("invoices/:id")
  @RequirePermission("finance", "UPDATE")
  async updateInvoice(
    @Param("id") id: string,
    @Body() dto: UpdateInvoiceDto,
    @Req() req: any,
  ) {
    return this.financeService.updateInvoice(id, dto, req.user);
  }

  @Delete("invoices/:id")
  @RequirePermission("finance", "DELETE")
  async deleteInvoice(@Param("id") id: string, @Req() req: any) {
    return this.financeService.deleteInvoice(id, req.user);
  }

  // ===== المصاريف (Expenses) =====
  @Get("expenses")
  @RequirePermission("finance", "READ")
  async findExpenses() {
    return this.financeService.findExpenses();
  }

  @Post("expenses")
  @RequirePermission("finance", "CREATE")
  async createExpense(@Body() dto: CreateExpenseDto, @Req() req: any) {
    return this.financeService.createExpense(dto, req.user);
  }

  @Patch("expenses/:id")
  @RequirePermission("finance", "UPDATE")
  async updateExpense(
    @Param("id") id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: any,
  ) {
    return this.financeService.updateExpense(id, dto, req.user);
  }

  @Delete("expenses/:id")
  @RequirePermission("finance", "DELETE")
  async deleteExpense(@Param("id") id: string, @Req() req: any) {
    return this.financeService.deleteExpense(id, req.user);
  }
}
