"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.REQUIRE_PERMISSION_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.REQUIRE_PERMISSION_KEY = "require_permission";
var RequirePermission = function (module, action) { return (0, common_1.SetMetadata)(exports.REQUIRE_PERMISSION_KEY, { module: module, action: action }); };
exports.RequirePermission = RequirePermission;
