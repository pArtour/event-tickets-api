import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent() {}

  async updateEvent() {}

  async deleteEvent() {}

  async getEvent() {}

  async getEvents() {
    return this.prisma.event.findMany();
  }
}
