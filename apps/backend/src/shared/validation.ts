import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class LoginDto {
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح" })
  @IsNotEmpty({ message: "البريد الإلكتروني مطلوب" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "كلمة المرور مطلوبة" })
  password!: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: "توكين جوجل مطلوب" })
  credential!: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: "اسم المشروع مطلوب" })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: "نوع المشروع مطلوب" })
  type!: string;

  @IsString()
  @IsNotEmpty({ message: "العميل مطلوب" })
  clientId!: string;

  @IsString()
  @IsNotEmpty({ message: "عنوان الموقع مطلوب" })
  address!: string;

  @IsDateString({}, { message: "تاريخ البدء غير صالح" })
  startDate!: string;

  @IsDateString({}, { message: "تاريخ الانتهاء غير صالح" })
  endDate!: string;

  @IsNumber({}, { message: "الميزانية يجب أن تكون رقماً" })
  @Min(0, { message: "الميزانية لا يمكن أن تكون أقل من صفر" })
  budget!: number;

  @IsString()
  @IsOptional()
  engineerId?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  engineerId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}

export class UpdateStageDto {
  @IsString()
  @IsNotEmpty({ message: "حالة المرحلة مطلوبة" })
  status!: "TODO" | "DOING" | "DONE";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateStageDto {
  @IsString()
  @IsNotEmpty({ message: "اسم المرحلة مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  status?: "TODO" | "DOING" | "DONE";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty({ message: "نوع النظام مطلوب" })
  type!: "VENTILATION" | "FIRE_FIGHTING" | "FIRE_ALARM";

  @IsString()
  @IsNotEmpty({ message: "اسم النظام مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  status?: "DESIGN" | "INSTALLING" | "INSTALLED" | "TESTING" | "CERTIFIED";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSystemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  status?: "DESIGN" | "INSTALLING" | "INSTALLED" | "TESTING" | "CERTIFIED";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty({ message: "نوع المكوّن مطلوب" })
  componentType!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateComponentDto {
  @IsString()
  @IsOptional()
  installStatus?: "PENDING" | "INSTALLED" | "TESTED";

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: "اسم الموظف مطلوب" })
  name!: string;

  @IsEmail({}, { message: "البريد الإلكتروني غير صالح" })
  @IsNotEmpty({ message: "البريد الإلكتروني مطلوب" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "كلمة المرور مطلوبة" })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "الدور مطلوب" })
  role!: "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "PROCUREMENT" | "WORKER" | "TECHNICIAN";
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "PROCUREMENT" | "WORKER" | "TECHNICIAN";

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  isActive?: boolean;
}

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty({ message: "اسم الصنف مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsDateString()
  @IsOptional()
  receivedAt?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minQuantity?: number;
}

export class UpdateInventoryItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minQuantity?: number;
}

export class IssueInventoryDto {
  @IsString()
  @IsNotEmpty({ message: "المشروع مطلوب" })
  projectId!: string;

  @IsNumber()
  @Min(0.01, { message: "الكمية يجب أن تكون أكبر من صفر" })
  quantity!: number;
}

export class ImportInventoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryItemDto)
  items!: CreateInventoryItemDto[];
}

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty({ message: "اسم العامل مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRate?: number;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  employmentType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlySalary?: number;
}

export class UpdateWorkerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRate?: number;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  employmentType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlySalary?: number;
}

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty({ message: "اسم الفريق مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  subcontractorId?: string;

  @IsString()
  @IsOptional()
  teamLead?: string;

  @IsString()
  @IsOptional()
  trade?: string;
}

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty({ message: "المشروع مطلوب" })
  projectId!: string;

  @IsString()
  @IsOptional()
  workerId?: string;

  @IsString()
  @IsOptional()
  contractorId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  roleOnSite?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpsertAttendanceDto {
  @IsString()
  @IsNotEmpty({ message: "العامل مطلوب" })
  workerId!: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty({ message: "حالة الحضور مطلوبة" })
  status!: "PRESENT" | "ABSENT" | "LEAVE";

  @IsString()
  @IsOptional()
  checkIn?: string;

  @IsString()
  @IsOptional()
  checkOut?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overtimeHours?: number;
}

export class CreateLeaveDto {
  @IsString()
  @IsNotEmpty({ message: "العامل مطلوب" })
  workerId!: string;

  @IsString()
  @IsNotEmpty({ message: "نوع الإجازة مطلوب" })
  type!: "ANNUAL" | "SICK" | "UNPAID";

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SupplyOrderItemDto {
  @IsString()
  @IsNotEmpty({ message: "اسم الصنف مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0.01, { message: "الكمية يجب أن تكون أكبر من صفر" })
  orderedQty!: number;

  @IsString()
  @IsOptional()
  unit?: string;
}

export class CreateSupplyOrderDto {
  @IsString()
  @IsOptional()
  quotationId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplyOrderItemDto)
  items!: SupplyOrderItemDto[];
}

export class ReceiveSupplyOrderItemDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  receivedQty?: number;

  @IsBoolean()
  @IsOptional()
  confirmed?: boolean;
}

export class UpdateSupplyOrderDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveSupplyOrderItemDto)
  @IsOptional()
  items?: ReceiveSupplyOrderItemDto[];
}

