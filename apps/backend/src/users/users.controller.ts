import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";
import { CreateUserDto, UpdateUserDto } from "../shared";

// إدارة حسابات الموظفين — صلاحية "settings" متاحة عمليًا للأدمن فقط
@Controller("api/users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission("settings", "READ")
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermission("settings", "CREATE")
  async create(@Body() dto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(dto, req.user);
  }

  @Patch(":id")
  @RequirePermission("settings", "UPDATE")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    return this.usersService.update(id, dto, req.user);
  }

  @Delete(":id")
  @RequirePermission("settings", "DELETE")
  async deactivate(@Param("id") id: string, @Req() req: any) {
    return this.usersService.deactivate(id, req.user);
  }
}
