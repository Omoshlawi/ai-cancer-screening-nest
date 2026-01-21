import { Module } from '@nestjs/common';
import { FollowUpController } from './follow-up.controller';
import { FollowUpService } from './follow-up.service';
import { FollowUpOutreachActionService } from './follow-up.outreach.service';

@Module({
  controllers: [FollowUpController],
  providers: [FollowUpService, FollowUpOutreachActionService],
})
export class FollowUpModule {}
