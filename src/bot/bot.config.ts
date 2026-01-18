import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class BotConfig {
  @Value('BOT_BASE_URL', { default: 'http://localhost:8000' })
  baseUrl: string;
}
