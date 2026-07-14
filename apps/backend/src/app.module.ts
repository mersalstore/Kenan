import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AuditModule } from "./audit/audit.module";
import { ProjectsModule } from "./projects/projects.module";
import { QuotationsModule } from "./quotations/quotations.module";
import { ContractsModule } from "./contracts/contracts.module";
import { ReportsModule } from "./reports/reports.module";
import { MediaModule } from "./media/media.module";
import { UsersModule } from "./users/users.module";
import { InventoryModule } from "./inventory/inventory.module";
import { HrModule } from "./hr/hr.module";
import { MaintenanceModule } from "./maintenance/maintenance.module";
import { FinanceModule } from "./finance/finance.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AuditModule,
    ProjectsModule,
    QuotationsModule,
    ContractsModule,
    ReportsModule,
    MediaModule,
    UsersModule,
    InventoryModule,
    HrModule,
    MaintenanceModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
