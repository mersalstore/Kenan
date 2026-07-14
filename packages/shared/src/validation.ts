import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
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

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: "اسم العميل مطلوب" })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: "رقم الهاتف مطلوب" })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: "العنوان مطلوب" })
  address!: string;

  @IsString()
  @IsNotEmpty({ message: "نوع العميل مطلوب" })
  type!: string;

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
