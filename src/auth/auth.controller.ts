import { Controller, Post } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import type { LoginDto } from "./dto/login.dto"
import { Body } from "@nestjs/common"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
