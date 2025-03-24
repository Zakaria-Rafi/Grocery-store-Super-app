import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('configuration')
  getConfiguration() {
    let version = 'unknown';
    if (process.env.NODE_ENV === 'production') {
      version = process.env.APP_VERSION || 'unknown';
    } else {
      version = fs.readFileSync('./VERSION', 'utf8').trim();
    }

    const configuration = {
      version,
    };

    return configuration;
  }

  @Get('test-email-send')
  async testEmailSend() {
    return await this.appService.testEmailSend();
  }
}
