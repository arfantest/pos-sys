import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SettingsService } from "./settings.service"
import { SettingsController } from "./settings.controller"
import { CompanySetting } from "./entities/company-setting.entity"

@Module({
  imports: [TypeOrmModule.forFeature([CompanySetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
