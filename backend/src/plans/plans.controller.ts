import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly service: PlansService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly plansService: PlansService) {}

  @Get('me')
  getMySubscription(@Request() req: { user: { id: string } }) {
    return this.plansService.getSubscriptionByUser(req.user.id);
  }

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { planId: string; endDate?: string },
  ) {
    return this.plansService.createSubscription(req.user.id, body.planId, body.endDate ?? null);
  }
}
