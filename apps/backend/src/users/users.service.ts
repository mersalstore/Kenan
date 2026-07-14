import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateUserDto, UpdateUserDto } from "../shared";
import * as bcrypt from "bcrypt";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  async create(dto: CreateUserDto, user: any) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException("يوجد مستخدم مسجل بهذا البريد الإلكتروني بالفعل");
    }

    const created = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: dto.role as any,
        isActive: true,
      },
      select: SAFE_USER_SELECT,
    });

    await this.auditService.log(user.sub, "CREATE", "User", created.id, null, created);
    return created;
  }

  async update(id: string, dto: UpdateUserDto, user: any) {
    const oldUser = await this.prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        role: (dto.role as any) ?? undefined,
        isActive: dto.isActive ?? undefined,
        passwordHash: dto.password ? await bcrypt.hash(dto.password, 10) : undefined,
      },
      select: SAFE_USER_SELECT,
    });

    await this.auditService.log(user.sub, "UPDATE", "User", id, { ...oldUser, passwordHash: "***" }, updated);
    return updated;
  }

  async deactivate(id: string, user: any) {
    const oldUser = await this.prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
      throw new NotFoundException("المستخدم غير موجود");
    }
    if (oldUser.id === user.sub) {
      throw new BadRequestException("لا يمكنك تعطيل حسابك الحالي");
    }

    // تعطيل بدل الحذف النهائي للحفاظ على سجلات النشاط والمراجع
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: SAFE_USER_SELECT,
    });

    await this.auditService.log(user.sub, "DELETE", "User", id, { ...oldUser, passwordHash: "***" }, updated);
    return { ok: true };
  }
}
