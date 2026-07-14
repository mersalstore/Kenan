"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var ProjectsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProjectsService = _classThis = /** @class */ (function () {
        function ProjectsService_1(prisma, auditService) {
            this.prisma = prisma;
            this.auditService = auditService;
        }
        // 1. Find all projects (Filtered by role)
        ProjectsService_1.prototype.findAll = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (user.role === "ADMIN" || user.role === "PROJECT_MANAGER") {
                        return [2 /*return*/, this.prisma.project.findMany({
                                include: {
                                    client: true,
                                    engineer: { select: { id: true, name: true, email: true } },
                                },
                            })];
                    }
                    // Site Engineer: only see assigned projects
                    return [2 /*return*/, this.prisma.project.findMany({
                            where: {
                                OR: [
                                    { engineerId: user.sub },
                                    { projectPermissions: { some: { userId: user.sub } } },
                                ],
                            },
                            include: {
                                client: true,
                                engineer: { select: { id: true, name: true, email: true } },
                            },
                        })];
                });
            });
        };
        // 2. Find one project details
        ProjectsService_1.prototype.findOne = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                var project, hasPermission;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: id },
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
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("المشروع غير موجود");
                            }
                            if (!(user.role === "SITE_ENGINEER" &&
                                project.engineerId !== user.sub)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.userProjectPermission.findFirst({
                                    where: { userId: user.sub, projectId: id },
                                })];
                        case 2:
                            hasPermission = _a.sent();
                            if (!hasPermission) {
                                throw new common_1.ForbiddenException("غير مصرح لك بالوصول إلى هذا المشروع");
                            }
                            _a.label = 3;
                        case 3: return [2 /*return*/, project];
                    }
                });
            });
        };
        // 3. Create Project
        ProjectsService_1.prototype.create = function (dto, user) {
            return __awaiter(this, void 0, void 0, function () {
                var project, defaultStages, _i, defaultStages_1, name_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.create({
                                data: {
                                    name: dto.name,
                                    type: dto.type,
                                    clientId: dto.clientId,
                                    address: dto.address,
                                    startDate: new Date(dto.startDate),
                                    endDate: new Date(dto.endDate),
                                    budget: dto.budget,
                                    engineerId: dto.engineerId || null,
                                    status: client_1.ProjectStatus.PLANNED,
                                },
                            })];
                        case 1:
                            project = _a.sent();
                            defaultStages = ["المعاينة", "التأسيس", "التركيب", "الاختبار", "التسليم"];
                            _i = 0, defaultStages_1 = defaultStages;
                            _a.label = 2;
                        case 2:
                            if (!(_i < defaultStages_1.length)) return [3 /*break*/, 5];
                            name_1 = defaultStages_1[_i];
                            return [4 /*yield*/, this.prisma.projectStage.create({
                                    data: {
                                        projectId: project.id,
                                        name: name_1,
                                        status: client_1.StageStatus.TODO,
                                        color: "#e11d48",
                                    },
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            if (!dto.engineerId) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.userProjectPermission.create({
                                    data: {
                                        userId: dto.engineerId,
                                        projectId: project.id,
                                    },
                                })];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7: return [4 /*yield*/, this.auditService.log(user.sub, "CREATE", "Project", project.id, null, project)];
                        case 8:
                            _a.sent();
                            return [2 /*return*/, project];
                    }
                });
            });
        };
        // 4. Update Project (Restricted fields for Site Engineer)
        ProjectsService_1.prototype.update = function (id, dto, user) {
            return __awaiter(this, void 0, void 0, function () {
                var oldProject, updateData, updatedProject;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, user)];
                        case 1:
                            oldProject = _a.sent();
                            updateData = {};
                            if (!(user.role === "ADMIN" || user.role === "PROJECT_MANAGER")) return [3 /*break*/, 3];
                            // Admin/PM can edit everything
                            if (dto.name)
                                updateData.name = dto.name;
                            if (dto.type)
                                updateData.type = dto.type;
                            if (dto.clientId)
                                updateData.clientId = dto.clientId;
                            if (dto.address)
                                updateData.address = dto.address;
                            if (dto.startDate)
                                updateData.startDate = new Date(dto.startDate);
                            if (dto.endDate)
                                updateData.endDate = new Date(dto.endDate);
                            if (dto.budget !== undefined)
                                updateData.budget = dto.budget;
                            if (!(dto.engineerId !== undefined)) return [3 /*break*/, 3];
                            updateData.engineerId = dto.engineerId;
                            if (!(dto.engineerId && dto.engineerId !== oldProject.engineerId)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.userProjectPermission.upsert({
                                    where: { userId_projectId: { userId: dto.engineerId, projectId: id } },
                                    create: { userId: dto.engineerId, projectId: id },
                                    update: {},
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            // Any role (including Site Engineer) can update status, progress
                            if (dto.status)
                                updateData.status = dto.status;
                            if (dto.progress !== undefined)
                                updateData.progress = dto.progress;
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: id },
                                    data: updateData,
                                })];
                        case 4:
                            updatedProject = _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "UPDATE", "Project", id, oldProject, updatedProject)];
                        case 5:
                            _a.sent();
                            return [2 /*return*/, updatedProject];
                    }
                });
            });
        };
        // 5. Delete Project (Admin only)
        ProjectsService_1.prototype.delete = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                var oldProject;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, user)];
                        case 1:
                            oldProject = _a.sent();
                            return [4 /*yield*/, this.prisma.project.delete({ where: { id: id } })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "DELETE", "Project", id, oldProject, null)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { ok: true }];
                    }
                });
            });
        };
        // 6. Update Project Stage Status & Logs History
        ProjectsService_1.prototype.updateStage = function (stageId, dto, user) {
            return __awaiter(this, void 0, void 0, function () {
                var oldStage, updatedStage, allStages, completedCount, inProgressCount, calculatedProgress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectStage.findUnique({
                                where: { id: stageId },
                            })];
                        case 1:
                            oldStage = _a.sent();
                            if (!oldStage) {
                                throw new common_1.NotFoundException("المرحلة غير موجودة");
                            }
                            // Check project assignment permission
                            return [4 /*yield*/, this.findOne(oldStage.projectId, user)];
                        case 2:
                            // Check project assignment permission
                            _a.sent();
                            return [4 /*yield*/, this.prisma.projectStage.update({
                                    where: { id: stageId },
                                    data: {
                                        status: dto.status,
                                        notes: dto.notes,
                                        updatedAt: new Date(),
                                    },
                                })];
                        case 3:
                            updatedStage = _a.sent();
                            // Write history record
                            return [4 /*yield*/, this.prisma.projectStageHistory.create({
                                    data: {
                                        stageId: stageId,
                                        status: dto.status,
                                        notes: dto.notes,
                                        updatedBy: user.email,
                                    },
                                })];
                        case 4:
                            // Write history record
                            _a.sent();
                            return [4 /*yield*/, this.prisma.projectStage.findMany({
                                    where: { projectId: oldStage.projectId },
                                })];
                        case 5:
                            allStages = _a.sent();
                            completedCount = allStages.filter(function (s) { return s.status === client_1.StageStatus.DONE; }).length;
                            inProgressCount = allStages.filter(function (s) { return s.status === client_1.StageStatus.DOING; }).length;
                            calculatedProgress = Math.round(((completedCount * 100 + inProgressCount * 50) / (allStages.length * 100)) * 100);
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: oldStage.projectId },
                                    data: { progress: calculatedProgress },
                                })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "UPDATE", "ProjectStage", stageId, oldStage, updatedStage)];
                        case 7:
                            _a.sent();
                            return [2 /*return*/, updatedStage];
                    }
                });
            });
        };
        // 7. Site deficiencies (Site notes / missing materials)
        ProjectsService_1.prototype.addDeficiency = function (projectId, description, severity, user) {
            return __awaiter(this, void 0, void 0, function () {
                var deficiency;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(projectId, user)];
                        case 1:
                            _a.sent(); // check access
                            return [4 /*yield*/, this.prisma.siteDeficiency.create({
                                    data: {
                                        projectId: projectId,
                                        description: description,
                                        severity: severity,
                                        status: "OPEN",
                                        raisedById: user.sub,
                                    },
                                })];
                        case 2:
                            deficiency = _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "CREATE", "SiteDeficiency", deficiency.id, null, deficiency)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, deficiency];
                    }
                });
            });
        };
        ProjectsService_1.prototype.updateDeficiency = function (deficiencyId, status, user) {
            return __awaiter(this, void 0, void 0, function () {
                var oldDef, updatedDef;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.siteDeficiency.findUnique({
                                where: { id: deficiencyId },
                            })];
                        case 1:
                            oldDef = _a.sent();
                            if (!oldDef) {
                                throw new common_1.NotFoundException("الملاحظة غير موجودة");
                            }
                            return [4 /*yield*/, this.findOne(oldDef.projectId, user)];
                        case 2:
                            _a.sent(); // check access
                            return [4 /*yield*/, this.prisma.siteDeficiency.update({
                                    where: { id: deficiencyId },
                                    data: {
                                        status: status,
                                        resolvedDate: status === "RESOLVED" ? new Date() : null,
                                    },
                                })];
                        case 3:
                            updatedDef = _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "UPDATE", "SiteDeficiency", deficiencyId, oldDef, updatedDef)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, updatedDef];
                    }
                });
            });
        };
        return ProjectsService_1;
    }());
    __setFunctionName(_classThis, "ProjectsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProjectsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProjectsService = _classThis;
}();
exports.ProjectsService = ProjectsService;
