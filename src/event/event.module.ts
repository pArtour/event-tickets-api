import { Module } from '@nestjs/common';
import { EventService } from 'src/event/event.service';
import { EventResolver } from 'src/event/event.resolver';

@Module({
  providers: [EventService, EventResolver],
  controllers: [],
})
export class EventModule {}
