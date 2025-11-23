/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { BetterAuthWithPlugins } from './auth/auth.types';
import { mergeBetterAuthSchema } from './common/common.utils';
import { AppConfig } from './config/app.config';
import { merge } from 'lodash';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const getPrettyClassValidatorErrors = (
          validationErrors: ValidationError[],
          parentProperty = '',
        ): Array<{ [property: string]: { _errors: string[] } }> => {
          const errors: Array<{ [property: string]: { _errors: string[] } }> =
            [];

          const getValidationErrorsRecursively = (
            validationErrors: ValidationError[],
            parentProperty = '',
          ) => {
            for (const error of validationErrors) {
              const propertyPath = parentProperty
                ? `${parentProperty}.${error.property}`
                : error.property;

              if (error.constraints) {
                errors.push({
                  [propertyPath]: {
                    _errors: Object.values(error.constraints),
                  },
                });
              }

              if (error.children?.length) {
                getValidationErrorsRecursively(error.children, propertyPath);
              }
            }
          };

          getValidationErrorsRecursively(validationErrors, parentProperty);

          return errors;
        };

        const errors = getPrettyClassValidatorErrors(validationErrors);

        return new BadRequestException({
          message: 'validation error',
          errors: errors.reduce((acc, curr) => merge(acc, curr), {}),
        });
      },
    }),
  );
  const appConfig = app.get(AppConfig);
  const authService: AuthService<BetterAuthWithPlugins> = app.get(AuthService);

  // Set up swagger docs
  const betterAuthOpenAPISchema = await authService.api.generateOpenAPISchema({
    path: '/api/auth',
  });

  const config = new DocumentBuilder()
    .setTitle('Cancer AI Screening API')
    .setDescription('The Hive API Documentation')
    .setVersion('1.0')
    .build();

  // Create the main Hive document
  const hiveDocument = SwaggerModule.createDocument(app, config);

  // Merge Better Auth paths and components into Hive document
  const mergedDocument = mergeBetterAuthSchema(
    hiveDocument,
    betterAuthOpenAPISchema,
  );

  // Setup Swagger with merged documentation
  SwaggerModule.setup('api', app, mergedDocument);

  app.use('/api-doc', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!doctype html>
          <html>
            <head>
              <title>Scalar API Reference</title>
              <meta charset="utf-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1" />
            </head>
            <body>
              <!-- Need a Custom Header? Check out this example: https://codepen.io/scalarorg/pen/VwOXqam -->
              <!-- Note: We're using our public proxy to avoid CORS issues. You can remove the \`data-proxy-url\` attribute if you don’t need it. -->
              <script
                id="api-reference"
                data-url="/api-json"></script>

              <!-- Optional: You can set a full configuration object like this: -->
              <script>
                var configuration = {
                  theme: 'purple',
                }

                document.getElementById('api-reference').dataset.configuration =
                  JSON.stringify(configuration)
              </script>

              <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
            </body>
          </html>`);
    res.end();
  });

  await app.listen(appConfig.port);
  logger.log(`Server is running on port ${appConfig.port}`);
  logger.log(`Server URL: ${appConfig.betterAuthUrl}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
