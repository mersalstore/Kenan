import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { REQUIRE_PERMISSION_KEY, PermissionRequirement } from "../decorators/permissions.decorator";
import { Action, UserRole } from "@prisma/client";

const CRUD: Action[] = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];

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
    projects: [Action.READ],
    stages: [Action.READ, Action.UPDATE],
    systems: [Action.READ, Action.CREATE, Action.UPDATE],
    deficiencies: [Action.READ, Action.CREATE, Action.UPDATE],
    dailyReports: [Action.READ, Action.CREATE, Action.UPDATE],
    supplyOrders: [Action.READ, Action.UPDATE],
    media: [Action.READ, Action.CREATE],
    workers: [Action.READ, Action.CREATE, Action.UPDATE],
    teams: [Action.READ, Action.CREATE, Action.UPDATE],
    attendance: [Action.READ, Action.CREATE, Action.UPDATE],
    reports: [Action.READ],
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

    // 1. ADMIN has global permission bypass
    if (user.role === UserRole.ADMIN || user.role === "ADMIN") {
      return true;
    }

    // 2. Check general RolePermission (DB first, with built-in default permissions fallback)
    const hasRolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        role: user.role,
        module: requirement.module,
        action: requirement.action,
      },
    });

    const isDefaultAllowed =
      DEFAULT_ROLE_PERMISSIONS[user.role]?.[requirement.module]?.includes(
        requirement.action as Action,
      ) ?? false;

    if (!hasRolePermission && !isDefaultAllowed) {
      throw new ForbiddenException("ليس لديك الصلاحية للوصول إلى هذا القسم");
    }

    // 3. Enforce project-level boundary for Site Engineers (allow reporting & unassigned projects)
    if (user.role === UserRole.SITE_ENGINEER || user.role === "SITE_ENGINEER") {
      const projectId = request.params.projectId || request.params.id || request.query.projectId;
      
      // تقارير التشغيل اليومية والملاحظات الميدانية لا تُحجب عن مهندسي الموقع
      const strictlyRestrictedModules = ["projects", "stages", "systems", "supplyOrders"];
      if (projectId && strictlyRestrictedModules.includes(requirement.module)) {
        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: { engineer: { select: { id: true, name: true, email: true } } },
        });

        if (project) {
          // إذا كان المشروع غير مسند بعد لمهندس محدد، يُسمح للمهندس بالوصول إليه
          if (!project.engineerId && !project.engineer) {
            return true;
          }

          const isDirectEngineer = project.engineerId === user.sub;
          const cleanUserName = user.name
            ? user.name.replace(/\s*\([^)]*\)/g, "").replace(/^(المهندس|مهندس|م\.|م\/|م)\s*/gi, "").trim().toLowerCase()
            : "";
          const cleanEngName = project.engineer?.name
            ? project.engineer.name.replace(/\s*\([^)]*\)/g, "").replace(/^(المهندس|مهندس|م\.|م\/|م)\s*/gi, "").trim().toLowerCase()
            : "";

          const isNameMatch =
            !cleanEngName ||
            !cleanUserName ||
            cleanUserName === cleanEngName ||
            cleanEngName.includes(cleanUserName) ||
            cleanUserName.includes(cleanEngName);

          if (!isDirectEngineer && !isNameMatch) {
            const hasProjectAccess = await this.prisma.userProjectPermission.findFirst({
              where: {
                userId: user.sub,
                projectId: projectId,
              },
            });

            if (!hasProjectAccess) {
              throw new ForbiddenException("غير مصرح لك بالوصول إلى بيانات هذا الموقع/المشروع");
            }
          }
        }
      }
    }

    return true;
  }
}
