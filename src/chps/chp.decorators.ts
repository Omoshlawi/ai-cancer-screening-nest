import { SetMetadata } from '@nestjs/common';
import { REQUIRE_CHP_TOKEN } from './chp.constants';

export const RequireChp = () => SetMetadata(REQUIRE_CHP_TOKEN, true);
