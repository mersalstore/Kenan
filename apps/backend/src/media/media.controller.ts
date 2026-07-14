import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MediaService } from "./media.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";

@Controller("api/media")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload/:projectId")
  @RequirePermission("media", "CREATE")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @Param("projectId") projectId: string,
    @UploadedFile() file: any,
  ) {
    const url = await this.mediaService.uploadFile(projectId, file);
    return { url };
  }
}
