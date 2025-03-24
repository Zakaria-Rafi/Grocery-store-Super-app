import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { LogController } from './log.controller';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              winston.format.colorize(),
              winston.format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}`,
              ),
            ),
          }),
          new ElasticsearchTransport({
            level: 'info',
            index: 'logs',
            clientOpts: {
              node: process.env.ELASTICSEARCH_NODE,
              auth: {
                username: process.env.ELASTICSEARCH_USERNAME,
                password: process.env.ELASTICSEARCH_PASSWORD,
              },
            },
          }),
        ],
      }),
    }),
  ],
  controllers: [LogController],
})
export class LoggerModule {}
