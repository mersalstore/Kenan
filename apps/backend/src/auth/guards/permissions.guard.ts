import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { REQUIRE_PERMISSION_KEY, PermissionRequirement } from "../decorators/permissions.decorator";

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
    if (user.role === "ADMIN") {
      return true;
    }

    // 2. Check general RolePermission
    const hasRolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        role: user.role,
        module: requirement.module,
        action: requirement.action,
      },
    });

    if (!hasRolePermission) {
      throw new ForbiddenException("ليس لديك الصلاحية للوصول إلى هذا القسم");
    }

    // 3. Enforce project-level boundary for Site Engineers
    if (user.role === "SITE_ENGINEER") {
      const projectId = request.params.projectId || request.params.id || request.query.projectId;
      
      const projectScopedModules = ["projects", "stages", "systems", "deficiencies", "media", "dailyReports", "supplyOrders"];
      if (projectId && projectScopedModules.includes(requirement.module)) {
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

    return true;
  }
}