export class DailyReportSystemEntryDto {
  @IsString()
  @IsNotEmpty({ message: "نوع النظام مطلوب" })
  systemType!: "FIRE_ALARM" | "FIRE_FIGHTING" | "VENTILATION";

  @IsBoolean()
  @IsOptional()
  foundationDone?: boolean;

  @IsBoolean()
  @IsOptional()
  wiringDone?: boolean;

  @IsBoolean()
  @IsOptional()
  installDone?: boolean;
}

export class CreateDailyReportDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  workersCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyReportSystemEntryDto)
  @IsOptional()
  systemEntries?: DailyReportSystemEntryDto[];

  @IsString()
  @IsOptional()
  problems?: string;

  @IsString()
  @IsOptional()
  solutions?: string;

  @IsBoolean()
  @IsOptional()
  needsQuoteRequest?: boolean;

  @IsBoolean()
  @IsOptional()
  needsConsultantReview?: boolean;

  @IsString()
  @IsOptional()
  engineerNotes?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercent?: number;

  @IsString()
  @IsOptional()
  signature?: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: "اسم العميل مطلوب" })
  name!: string;

  // الهاتف والعنوان اختياريان: شاشة إضافة العميل تطلب الاسم فقط، وكان
  // اشتراطهما هنا يرفض كل عميل يُضاف بدونهما برسالة "رقم الهاتف مطلوب".
  // الأعمدة في قاعدة البيانات غير قابلة للإفراغ، لذلك تُخزَّن نصاً فارغاً.
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsEmail({}, { message: "البريد الإلكتروني غير صالح" })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  commercialRegister?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  digitalWallet?: string;

  @IsString()
  @IsOptional()
  documentationAuthority?: string;
}

export class CreateQuotationItemDto {
  @IsString()
  @IsNotEmpty({ message: "اسم البند مطلوب" })
  name!: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0.01, { message: "الكمية يجب أن تكون أكبر من صفر" })
  qty!: number;

  @IsNumber()
  @Min(0, { message: "السعر يجب أن يكون صفراً أو أكثر" })
  price!: number;
}

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty({ message: "العميل مطلوب" })
  clientId!: string;

  @IsDateString()
  date!: string;

  @IsDateString()
  validUntil!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent!: number;

  @IsString()
  currency!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items!: CreateQuotationItemDto[];
}

export class PaymentTermDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percent!: number;
}

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsString()
  currency!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  warranty!: string;

  @IsString()
  clauses!: string;

  @IsString()
  @IsOptional()
  secondPartyName?: string;

  @IsString()
  @IsOptional()
  secondPartyRegister?: string;

  @IsString()
  @IsOptional()
  secondPartyRepresentative?: string;

  @IsString()
  @IsOptional()
  secondPartyRole?: string;

  @IsString()
  @IsOptional()
  locationCity?: string;

  @IsString()
  @IsOptional()
  locationDistrict?: string;

  @IsString()
  @IsOptional()
  locationPlot?: string;

  @IsString()
  @IsOptional()
  locationPlan?: string;

  @IsString()
  @IsOptional()
  quotationNumber?: string;

  @IsNumber()
  @IsOptional()
  quotationValue?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specs?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentTermDto)
  @IsOptional()
  payments?: PaymentTermDto[];
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsEmail({}, { message: "البريد الإلكتروني غير صالح" })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  commercialRegister?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  digitalWallet?: string;

  @IsString()
  @IsOptional()
  documentationAuthority?: string;
}

