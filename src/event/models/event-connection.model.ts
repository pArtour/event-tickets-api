import Paginated from 'src/common/pagination/pagination';
import { ObjectType } from '@nestjs/graphql';
import { Event } from 'src/event/models/event.model';

@ObjectType()
export class EventConnection extends Paginated(Event) {}
