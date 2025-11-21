import { DynamicModule, Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';

type CommonModuleOptions = {
  global?: boolean;
};
@Module({})
export class CommonModule {
  static register(options: CommonModuleOptions = {}): DynamicModule {
    return {
      global: options.global,
      module: CommonModule,
      providers: [PaginationService],
      exports: [PaginationService],
    };
  }
}
