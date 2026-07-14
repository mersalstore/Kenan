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
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var google_auth_library_1 = require("google-auth-library");
var bcrypt = require("bcrypt");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(prisma, jwtService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
            this.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID || "304044976713-3mtnpi2vsr6ikrldgc1v4cnfit9ca74t.apps.googleusercontent.com");
        }
        // 1. Staff Login
        AuthService_1.prototype.login = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var user, passwordMatch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { email: dto.email.toLowerCase().trim() },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!user || !user.isActive) {
                                throw new common_1.UnauthorizedException("البريد الإلكتروني أو كلمة المرور غير صحيحة");
                            }
                            return [4 /*yield*/, bcrypt.compare(dto.password, user.passwordHash)];
                        case 2:
                            passwordMatch = _a.sent();
                            if (!passwordMatch) {
                                throw new common_1.UnauthorizedException("البريد الإلكتروني أو كلمة المرور غير صحيحة");
                            }
                            return [2 /*return*/, this.generateAuthTokens(user.id, user.email, user.role)];
                    }
                });
            });
        };
        // 2. Google OAuth Login for Admin
        AuthService_1.prototype.googleLogin = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var ticket, payload, allowedEmails, userEmail, user, _a, _b, error_1;
                var _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 6, , 7]);
                            return [4 /*yield*/, this.googleClient.verifyIdToken({
                                    idToken: dto.credential,
                                    audience: process.env.GOOGLE_CLIENT_ID,
                                })];
                        case 1:
                            ticket = _e.sent();
                            payload = ticket.getPayload();
                            if (!payload || !payload.email) {
                                throw new common_1.UnauthorizedException("فشل التحقق من توكين جوجل");
                            }
                            allowedEmails = (process.env.ALLOWED_GOOGLE_EMAILS || "kenansafety.sec@gmail.com,hazemcoding@gmail.com")
                                .split(",")
                                .map(function (e) { return e.trim().toLowerCase(); });
                            userEmail = payload.email.toLowerCase();
                            if (!allowedEmails.includes(userEmail)) {
                                throw new common_1.UnauthorizedException("هذا الحساب غير مصرح له بدخول النظام");
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { email: userEmail },
                                })];
                        case 2:
                            user = _e.sent();
                            if (!!user) return [3 /*break*/, 5];
                            _b = (_a = this.prisma.user).create;
                            _c = {};
                            _d = {
                                name: payload.name || userEmail,
                                email: userEmail
                            };
                            return [4 /*yield*/, bcrypt.hash(Math.random().toString(36).slice(-8), 10)];
                        case 3: return [4 /*yield*/, _b.apply(_a, [(_c.data = (_d.passwordHash = _e.sent(),
                                    _d.role = "ADMIN",
                                    _d.isActive = true,
                                    _d),
                                    _c)])];
                        case 4:
                            user = _e.sent();
                            _e.label = 5;
                        case 5: return [2 /*return*/, this.generateAuthTokens(user.id, user.email, user.role)];
                        case 6:
                            error_1 = _e.sent();
                            throw new common_1.UnauthorizedException("فشل تسجيل الدخول عبر جوجل: " + error_1.message);
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        // 3. Refresh Tokens
        AuthService_1.prototype.refresh = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var refreshToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.refreshToken.findUnique({
                                where: { token: token },
                                include: { user: true },
                            })];
                        case 1:
                            refreshToken = _a.sent();
                            if (!(!refreshToken || refreshToken.expiresAt < new Date())) return [3 /*break*/, 4];
                            if (!refreshToken) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.refreshToken.delete({ where: { id: refreshToken.id } })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: throw new common_1.UnauthorizedException("توكين التجديد منتهي أو غير صالح");
                        case 4: return [2 /*return*/, this.generateAuthTokens(refreshToken.user.id, refreshToken.user.email, refreshToken.user.role)];
                    }
                });
            });
        };
        // 4. Logout
        AuthService_1.prototype.logout = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.refreshToken.delete({ where: { token: token } })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _a.sent();
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/, { ok: true }];
                    }
                });
            });
        };
        // Helper: Token Generator
        AuthService_1.prototype.generateAuthTokens = function (userId, email, role) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, accessToken, refreshTokenString, expiresAt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            payload = { sub: userId, email: email, role: role };
                            accessToken = this.jwtService.sign(payload, {
                                secret: process.env.JWT_SECRET || "super-secret-kanan-jwt-key-2026",
                                expiresIn: (process.env.JWT_EXPIRATION || "15m"),
                            });
                            refreshTokenString = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
                            expiresAt = new Date();
                            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration
                            return [4 /*yield*/, this.prisma.refreshToken.create({
                                    data: {
                                        token: refreshTokenString,
                                        userId: userId,
                                        expiresAt: expiresAt,
                                    },
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    accessToken: accessToken,
                                    refreshToken: refreshTokenString,
                                    user: {
                                        id: userId,
                                        email: email,
                                        role: role,
                                    },
                                }];
                    }
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
