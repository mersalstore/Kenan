import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { ProjectsService } from './projects/projects.service';
import { AuditService } from './audit/audit.service';
import { UserRole } from '@prisma/client';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

describe('Comprehensive Daily Reports & Permissions Test Suite', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let prismaMock: any;
  let projectsService: ProjectsService;
  let auditServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      rolePermission: {
        findFirst: jest.fn().mockResolvedValue(null), // Empty / unseeded DB simulation
      },
      userProjectPermission: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      project: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      dailySiteReport: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    auditServiceMock = {
      log: jest.fn().mockResolvedValue(true),
    };

    reflector = new Reflector();
    guard = new PermissionsGuard(reflector, prismaMock);
    projectsService = new ProjectsService(prismaMock, auditServiceMock);
  });

  function createMockContext(user: any, params: any = {}, query: any = {}): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params,
          query,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  describe('1. PermissionsGuard Fallback & Project Boundary (Daily Reports)', () => {
    it('should allow SITE_ENGINEER to CREATE dailyReports even if DB rolePermission table is empty', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ module: 'dailyReports', action: 'CREATE' });

      const context = createMockContext(
        { sub: 'eng-123', name: 'م. كريم عادل', role: UserRole.SITE_ENGINEER },
        { projectId: 'proj-1' }
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow SITE_ENGINEER to submit daily report on project without engineer assignment', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ module: 'dailyReports', action: 'CREATE' });
      prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-unassigned', engineerId: null, engineer: null });

      const context = createMockContext(
        { sub: 'eng-123', name: 'م. كريم عادل', role: UserRole.SITE_ENGINEER },
        { projectId: 'proj-unassigned' }
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow SITE_ENGINEER to submit daily report on any valid project in the system', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ module: 'dailyReports', action: 'CREATE' });
      prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-2', engineerId: 'other-eng', engineer: { id: 'other-eng', name: 'مهندس آخر' } });

      const context = createMockContext(
        { sub: 'eng-123', name: 'م. كريم عادل', role: UserRole.SITE_ENGINEER },
        { projectId: 'proj-2' }
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow ADMIN to bypass all permission checks', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ module: 'dailyReports', action: 'CREATE' });

      const context = createMockContext(
        { sub: 'admin-1', name: 'الإدارة العامة', role: UserRole.ADMIN },
        { projectId: 'proj-999' }
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow PROJECT_MANAGER to create and read dailyReports', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ module: 'dailyReports', action: 'CREATE' });

      const context = createMockContext(
        { sub: 'pm-1', name: 'مدير المشاريع', role: UserRole.PROJECT_MANAGER },
        { projectId: 'proj-1' }
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('2. ProjectsService.findAll (Admin vs Site Engineer Scope)', () => {
    it('should return ALL projects for ADMIN without any engineer filtering', async () => {
      const mockProjects = [
        { id: 'proj-1', name: 'مبني البلدية', engineerId: 'eng-1' },
        { id: 'proj-2', name: 'البيان', engineerId: 'eng-2' },
        { id: 'proj-3', name: 'فيلا الياسمين', engineerId: null },
      ];
      prismaMock.project.findMany.mockResolvedValue(mockProjects);

      const result = await projectsService.findAll({ sub: 'admin-1', role: 'ADMIN' });
      expect(result).toHaveLength(3);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should return ALL projects for Arabic role "مدير عام" and "مدير مشاريع"', async () => {
      const mockProjects = [
        { id: 'proj-1', name: 'مشروع 1' },
        { id: 'proj-2', name: 'مشروع 2' },
      ];
      prismaMock.project.findMany.mockResolvedValue(mockProjects);

      const resultAdmin = await projectsService.findAll({ sub: 'admin-1', role: 'مدير عام' });
      expect(resultAdmin).toHaveLength(2);

      const resultPM = await projectsService.findAll({ sub: 'pm-1', role: 'مدير مشاريع' });
      expect(resultPM).toHaveLength(2);
    });

    it('should filter projects for SITE_ENGINEER by engineerId or name', async () => {
      const siteEngUser = { sub: 'eng-123', name: 'م. كريم عادل', role: 'SITE_ENGINEER' };
      prismaMock.project.findMany.mockResolvedValue([
        { id: 'proj-1', name: 'فيلا الياسمين', engineerId: 'eng-123' },
      ]);

      const result = await projectsService.findAll(siteEngUser);
      expect(result).toHaveLength(1);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { engineerId: 'eng-123' },
              { projectPermissions: { some: { userId: 'eng-123' } } },
            ]),
          }),
        })
      );
    });
  });

  describe('3. ProjectsService.createDailyReport & getDailyReports Flow', () => {
    it('should successfully create and persist a daily report for a site engineer', async () => {
      const projectId = 'proj-1';
      const siteEngUser = { sub: 'eng-123', name: 'م. كريم عادل', role: 'SITE_ENGINEER' };

      prismaMock.project.findUnique.mockResolvedValue({ id: projectId, name: 'فيلا الياسمين' });

      const dto = {
        workersCount: 6,
        problems: 'عائق في الموقع',
        solutions: 'تم التنسيق مع الاستشاري',
        needsQuoteRequest: false,
        needsConsultantReview: true,
        engineerNotes: 'ملاحظة',
        completionPercent: 15,
        signature: 'م. كريم عادل',
        systemEntries: [
          { systemType: 'FIRE_ALARM', foundationDone: true, wiringDone: false, installDone: false },
          { systemType: 'FIRE_FIGHTING', foundationDone: false, wiringDone: false, installDone: false },
          { systemType: 'VENTILATION', foundationDone: false, wiringDone: false, installDone: false },
        ],
      };

      const savedReport = {
        id: 'rep-1',
        projectId,
        submittedById: 'eng-123',
        ...dto,
        date: new Date(),
        submittedBy: { id: 'eng-123', name: 'م. كريم عادل' },
        systemEntries: dto.systemEntries,
      };

      prismaMock.dailySiteReport.create.mockResolvedValue(savedReport);

      const result = await projectsService.createDailyReport(projectId, dto as any, siteEngUser);

      expect(result).toBeDefined();
      expect(result.id).toBe('rep-1');
      expect(result.completionPercent).toBe(15);
      expect(result.workersCount).toBe(6);
      expect(result.submittedById).toBe('eng-123');
      expect(result.needsConsultantReview).toBe(true);
      expect(result.systemEntries).toHaveLength(3);
      expect(prismaMock.dailySiteReport.create).toHaveBeenCalledTimes(1);
    });

    it('should retrieve daily reports for management without permission blockers', async () => {
      const projectId = 'proj-1';
      const adminUser = { sub: 'admin-1', role: 'ADMIN' };

      prismaMock.project.findUnique.mockResolvedValue({ id: projectId, name: 'فيلا الياسمين' });
      prismaMock.dailySiteReport.findMany.mockResolvedValue([
        {
          id: 'rep-1',
          projectId,
          date: new Date(),
          workersCount: 6,
          completionPercent: 15,
          problems: 'عائق',
          submittedBy: { id: 'eng-123', name: 'م. كريم عادل' },
          systemEntries: [],
        },
      ]);

      const reports = await projectsService.getDailyReports(projectId, adminUser);

      expect(reports).toHaveLength(1);
      expect(reports[0].id).toBe('rep-1');
      expect(reports[0].submittedBy.name).toBe('م. كريم عادل');
      expect(reports[0].completionPercent).toBe(15);
    });
  });
});

