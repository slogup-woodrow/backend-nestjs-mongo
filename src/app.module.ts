import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envFilePath from 'envs/env';
import * as Joi from 'joi';
import { commonConstants } from './shared/constants/common.constants';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardModule } from './domain/board/board.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid(...commonConstants.props.NODE_ENV_ARRAY)
          .required(),
        TZ: Joi.string().valid(`Asia/Seoul`).required(),
      }),
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: process.env.MONGO_URI,
        tls: process.env.NODE_ENV !== 'local', // TLS/SSL 암호화 연결
        ...(process.env.NODE_ENV !== 'local'
          ? { tlsCAFile: path.resolve('global-bundle.pem') }
          : {}), //tls 적용시 DocumentDB needs global-bundle.pem 키가 필요하다. 해당 파일의 경로를 의미한다.
        readPreference: 'secondaryPreferred',
        retryWrites: false,
        ...(process.env.NODE_ENV !== 'local' && {
          authMechanism: 'SCRAM-SHA-1',
        }),
      }),
      inject: [ConfigService],
    }),
    BoardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
