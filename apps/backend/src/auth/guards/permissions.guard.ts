import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { REQUIRE_PERMISSION_KEY, PermissionRequirement } from "../decorators/permissions.decorator";
import { Action, UserRole } from "@prisma/client";

const CRUD: Action[] = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];

export function normalizeArabicText(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/\s*\([^)]*\)/g, "") // إزالة الأقواس وما بداخلها مثل (مهندس الموقع)
    .replace(/^(المهندس|مهندس|م\.|م\/|م)\s*/gi, "") // إزالة الألقاب المهنية
    .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة التشكيل
    .replace(/[أإآ]/g, "ا") // توحيد الألف
    .replace(/ة/g, "ه") // توحيد التاء المربوطة
    .replace(/ى/g, "ي") // توحيد الياء
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "") // تنظيف الرموز
    .trim()
    .toLowerCase();
}

export function isManagementUser(user: any): boolean {
  if (!user || !user.role) return false;
  const roleStr = String(user.role).trim().toUpperCase();
  return (
    roleStr === "ADMIN" ||
    roleStr === "PROJECT_MANAGER" ||
    roleStr === UserRole.ADMIN ||
    roleStr === UserRole.PROJECT_MANAGER ||
    user.role === "أدمن" ||
    user.role === "مدير عام" ||
    user.role === "مدير مشاريع" ||
    user.role === "مدير النظام" ||
    user.role === "admin" ||
    user.role === "project_manager"
  );
}

