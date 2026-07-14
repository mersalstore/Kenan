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
exports.ReportsService = void 0;
var common_1 = require("@nestjs/common");
var pdfkit_1 = require("pdfkit");
var XLSX = require("xlsx");
var ReportsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ReportsService = _classThis = /** @class */ (function () {
        function ReportsService_1(prisma) {
            this.prisma = prisma;
        }
        // 1. Get Project Report Data
        ReportsService_1.prototype.getProjectReport = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, totalInvoiced, totalExpenses, projectProfit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                                include: {
                                    engineer: { select: { name: true, email: true } },
                                    stages: true,
                                    assignments: {
                                        include: { worker: true, contractor: true },
                                    },
                                    invoices: true,
                                    expenses: true,
                                },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("المشروع غير موجود");
                            }
                            totalInvoiced = project.invoices.reduce(function (acc, inv) { return acc + Number(inv.amount); }, 0);
                            totalExpenses = project.expenses.reduce(function (acc, exp) { return acc + Number(exp.amount); }, 0);
                            projectProfit = totalInvoiced - totalExpenses;
                            return [2 /*return*/, {
                                    project: project,
                                    summary: {
                                        totalInvoiced: totalInvoiced,
                                        totalExpenses: totalExpenses,
                                        projectProfit: projectProfit,
                                    },
                                }];
                    }
                });
            });
        };
        // 2. Get Financial Report Data
        ReportsService_1.prototype.getFinancialReport = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var start, end, invoices, expenses, totalIncome, totalExpense, netProfit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
                            end = endDate ? new Date(endDate) : new Date();
                            return [4 /*yield*/, this.prisma.invoice.findMany({
                                    where: { createdAt: { gte: start, lte: end } },
                                    include: { project: true },
                                })];
                        case 1:
                            invoices = _a.sent();
                            return [4 /*yield*/, this.prisma.expense.findMany({
                                    where: { date: { gte: start, lte: end } },
                                    include: { project: true },
                                })];
                        case 2:
                            expenses = _a.sent();
                            totalIncome = invoices.reduce(function (acc, inv) { return acc + Number(inv.amount); }, 0);
                            totalExpense = expenses.reduce(function (acc, exp) { return acc + Number(exp.amount); }, 0);
                            netProfit = totalIncome - totalExpense;
                            return [2 /*return*/, {
                                    period: { start: start, end: end },
                                    totalIncome: totalIncome,
                                    totalExpense: totalExpense,
                                    netProfit: netProfit,
                                    invoices: invoices,
                                    expenses: expenses,
                                }];
                    }
                });
            });
        };
        // 3. Generate Project Report PDF Buffer
        ReportsService_1.prototype.generateProjectPdf = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var data, project, summary;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getProjectReport(projectId)];
                        case 1:
                            data = _a.sent();
                            project = data.project, summary = data.summary;
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var _a;
                                    var doc = new pdfkit_1.default({ margin: 40 });
                                    var buffers = [];
                                    doc.on("data", function (chunk) { return buffers.push(chunk); });
                                    doc.on("end", function () { return resolve(Buffer.concat(buffers)); });
                                    doc.on("error", function (err) { return reject(err); });
                                    doc.fontSize(16).text("Project Report: ".concat(project.name), { align: "center" });
                                    doc.fontSize(10).text("Type: ".concat(project.type));
                                    doc.text("Status: ".concat(project.status));
                                    doc.text("Progress: ".concat(project.progress, "%"));
                                    doc.text("Timeline: ".concat(project.startDate.toISOString().slice(0, 10), " to ").concat(project.endDate.toISOString().slice(0, 10)));
                                    doc.text("Engineer: ".concat(((_a = project.engineer) === null || _a === void 0 ? void 0 : _a.name) || "None"));
                                    doc.moveDown();
                                    doc.fontSize(12).text("Financial Summary", { underline: true });
                                    doc.fontSize(10).text("Budget: ".concat(project.budget, " SAR"));
                                    doc.text("Total Invoiced (Revenue): ".concat(summary.totalInvoiced, " SAR"));
                                    doc.text("Total Expenses: ".concat(summary.totalExpenses, " SAR"));
                                    doc.text("Net Project Profit: ".concat(summary.projectProfit, " SAR"));
                                    doc.moveDown();
                                    doc.fontSize(12).text("Assigned Workers & Contractors", { underline: true });
                                    project.assignments.forEach(function (a, idx) {
                                        var _a, _b;
                                        var entityName = a.worker ? "Worker: ".concat(a.worker.name, " (").concat(a.worker.specialty, ")") : "Contractor: ".concat((_a = a.contractor) === null || _a === void 0 ? void 0 : _a.name, " (").concat((_b = a.contractor) === null || _b === void 0 ? void 0 : _b.specialty, ")");
                                        doc.fontSize(10).text("".concat(idx + 1, ". ").concat(entityName, " - Role: ").concat(a.roleOnSite));
                                    });
                                    doc.end();
                                })];
                    }
                });
            });
        };
        // 4. Generate Project Report Excel Buffer
        ReportsService_1.prototype.generateProjectExcel = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var data, project, rows, worksheet, workbook, buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getProjectReport(projectId)];
                        case 1:
                            data = _a.sent();
                            project = data.project;
                            rows = [
                                ["Project Name", project.name],
                                ["Type", project.type],
                                ["Status", project.status],
                                ["Progress", "".concat(project.progress, "%")],
                                ["Budget", Number(project.budget)],
                                [],
                                ["Financial Report"],
                                ["Total Invoiced", data.summary.totalInvoiced],
                                ["Total Expenses", data.summary.totalExpenses],
                                ["Profit", data.summary.projectProfit],
                            ];
                            worksheet = XLSX.utils.aoa_to_sheet(rows);
                            workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, "Project Report");
                            buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
                            return [2 /*return*/, buffer];
                    }
                });
            });
        };
        return ReportsService_1;
    }());
    __setFunctionName(_classThis, "ReportsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReportsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReportsService = _classThis;
}();
exports.ReportsService = ReportsService;
