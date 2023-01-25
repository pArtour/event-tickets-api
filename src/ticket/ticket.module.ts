import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResolver } from './ticket.resolver';

@Module({
  providers: [TicketService, TicketResolver],
})
export class TicketModule {}
