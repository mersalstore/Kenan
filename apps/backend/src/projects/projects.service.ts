import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateProjectDto, UpdateProjectDto, UpdateStageDto, CreateStageDto, CreateClientDto, UpdateClientDto, CreateDailyReportDto, CreateSystemDto, UpdateSystemDto, CreateComponentDto, UpdateComponentDto, CreateSupplyOrderDto, UpdateSupplyOrderDto } from "../shared";
import { ProjectStatus, StageStatus, UserRole } from "@prisma/client";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findClients() {
    return this.prisma.client.findMany();
  }

  // 1. Find all projects (Filtered by role)
  async findAll(user: any) {
    const fullInclude = {
      client: true,
      engineer: { select: { id: true, name: true, email: true } },
      stages: { orderBy: { updatedAt: "desc" as const } },
      deficiencies: { include: { raisedBy: { select: { id: true, name: true } } } },
      systems: { include: { components: true } },
    };

    const roleUpper = String(user?.role || "").toUpperCase();
    const isPMOrAdmin =
      roleUpper === "ADMIN" ||
      roleUpper === "PROJECT_MANAGER" ||
      user?.role === "أدمن" ||
      user?.role === "مدير عام" ||
      user?.role === "مدير مشاريع" ||
      user?.role === "مدير النظام" ||
      user?.role === "admin" ||
      user?.role === "project_manager";

    // الإدارة ومديرو المشاريع يرون كافة المشاريع المسجلة بلا استثناء
    if (isPMOrAdmin) {
      return this.prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: fullInclude,
      });
    }

    const cleanName = user?.name
      ? user.name.replace(/\s*\([^)]*\)/g, "").replace(/^(المهندس|مهندس|م\.|م\/|م)\s*/gi, "").trim()
      : "";

    // مهندس الموقع: يرى المشاريع المسندة له فقط
    return this.prisma.project.findMany({
      where: {
        OR: [
          { engineerId: user.sub },
          { projectPermissions: { some: { userId: user.sub } } },
          ...(cleanName ? [{ engineer: { name: { contains: cleanName } } }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: fullInclude,
    });
  }

  // 2. Find one project details
  async findOne(id: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        engineer: { select: { id: true, name: true, email: true } },
        stages: { orderBy: { updatedAt: "desc" } },
        assignments: {
          include: {
            worker: true,
            contractor: true,
          },
        },
        deficiencies: true,
        systems: {
          include: {
            components: true,
          },
        },
        materials: true,
      },
    });

    if (!project) {
      throw new NotFoundException("المشروع غير موجود");
    }

    // فحص الصلاحية للمهندس (الإدارة ومدير المشاريع يتجاوزون الفحص دائماً)
    const roleUpper = String(user?.role || "").toUpperCase();
    const isPMOrAdmin =
      roleUpper === "ADMIN" ||
      roleUpper === "PROJECT_MANAGER" ||
      user?.role === "أدمن" ||
      user?.role === "مدير عام" ||
      user?.role === "مدير مشاريع" ||
      user?.role === "مدير النظام" ||
      user?.role === "admin" ||
      user?.role === "project_manager";

    if (!isPMOrAdmin) {
      const cleanUserName = user?.name
        ? user.name.replace(/\s*\([^)]*\)/g, "").replace(/^(المهندس|مهندس|م\.|م\/|م)\s*/gi, "").trim().toLowerCase()
        : "";
      const cleanEngName = project.engineer?.name
        ? project.engineer.name.replace(/\s*\([^)]*\)/g, "").replace(/^(المهندس|مهندس|م\.|م\/|م)\s*/gi, "").trim().toLowerCase()
        : "";

      const isDirectEngineer = project.engineerId === user.sub;
      const isNameMatch = cleanUserName && cleanEngName && (
        cleanUserName === cleanEngName ||
        cleanEngName.includes(cleanUserName) ||
        cleanUserName.includes(cleanEngName)
      );

      if (!isDirectEngineer && !isNameMatch) {
        const hasPermission = await this.prisma.userProjectPermission.findFirst({
          where: { userId: user.sub, projectId: id },
        });
        if (!hasPermission) {
          throw new ForbiddenException("غير مصرح لك بالوصول إلى هذا المشروع");
        }
      }
    }

    return project;
  }

  // 3. Create Project
  async create(dto: CreateProjectDto, user: any) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        type: dto.type,
        clientId: dto.clientId,
        address: dto.address,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        budget: dto.budget,
        engineerId: dto.engineerId || null,
        status: ProjectStatus.PLANNED,
      },
    });

    // Create default project stages
    const defaultStages = ["المعاينة", "التأسيس", "التركيب", "الاختبار", "التسليم"];
    for (const name of defaultStages) {
      await this.prisma.projectStage.create({
        data: {
          projectId: project.id,
          name,
          status: StageStatus.TODO,
          color: "#e11d48",
        },
      });
    }

    // Auto assign engineer permission if set
    if (dto.engineerId) {
      await this.prisma.userProjectPermission.create({
        data: {
          userId: dto.engineerId,
          projectId: project.id,
        },
      });
    }

    await this.auditService.log(user.sub, "CREATE", "Project", project.id, null, project);
    return project;
  }

  // 4. Update Project (Restricted fields for Site Engineer)
  async update(id: string, dto: UpdateProjectDto, user: any) {
    const oldProject = await this.findOne(id, user);

    let updateData: any = {};

    const roleUpper = user.role?.toUpperCase() || "";
    const isPMOrAdmin = roleUpper === "ADMIN" || roleUpper === "PROJECT_MANAGER" || user.role === "أدمن" || user.role === "مدير عام" || user.role === "مدير مشاريع";

    if (isPMOrAdmin) {
      if (dto.name) updateData.name = dto.name;
      if (dto.type) updateData.type = dto.type;
      if (dto.clientId) {
        const validClient = await this.prisma.client.findUnique({ where: { id: dto.clientId } }).catch(() => null);
        if (validClient) updateData.clientId = validClient.id;
      }
      if (dto.address) updateData.address = dto.address;
      if (dto.startDate && !isNaN(Date.parse(String(dto.startDate)))) {
        updateData.startDate = new Date(dto.startDate);
      }
      if (dto.endDate && !isNaN(Date.parse(String(dto.endDate)))) {
        updateData.endDate = new Date(dto.endDate);
      }
      if (dto.budget !== undefined) updateData.budget = Number(dto.budget) || 0;
      if (dto.engineerId !== undefined) {
        const validUser = dto.engineerId
          ? await this.prisma.user.findUnique({ where: { id: dto.engineerId } }).catch(() => null)
          : null;
        updateData.engineerId = validUser ? validUser.id : null;
        if (validUser && validUser.id !== oldProject.engineerId) {
          await this.prisma.userProjectPermission
            .upsert({
              where: { userId_projectId: { userId: validUser.id, projectId: id } },
              create: { userId: validUser.id, projectId: id },
              update: {},
            })
            .catch(() => {});
        }
      }
    }

    if (dto.status) {
      const statusMap: Record<string, ProjectStatus> = {
        "لم يبدأ": ProjectStatus.PLANNED,
        "جاري": ProjectStatus.IN_PROGRESS,
        "متوقف": ProjectStatus.ON_HOLD,
        "متأخر": ProjectStatus.DELAYED,
        "مكتمل": ProjectStatus.COMPLETED,
        "PLANNED": ProjectStatus.PLANNED,
        "IN_PROGRESS": ProjectStatus.IN_PROGRESS,
        "ON_HOLD": ProjectStatus.ON_HOLD,
        "SUSPENDED": ProjectStatus.ON_HOLD,
        "DELAYED": ProjectStatus.DELAYED,
        "COMPLETED": ProjectStatus.COMPLETED,
      };
      updateData.status = statusMap[dto.status] || ProjectStatus.IN_PROGRESS;
    }
    if (dto.progress !== undefined) updateData.progress = Number(dto.progress) || 0;

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    if (user?.sub) {
      await this.auditService.log(user.sub, "UPDATE", "Project", id, oldProject, updatedProject).catch(() => {});
    }
    return updatedProject;
  }

  // 5. Delete Project (Admin only)
  async delete(id: string, user: any) {
    const oldProject = await this.findOne(id, user);
    await this.prisma.project.delete({ where: { id } });
    await this.auditService.log(user.sub, "DELETE", "Project", id, oldProject, null);
    return { ok: true };
  }

  // 6. Update Project Stage Status & Logs History
  async updateStage(stageId: string, dto: UpdateStageDto, user: any) {
    const oldStage = await this.prisma.projectStage.findUnique({
      where: { id: stageId },
    });

    if (!oldStage) {
      throw new NotFoundException("المرحلة غير موجودة");
    }

    // Check project assignment permission
    await this.findOne(oldStage.projectId, user);

    const updatedStage = await this.prisma.projectStage.update({
      where: { id: stageId },
      data: {
        status: dto.status as StageStatus,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });

    // Write history record
    await this.prisma.projectStageHistory.create({
      data: {
        stageId,
        status: dto.status as StageStatus,
        notes: dto.notes,
        updatedBy: user.email,
      },
    });

    // Calculate project progress automatically based on stages
    const allStages = await this.prisma.projectStage.findMany({
      where: { projectId: oldStage.projectId },
    });
    const completedCount = allStages.filter((s) => s.status === StageStatus.DONE).length;
    const inProgressCount = allStages.filter((s) => s.status === StageStatus.DOING).length;
    
    // Default weights: DONE = 100%, DOING = 50%
    const calculatedProgress = Math.round(
      ((completedCount * 100 + inProgressCount * 50) / (allStages.length * 100)) * 100
    );

    await this.prisma.project.update({
      where: { id: oldStage.projectId },
      data: { progress: calculatedProgress },
    });

    await this.auditService.log(user.sub, "UPDATE", "ProjectStage", stageId, oldStage, updatedStage);
    return updatedStage;
  }

  // 7. Site deficiencies (Site notes / missing materials)
  async addDeficiency(projectId: string, description: string, severity: any, user: any) {
    await this.findOne(projectId, user); // check access

    const deficiency = await this.prisma.siteDeficiency.create({
      data: {
        projectId,
        description,
        severity,
        status: "OPEN",
        raisedById: user.sub,
      },
    });

    await this.auditService.log(user.sub, "CREATE", "SiteDeficiency", deficiency.id, null, deficiency);
    return deficiency;
  }

  async updateDeficiency(deficiencyId: string, status: any, user: any) {
    const oldDef = await this.prisma.siteDeficiency.findUnique({
      where: { id: deficiencyId },
    });

    if (!oldDef) {
      throw new NotFoundException("الملاحظة غير موجودة");
    }

    await this.findOne(oldDef.projectId, user); // check access

    const updatedDef = await this.prisma.siteDeficiency.update({
      where: { id: deficiencyId },
      data: {
        status,
        resolvedDate: status === "RESOLVED" ? new Date() : null,
      },
    });

    await this.auditService.log(user.sub, "UPDATE", "SiteDeficiency", deficiencyId, oldDef, updatedDef);
    return updatedDef;
  }

  // 6.5 Create / delete stages (مراحل التنفيذ)
  async addStage(projectId: string, dto: CreateStageDto, user: any) {
    await this.findOne(projectId, user); // check access

    const stage = await this.prisma.projectStage.create({
      data: {
        projectId,
        name: dto.name,
        status: (dto.status as StageStatus) ?? StageStatus.TODO,
        notes: dto.notes,
        color: "#e11d48",
      },
    });

    await this.auditService.log(user.sub, "CREATE", "ProjectStage", stage.id, null, stage);
    return stage;
  }

  async deleteStage(stageId: string, user: any) {
    const stage = await this.prisma.projectStage.findUnique({ where: { id: stageId } });
    if (!stage) {
      throw new NotFoundException("المرحلة غير موجودة");
    }
    await this.findOne(stage.projectId, user);

    await this.prisma.projectStage.delete({ where: { id: stageId } });
    await this.auditService.log(user.sub, "DELETE", "ProjectStage", stageId, stage, null);
    return { ok: true };
  }

  // 6.6 Technical systems (الأنظمة الفنية) ومكوّناتها
  async getSystems(projectId: string, user: any) {
    await this.findOne(projectId, user);
    return this.prisma.projectSystem.findMany({
      where: { projectId },
      include: { components: true },
    });
  }

  async addSystem(projectId: string, dto: CreateSystemDto, user: any) {
    await this.findOne(projectId, user);

    const system = await this.prisma.projectSystem.create({
      data: {
        projectId,
        type: dto.type as any,
        name: dto.name,
        status: (dto.status as any) ?? "DESIGN",
        notes: dto.notes,
      },
      include: { components: true },
    });

    await this.auditService.log(user.sub, "CREATE", "ProjectSystem", system.id, null, system);
    return system;
  }

  async updateSystem(systemId: string, dto: UpdateSystemDto, user: any) {
    const oldSystem = await this.prisma.projectSystem.findUnique({ where: { id: systemId } });
    if (!oldSystem) {
      throw new NotFoundException("النظام غير موجود");
    }
    await this.findOne(oldSystem.projectId, user);

    const updated = await this.prisma.projectSystem.update({
      where: { id: systemId },
      data: {
        name: dto.name ?? undefined,
        status: (dto.status as any) ?? undefined,
        notes: dto.notes ?? undefined,
      },
      include: { components: true },
    });

    await this.auditService.log(user.sub, "UPDATE", "ProjectSystem", systemId, oldSystem, updated);
    return updated;
  }

  async deleteSystem(systemId: string, user: any) {
    const system = await this.prisma.projectSystem.findUnique({ where: { id: systemId } });
    if (!system) {
      throw new NotFoundException("النظام غير موجود");
    }
    await this.findOne(system.projectId, user);

    await this.prisma.projectSystem.delete({ where: { id: systemId } });
    await this.auditService.log(user.sub, "DELETE", "ProjectSystem", systemId, system, null);
    return { ok: true };
  }

  async addComponent(systemId: string, dto: CreateComponentDto, user: any) {
    const system = await this.prisma.projectSystem.findUnique({ where: { id: systemId } });
    if (!system) {
      throw new NotFoundException("النظام غير موجود");
    }
    await this.findOne(system.projectId, user);

    const component = await this.prisma.systemComponent.create({
      data: {
        systemId,
        componentType: dto.componentType,
        description: dto.description ?? "",
        manufacturer: dto.manufacturer ?? "",
        model: dto.model ?? "",
        quantity: dto.quantity ?? 0,
        unit: dto.unit ?? "",
        location: dto.location ?? "",
      },
    });

    await this.auditService.log(user.sub, "CREATE", "SystemComponent", component.id, null, component);
    return component;
  }

  async updateComponent(componentId: string, dto: UpdateComponentDto, user: any) {
    const oldComponent = await this.prisma.systemComponent.findUnique({
      where: { id: componentId },
      include: { system: true },
    });
    if (!oldComponent) {
      throw new NotFoundException("المكوّن غير موجود");
    }
    await this.findOne(oldComponent.system.projectId, user);

    const updated = await this.prisma.systemComponent.update({
      where: { id: componentId },
      data: {
        installStatus: (dto.installStatus as any) ?? undefined,
        installDate: dto.installStatus === "INSTALLED" ? new Date() : undefined,
        quantity: dto.quantity ?? undefined,
        location: dto.location ?? undefined,
        description: dto.description ?? undefined,
      },
    });

    await this.auditService.log(user.sub, "UPDATE", "SystemComponent", componentId, oldComponent, updated);
    return updated;
  }

  async deleteComponent(componentId: string, user: any) {
    const component = await this.prisma.systemComponent.findUnique({
      where: { id: componentId },
      include: { system: true },
    });
    if (!component) {
      throw new NotFoundException("المكوّن غير موجود");
    }
    await this.findOne(component.system.projectId, user);

    await this.prisma.systemComponent.delete({ where: { id: componentId } });
    await this.auditService.log(user.sub, "DELETE", "SystemComponent", componentId, component, null);
    return { ok: true };
  }

  async deleteDeficiency(deficiencyId: string, user: any) {
    const deficiency = await this.prisma.siteDeficiency.findUnique({ where: { id: deficiencyId } });
    if (!deficiency) {
      throw new NotFoundException("الملاحظة غير موجودة");
    }
    await this.findOne(deficiency.projectId, user);

    await this.prisma.siteDeficiency.delete({ where: { id: deficiencyId } });
    await this.auditService.log(user.sub, "DELETE", "SiteDeficiency", deficiencyId, deficiency, null);
    return { ok: true };
  }

  // 7.4 Supply orders (طلبات التوريد واستلام البضاعة)
  async getSupplyOrders(projectId: string, user: any) {
    await this.findOne(projectId, user);
    return this.prisma.supplyOrder.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        quotation: { select: { id: true, number: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async createSupplyOrder(projectId: string, dto: CreateSupplyOrderDto, user: any) {
    await this.findOne(projectId, user);

    const year = new Date().getFullYear();
    const count = await this.prisma.supplyOrder.count();
    const orderNumber = `SUP-${year}-${String(count + 1).padStart(3, "0")}`;

    const order = await this.prisma.supplyOrder.create({
      data: {
        orderNumber,
        projectId,
        quotationId: dto.quotationId || null,
        notes: dto.notes,
        createdById: user.sub,
        items: {
          create: dto.items.map((it) => ({
            name: it.name,
            brand: it.brand,
            orderedQty: it.orderedQty,
            unit: it.unit,
          })),
        },
      },
      include: {
        items: true,
        quotation: { select: { id: true, number: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log(user.sub, "CREATE", "SupplyOrder", order.id, null, order);
    return order;
  }

  async updateSupplyOrder(projectId: string, orderId: string, dto: UpdateSupplyOrderDto, user: any) {
    await this.findOne(projectId, user);

    const oldOrder = await this.prisma.supplyOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!oldOrder || oldOrder.projectId !== projectId) {
      throw new NotFoundException("طلب التوريد غير موجود");
    }

    // تحديث بنود الاستلام (الكمية المستلمة + تأكيد المهندس)
    if (dto.items) {
      for (const it of dto.items) {
        const belongs = oldOrder.items.some((x) => x.id === it.id);
        if (!belongs) continue;
        await this.prisma.supplyOrderItem.update({
          where: { id: it.id },
          data: {
            receivedQty: it.receivedQty ?? undefined,
            confirmed: it.confirmed ?? undefined,
          },
        });
      }
    }

    // إعادة حساب حالة الطلب من واقع البنود
    const items = await this.prisma.supplyOrderItem.findMany({ where: { orderId } });
    const allReceived = items.length > 0 && items.every((it) => it.confirmed && Number(it.receivedQty) >= Number(it.orderedQty));
    const anyReceived = items.some((it) => it.confirmed || Number(it.receivedQty) > 0);
    const status = allReceived ? "RECEIVED" : anyReceived ? "PARTIAL" : "PENDING";

    const updated = await this.prisma.supplyOrder.update({
      where: { id: orderId },
      data: {
        notes: dto.notes ?? undefined,
        status: status as any,
      },
      include: {
        items: true,
        quotation: { select: { id: true, number: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log(user.sub, "UPDATE", "SupplyOrder", orderId, oldOrder, updated);
    return updated;
  }

  // 7.5 Daily site reports (تقرير اليوم الموحد)
  async getDailyReports(projectId: string, user: any) {
    await this.findOne(projectId, user); // check access

    return this.prisma.dailySiteReport.findMany({
      where: { projectId },
      orderBy: { date: "desc" },
      include: {
        systemEntries: true,
        submittedBy: { select: { id: true, name: true } },
      },
    });
  }

  async createDailyReport(projectId: string, dto: CreateDailyReportDto, user: any) {
    await this.findOne(projectId, user); // check access

    const report = await this.prisma.dailySiteReport.create({
      data: {
        projectId,
        submittedById: user.sub,
        workersCount: dto.workersCount ?? 0,
        problems: dto.problems,
        solutions: dto.solutions,
        needsQuoteRequest: dto.needsQuoteRequest ?? false,
        needsConsultantReview: dto.needsConsultantReview ?? false,
        engineerNotes: dto.engineerNotes,
        completionPercent: dto.completionPercent ?? 0,
        signature: dto.signature,
        systemEntries: {
          create: (dto.systemEntries ?? []).map((entry) => ({
            systemType: entry.systemType as any,
            foundationDone: entry.foundationDone ?? false,
            wiringDone: entry.wiringDone ?? false,
            installDone: entry.installDone ?? false,
          })),
        },
      },
      include: {
        systemEntries: true,
        submittedBy: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log(user.sub, "CREATE", "DailySiteReport", report.id, null, report);
    return report;
  }

  async createClient(dto: CreateClientDto, user: any) {
    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        // الأعمدة NOT NULL في قاعدة البيانات بينما الحقول اختيارية في الشاشة
        phone: dto.phone ?? "",
        address: dto.address ?? "",
        type: dto.type || "عميل",
        notes: dto.notes,
        sector: dto.sector,
        email: dto.email,
        city: dto.city,
        commercialRegister: dto.commercialRegister,
        taxId: dto.taxId,
        digitalWallet: dto.digitalWallet,
        documentationAuthority: dto.documentationAuthority,
      },
    });

    await this.auditService.log(user.sub, "CREATE", "Client", client.id, null, client);
    return client;
  }

  async updateClient(id: string, dto: UpdateClientDto, user: any) {
    const oldClient = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!oldClient) {
      throw new NotFoundException("العميل غير موجود");
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        type: dto.type,
        notes: dto.notes,
        sector: dto.sector,
        email: dto.email,
        city: dto.city,
        commercialRegister: dto.commercialRegister,
        taxId: dto.taxId,
        digitalWallet: dto.digitalWallet,
        documentationAuthority: dto.documentationAuthority,
      },
    });

    await this.auditService.log(user.sub, "UPDATE", "Client", id, oldClient, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string, user: any) {
    const oldClient = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!oldClient) {
      throw new NotFoundException("العميل غير موجود");
    }

    await this.prisma.client.delete({
      where: { id },
    });

    await this.auditService.log(user.sub, "DELETE", "Client", id, oldClient, null);
    return { success: true };
  }
}