export class UpdateQuotationDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  taxPercent?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  @IsOptional()
  items?: CreateQuotationItemDto[];
}

export class UpdateContractDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsString()
  @IsOptional()
  clauses?: string;

  @IsString()
  @IsOptional()
  secondPartyName?: string;

  @IsString()
  @IsOptional()
  secondPartyRegister?: string;

  @IsString()
  @IsOptional()
  secondPartyRepresentative?: string;

  @IsString()
  @IsOptional()
  secondPartyRole?: string;

  @IsString()
  @IsOptional()
  locationCity?: string;

  @IsString()
  @IsOptional()
  locationDistrict?: string;

  @IsString()
  @IsOptional()
  locationPlot?: string;

  @IsString()
  @IsOptional()
  locationPlan?: string;

  @IsString()
  @IsOptional()
  quotationNumber?: string;

  @IsNumber()
  @IsOptional()
  quotationValue?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specs?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentTermDto)
  @IsOptional()
  payments?: PaymentTermDto[];
}

// DTOs for Payroll
export class CreatePayrollRunDto {
  @IsString()
  @IsNotEmpty({ message: "معرف العامل مطلوب" })
  workerId!: string;

  @IsString()
  @IsNotEmpty({ message: "فترة الراتب مطلوبة" })
  period!: string;

  @IsInt()
  @Min(0)
  presentDays!: number;

  @IsNumber()
  @Min(0)
  baseAmount!: number;

  @IsNumber()
  @Min(0)
  overtimeAmount!: number;

  @IsNumber()
  @Min(0)
  deductions!: number;

  @IsNumber()
  @Min(0)
  netAmount!: number;

  @IsString()
  @IsOptional()
  status?: "DRAFT" | "APPROVED" | "PAID";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePayrollRunDto {
  @IsString()
  @IsOptional()
  workerId?: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  presentDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overtimeAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  netAmount?: number;

  @IsString()
  @IsOptional()
  status?: "DRAFT" | "APPROVED" | "PAID";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePayrollStatusDto {
  @IsString()
  @IsNotEmpty({ message: "الحالة مطلوبة" })
  status!: "DRAFT" | "APPROVED" | "PAID";
}

// DTOs for Maintenance
export class CreateMaintenanceContractDto {
  @IsString()
  @IsNotEmpty({ message: "رقم العقد مطلوب" })
  contractNumber!: string;

  @IsString()
  @IsNotEmpty({ message: "العميل مطلوب" })
  clientId!: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsOptional()
  frequency?: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";

  @IsString()
  @IsOptional()
  status?: "ACTIVE" | "EXPIRED" | "RENEWED" | "CANCELLED";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMaintenanceContractDto {
  @IsString()
  @IsOptional()
  contractNumber?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  frequency?: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";

  @IsString()
  @IsOptional()
  status?: "ACTIVE" | "EXPIRED" | "RENEWED" | "CANCELLED";

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateMaintenanceVisitDto {
  @IsString()
  @IsNotEmpty({ message: "العقد مطلوب" })
  contractId!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @IsString()
  @IsOptional()
  status?: "SCHEDULED" | "DONE" | "MISSED";

  @IsString()
  @IsOptional()
  performedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMaintenanceVisitDto {
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @IsString()
  @IsOptional()
  status?: "SCHEDULED" | "DONE" | "MISSED";

  @IsString()
  @IsOptional()
  performedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CompleteMaintenanceVisitDto {
  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @IsString()
  @IsOptional()
  performedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

// DTOs for Finance
export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty({ message: "المشروع مطلوب" })
  projectId!: string;

  @IsString()
  @IsNotEmpty({ message: "رقم الفاتورة مطلوب" })
  number!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsOptional()
  status?: "PAID" | "PARTIAL" | "LATE";

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
}

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  status?: "PAID" | "PARTIAL" | "LATE";

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
}

export class CreateExpenseDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsNotEmpty({ message: "نوع المصروف مطلوب" })
  type!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty({ message: "وصف المصروف مطلوب" })
  description!: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