export function normalizeRole(role: string): string {
  const r = String(role || "").trim().toUpperCase();
  if (r === "ADMIN" || r === "أدمن" || r === "مدير عام" || r === "مدير النظام") return UserRole.ADMIN;
  if (r === "PROJECT_MANAGER" || r === "مدير مشاريع" || r === "مدير المشروع") return UserRole.PROJECT_MANAGER;
  if (r === "SITE_ENGINEER" || r === "مهندس موقع" || r === "مهندس الموقع" || r === "مهندس") return UserRole.SITE_ENGINEER;
  if (r === "PROCUREMENT" || r === "مشتريات" || r === "محاسب" || r === "محاسب الشركة" || r === "مسؤول المشتريات") return UserRole.PROCUREMENT;
  return role;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, Action[]>> = {
  [UserRole.ADMIN]: {
    projects: CRUD,
    stages: CRUD,
    systems: CRUD,
    deficiencies: CRUD,
    quotations: CRUD,
    contracts: CRUD,
    supplyOrders: CRUD,
    dailyReports: CRUD,
    reports: CRUD,
    media: CRUD,
    inventory: CRUD,
    workers: CRUD,
    teams: CRUD,
    attendance: CRUD,
    leaves: CRUD,
    payroll: CRUD,
    maintenance: CRUD,
    finance: CRUD,
    settings: CRUD,
    audit: CRUD,
  },
  [UserRole.PROJECT_MANAGER]: {
    projects: CRUD,
    stages: CRUD,
    systems: CRUD,
    deficiencies: CRUD,
    quotations: CRUD,
    contracts: CRUD,
    supplyOrders: CRUD,
    dailyReports: CRUD,
    reports: [Action.READ],
    media: CRUD,
    inventory: [Action.READ, Action.CREATE, Action.UPDATE],
    workers: CRUD,
    teams: CRUD,
    attendance: CRUD,
    leaves: CRUD,
    payroll: CRUD,
    maintenance: CRUD,
    finance: CRUD,
    settings: [Action.READ],
    audit: [Action.READ],
  },
  [UserRole.SITE_ENGINEER]: {
    projects: [Action.READ, Action.UPDATE],
    stages: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
    systems: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
    deficiencies: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
    dailyReports: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
    supplyOrders: [Action.READ, Action.CREATE, Action.UPDATE],
    media: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
    workers: [Action.READ, Action.CREATE, Action.UPDATE],
    teams: [Action.READ, Action.CREATE, Action.UPDATE],
    attendance: [Action.READ, Action.CREATE, Action.UPDATE],
    reports: [Action.READ],
    inventory: [Action.READ],
    quotations: [Action.READ],
    contracts: [Action.READ],
  },
  [UserRole.PROCUREMENT]: {
    quotations: [Action.READ, Action.CREATE, Action.UPDATE],
    contracts: [Action.READ, Action.CREATE, Action.UPDATE],
    supplyOrders: CRUD,
    projects: [Action.READ],
    reports: [Action.READ],
    inventory: CRUD,
    workers: [Action.READ],
    attendance: [Action.READ],
    leaves: [Action.READ],
    payroll: CRUD,
    finance: CRUD,
    maintenance: [Action.READ],
  },
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.get<PermissionRequirement>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    // If no permission is required, pass through
    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Attached by JwtAuthGuard
    if (!user) {
      return false;
    }

    // 1. ADMIN & Management Roles have global bypass
    if (isManagementUser(user)) {
      return true;
    }

    const normRole = normalizeRole(user.role);

    // 2. Check general RolePermission (DB first, with built-in default permissions fallback)
    const hasRolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        role: (normRole as any) || user.role,
        module: requirement.module,
        action: requirement.action,
      },
    });

    const isDefaultAllowed =
      (DEFAULT_ROLE_PERMISSIONS[normRole]?.[requirement.module] ||
        DEFAULT_ROLE_PERMISSIONS[user.role]?.[requirement.module])?.includes(
        requirement.action as Action,
      ) ?? false;

    if (!hasRolePermission && !isDefaultAllowed) {
      throw new ForbiddenException("ليس لديك الصلاحية للوصول إلى هذا القسم");
    }

    // 3. Enforce project-level boundary for Site Engineers (allow reporting & assigned/unassigned projects)
    if (normRole === UserRole.SITE_ENGINEER || normRole === "SITE_ENGINEER") {
      const projectId = await this.resolveProjectId(request, requirement.module);
      
      const strictlyRestrictedModules = ["projects", "stages", "systems", "supplyOrders"];
      if (projectId && strictlyRestrictedModules.includes(requirement.module)) {
        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            engineer: { select: { id: true, name: true, email: true } },
            assignments: { select: { workerId: true } },
          },
        });

        if (project) {
          const hasAccess = await this.verifyProjectAccess(project, user);
          if (!hasAccess) {
            throw new ForbiddenException("غير مصرح لك بالوصول إلى بيانات هذا الموقع/المشروع");
          }
        }
      }
    }

    return true;
  }

  private async resolveProjectId(request: any, module: string): Promise<string | undefined> {
    if (request.params?.projectId) return request.params.projectId;
    if (request.query?.projectId) return String(request.query.projectId);

    if (request.params?.id && module === "projects") {
      return request.params.id;
    }

    if (request.params?.stageId || (request.params?.id && module === "stages")) {
      const stageId = request.params.stageId || request.params.id;
      const stage = await this.prisma.projectStage.findUnique({
        where: { id: stageId },
        select: { projectId: true },
      }).catch(() => null);
      if (stage) return stage.projectId;
    }

    if (request.params?.systemId || (request.params?.id && module === "systems")) {
      const systemId = request.params.systemId || request.params.id;
      const system = await this.prisma.projectSystem.findUnique({
        where: { id: systemId },
        select: { projectId: true },
      }).catch(() => null);
      if (system) return system.projectId;
    }

    if (request.params?.componentId) {
      const comp = await this.prisma.systemComponent.findUnique({
        where: { id: request.params.componentId },
        select: { system: { select: { projectId: true } } },
      }).catch(() => null);
      if (comp?.system?.projectId) return comp.system.projectId;
    }

    if (request.params?.deficiencyId || (request.params?.id && module === "deficiencies")) {
      const defId = request.params.deficiencyId || request.params.id;
      const def = await this.prisma.siteDeficiency.findUnique({
        where: { id: defId },
        select: { projectId: true },
      }).catch(() => null);
      if (def) return def.projectId;
    }

    return undefined;
  }

  private async verifyProjectAccess(project: any, user: any): Promise<boolean> {
    // إذا كان المشروع غير مسند بعد لمهندس محدد، يُسمح لمهندسي الموقع بالوصول إليه
    if (!project.engineerId && !project.engineer) {
      return true;
    }

    const userId = user.sub || user.id;

    // 1. فحص تطابق معرف المهندس المباشر
    if (project.engineerId && (project.engineerId === userId || project.engineer?.id === userId)) {
      return true;
    }

    // 2. فحص تطابق البريد الإلكتروني للمهندس
    const userEmail = String(user.email || "").trim().toLowerCase();
    const engEmail = String(project.engineer?.email || "").trim().toLowerCase();
    if (userEmail && engEmail && userEmail === engEmail) {
      return true;
    }

    // 3. فحص جدول صلاحيات المشاريع المخصصة (UserProjectPermission)
    if (userId) {
      const hasPermission = await this.prisma.userProjectPermission.findFirst({
        where: {
          userId: userId,
          projectId: project.id,
        },
      });
      if (hasPermission) {
        return true;
      }
    }

    // 4. فحص جدول التكليفات assignments
    if (project.assignments && Array.isArray(project.assignments)) {
      const isAssigned = project.assignments.some((a: any) => a.workerId === userId);
      if (isAssigned) {
        return true;
      }
    }

    // 5. فحص مطابقة الأسماء المرنة (Fuzzy Arabic Name Matching)
    const cleanUserName = normalizeArabicText(user.name);
    const cleanEngName = normalizeArabicText(project.engineer?.name);

    if (!cleanEngName || !cleanUserName) {
      return true;
    }

    if (
      cleanUserName === cleanEngName ||
      cleanEngName.includes(cleanUserName) ||
      cleanUserName.includes(cleanEngName)
    ) {
      return true;
    }

    // فحص الكلمات المشتركة (مثال: "كريم" و "عادل")
    const userTokens = cleanUserName.split(/\s+/).filter((t) => t.length >= 2);
    const engTokens = cleanEngName.split(/\s+/).filter((t) => t.length >= 2);
    const commonTokens = userTokens.filter((t) => engTokens.includes(t));
    if (commonTokens.length >= 1) {
      return true;
    }

    return false;
  }
}
