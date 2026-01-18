import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class PrismaConfig {
  @Value('DATABASE_URL')
  databaseUrl: string;
}
