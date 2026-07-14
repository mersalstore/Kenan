import { SetMetadata } from "@nestjs/common";

export interface PermissionRequirement {
  module: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE";
}

export const REQUIRE_PERMISSION_KEY = "require_permission";
export const RequirePermission = (
  module: string,
  action: "CREATE" | "READ" | "UPDATE" | "DELETE",
) => SetMetadata(REQUIRE_PERMISSION_KEY, { module, action });
