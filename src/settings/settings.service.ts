import { Injectable } from "@nestjs/common"
import { Repository } from "typeorm"
import { CompanySetting } from "./entities/company-setting.entity"
import { UpdateCompanySettingDto } from "./dto/update-company-setting.dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(CompanySetting) private companySettingsRepository: Repository<CompanySetting>) {}

  async getCompanySettings(): Promise<CompanySetting> {
    let settings = await this.companySettingsRepository.findOne({ where: {} })

    if (!settings) {
      // Create default settings if none exist
      settings = this.companySettingsRepository.create({
        companyName: "My POS System",
        currency: "USD",
        currencySymbol: "$",
        defaultTaxRate: 0,
      })
      settings = await this.companySettingsRepository.save(settings)
    }

    return settings
  }

  async updateCompanySettings(updateDto: UpdateCompanySettingDto): Promise<CompanySetting> {
    const settings = await this.getCompanySettings()
    Object.assign(settings, updateDto)
    return this.companySettingsRepository.save(settings)
  }
}
