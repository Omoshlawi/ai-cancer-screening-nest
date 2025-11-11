import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class AppConfig {
  @Value('PORT', { parse: parseInt, default: 6000 })
  port: number;
  @Value('BETTER_AUTH_URL', { default: 'http://localhost:6000' })
  betterAuthUrl: string;
}
