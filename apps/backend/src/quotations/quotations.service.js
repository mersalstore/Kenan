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
exports.QuotationsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var pdfkit_1 = require("pdfkit");
var XLSX = require("xlsx");
var QuotationsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var QuotationsService = _classThis = /** @class */ (function () {
        function QuotationsService_1(prisma, auditService) {
            this.prisma = prisma;
            this.auditService = auditService;
        }
        // 1. Find all quotations
        QuotationsService_1.prototype.findAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.quotation.findMany({
                            include: { client: true },
                            orderBy: { createdAt: "desc" },
                        })];
                });
            });
        };
        // 2. Find one quotation
        QuotationsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var quotation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.quotation.findUnique({
                                where: { id: id },
                                include: { client: true, items: true },
                            })];
                        case 1:
                            quotation = _a.sent();
                            if (!quotation) {
                                throw new common_1.NotFoundException("عرض السعر غير موجود");
                            }
                            return [2 /*return*/, quotation];
                    }
                });
            });
        };
        // 3. Create Quotation
        QuotationsService_1.prototype.create = function (dto, user) {
            return __awaiter(this, void 0, void 0, function () {
                var count, dateObj, year, seq, number, subtotal, vat, value, quotation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.quotation.count()];
                        case 1:
                            count = _a.sent();
                            dateObj = new Date(dto.date);
                            year = dateObj.getFullYear();
                            seq = String(count + 1).padStart(3, "0");
                            number = "QT-".concat(year, "-").concat(seq);
                            subtotal = dto.items.reduce(function (acc, it) { return acc + (it.qty * it.price); }, 0);
                            vat = Math.round(subtotal * (dto.taxPercent / 100));
                            value = subtotal + vat;
                            return [4 /*yield*/, this.prisma.quotation.create({
                                    data: {
                                        number: number,
                                        clientId: dto.clientId,
                                        date: new Date(dto.date),
                                        validUntil: new Date(dto.validUntil),
                                        status: client_1.QuotationStatus.DRAFT,
                                        taxPercent: dto.taxPercent,
                                        value: value,
                                        currency: dto.currency,
                                        notes: dto.notes,
                                        items: {
                                            create: dto.items.map(function (it) { return ({
                                                name: it.name,
                                                brand: it.brand,
                                                qty: it.qty,
                                                price: it.price,
                                                total: it.qty * it.price,
                                            }); }),
                                        },
                                    },
                                    include: { items: true },
                                })];
                        case 2:
                            quotation = _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "CREATE", "Quotation", quotation.id, null, quotation)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, quotation];
                    }
                });
            });
        };
        // 4. Update status
        QuotationsService_1.prototype.updateStatus = function (id, status, user) {
            return __awaiter(this, void 0, void 0, function () {
                var oldQ, updatedQ;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            oldQ = _a.sent();
                            return [4 /*yield*/, this.prisma.quotation.update({
                                    where: { id: id },
                                    data: { status: status },
                                })];
                        case 2:
                            updatedQ = _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "UPDATE", "Quotation", id, oldQ, updatedQ)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, updatedQ];
                    }
                });
            });
        };
        // 5. Delete quotation
        QuotationsService_1.prototype.delete = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                var oldQ;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            oldQ = _a.sent();
                            return [4 /*yield*/, this.prisma.quotation.delete({ where: { id: id } })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.auditService.log(user.sub, "DELETE", "Quotation", id, oldQ, null)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { ok: true }];
                    }
                });
            });
        };
        // 6. Generate PDF Buffer
        QuotationsService_1.prototype.generatePdf = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var q;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            q = _a.sent();
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var doc = new pdfkit_1.default({ margin: 40 });
                                    var buffers = [];
                                    doc.on("data", function (chunk) { return buffers.push(chunk); });
                                    doc.on("end", function () { return resolve(Buffer.concat(buffers)); });
                                    doc.on("error", function (err) { return reject(err); });
                                    // PDF Content
                                    doc.fontSize(16).text("Kanan Safety and Security Systems", { align: "center" });
                                    doc.fontSize(12).text("مؤسسة كنان لأنظمة الأمن والسلامة", { align: "center" });
                                    doc.moveDown();
                                    doc.fontSize(10).text("Quotation Number: ".concat(q.number));
                                    doc.text("Client Name: ".concat(q.client.name));
                                    doc.text("Date: ".concat(q.date.toISOString().slice(0, 10)));
                                    doc.text("Valid Until: ".concat(q.validUntil.toISOString().slice(0, 10)));
                                    doc.text("Status: ".concat(q.status));
                                    doc.moveDown();
                                    doc.text("Items Table:", { underline: true });
                                    doc.moveDown(0.5);
                                    var subtotal = 0;
                                    q.items.forEach(function (item, idx) {
                                        var itemTotal = Number(item.total);
                                        subtotal += itemTotal;
                                        doc.text("".concat(idx + 1, ". ").concat(item.name, " - Brand: ").concat(item.brand || "N/A", " - Qty: ").concat(item.qty, " - Price: ").concat(item.price, " ").concat(q.currency, " - Total: ").concat(itemTotal, " ").concat(q.currency));
                                    });
                                    doc.moveDown();
                                    var taxAmount = subtotal * (Number(q.taxPercent) / 100);
                                    var finalTotal = subtotal + taxAmount;
                                    doc.text("Subtotal: ".concat(subtotal.toFixed(2), " ").concat(q.currency));
                                    doc.text("VAT (".concat(q.taxPercent, "%): ").concat(taxAmount.toFixed(2), " ").concat(q.currency));
                                    doc.font("Helvetica-Bold").text("Total Value: ".concat(finalTotal.toFixed(2), " ").concat(q.currency));
                                    doc.font("Helvetica"); // Reset font
                                    if (q.notes) {
                                        doc.moveDown();
                                        doc.text("Notes: ".concat(q.notes));
                                    }
                                    doc.end();
                                })];
                    }
                });
            });
        };
        // 7. Generate Excel Buffer
        QuotationsService_1.prototype.generateExcel = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var q, rows, worksheet, workbook, subtotal, vat, total, buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            q = _a.sent();
                            rows = q.items.map(function (item, idx) { return ({
                                "م.": idx + 1,
                                "البند": item.name,
                                "الماركة": item.brand || "—",
                                "الكمية": Number(item.qty),
                                "سعر الوحدة": Number(item.price),
                                "الإجمالي": Number(item.total),
                            }); });
                            worksheet = XLSX.utils.json_to_sheet(rows);
                            workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation Items");
                            subtotal = q.items.reduce(function (acc, it) { return acc + Number(it.total); }, 0);
                            vat = subtotal * (Number(q.taxPercent) / 100);
                            total = subtotal + vat;
                            XLSX.utils.sheet_add_aoa(worksheet, [
                                [],
                                ["", "", "", "", "المجموع الفرعي", subtotal],
                                ["", "", "", "", "\u0627\u0644\u0636\u0631\u064A\u0628\u0629 (".concat(q.taxPercent, "%)"), vat],
                                ["", "", "", "", "الإجمالي النهائي", total],
                            ], { origin: -1 });
                            buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
                            return [2 /*return*/, buffer];
                    }
                });
            });
        };
        return QuotationsService_1;
    }());
    __setFunctionName(_classThis, "QuotationsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QuotationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QuotationsService = _classThis;
}();
exports.QuotationsService = QuotationsService;
