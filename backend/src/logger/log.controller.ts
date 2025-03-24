import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Controller('logs')
export class LogController {
  constructor(private readonly esService: ElasticsearchService) {}

  @Post()
  async createLog(@Body() logData: any) {
    return this.esService.index(logData);
  }

  @Get()
  async getLogs(
    @Query('level') level: string,
    @Query('from') from: number,
    @Query('size') size: number,
  ) {
    if (level) {
      return this.esService.search({
        index: 'logs',
        body: {
          query: {
            match: {
              level: level,
            },
          },
        },
      });
    }

    return this.esService.search({
      index: 'logs',
      body: {
        from: from || 0,
        size: size || 10,
        sort: [{ timestamp: { order: 'desc' } }],
      },
    });
  }

  @Get('date-range')
  async getLogsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('from') from: number,
    @Query('size') size: number,
  ) {
    return this.esService.search({
      index: 'logs',
      body: {
        from: from || 0,
        size: size || 10,
        query: {
          range: {
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });
  }
}
