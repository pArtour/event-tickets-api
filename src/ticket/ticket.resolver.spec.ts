import { Test, TestingModule } from '@nestjs/testing';
import { TicketResolver } from './ticket.resolver';

describe('TicketResolver', () => {
  let resolver: TicketResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketResolver],
    }).compile();

    resolver = module.get<TicketResolver>(TicketResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
