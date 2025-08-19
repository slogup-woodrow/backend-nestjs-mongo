import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerConstants } from './shared/constants/swagger.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { commonConstants } from './shared/constants/common.constants';
import { ValidationPipe } from '@nestjs/common';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 아무 decorator 도 없는 어떤 property의 object를 거름
      forbidNonWhitelisted: true, // 잘못된 property의 리퀘스트 자체를 막음
      transform: true,
    }),
  );

  /**
   * Swagger
   */
  if (process.env.NODE_ENV !== commonConstants.props.nodeEnvs.LOCAL) {
    // local 외의 환경변수에서는 Basic authentication 설정
    app.use(
      [swaggerConstants.props.SWAGGER_PATH],
      basicAuth({
        challenge: true,
        users: {
          [swaggerConstants.props.SWAGGER_USER]:
            swaggerConstants.props.SWAGGER_PASSWORD,
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle(swaggerConstants.props.SWAGGER_TITLE)
    .setDescription(swaggerConstants.props.SWAGGER_DESCRIPTION)
    .setVersion(swaggerConstants.props.SWAGGER_VERSION)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'jwt' },
      swaggerConstants.auth.BEARER_TOKEN,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConstants.props.SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 웹(swagger)에서 새로고침을 해도 authorization(token) 유지
      // docExpansion: 'none', // 모든 태그가 닫힌 상태로 swagger 페이지 오픈
      tagsSorter: 'alpha', // 태그를 정렬합니다.
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
