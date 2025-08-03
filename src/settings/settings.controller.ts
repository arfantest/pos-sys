import { Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { SettingsService } from "./settings.service"
import type { UpdateCompanySettingDto } from "./dto/update-company-setting.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@ApiTags("settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("company")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Get company settings" })
  getCompanySettings() {
    return this.settingsService.getCompanySettings()
  }

  @Patch("company")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update company settings" })
  updateCompanySettings(updateDto: UpdateCompanySettingDto) {
    return this.settingsService.updateCompanySettings(updateDto)
  }
}
