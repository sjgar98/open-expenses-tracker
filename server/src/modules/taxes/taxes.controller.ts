import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { TaxesService } from './taxes.service';
import { Tax } from 'src/entities/tax.entity';
import { TaxDto } from 'src/dto/tax.dto';
import { LoggedUser } from 'src/entities/user.entity';

@Controller('taxes')
@UseGuards(ProtectedAuthGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  async getUserTaxes(@Request() req): Promise<Tax[]> {
    const user: LoggedUser = req.user;
    return this.taxesService.getUserTaxes(user);
  }

  @Get(':taxUuid')
  async getUserTaxByUuid(@Request() req, @Param('taxUuid') taxUuid: string): Promise<Tax> {
    const user: LoggedUser = req.user;
    return this.taxesService.getUserTaxByUuid(user, taxUuid);
  }

  @Post()
  async createUserTax(@Request() req, @Body() taxDto: TaxDto): Promise<Tax> {
    const user: LoggedUser = req.user;
    return this.taxesService.createUserTax(user, taxDto);
  }

  @Put(':taxUuid')
  async updateUserTax(@Request() req, @Param('taxUuid') taxUuid: string, @Body() taxDto: TaxDto): Promise<Tax> {
    const user: LoggedUser = req.user;
    return this.taxesService.updateUserTax(user, taxUuid, taxDto);
  }

  @Delete(':taxUuid')
  async deleteUserTax(@Request() req, @Param('taxUuid') taxUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.taxesService.deleteUserTax(user, taxUuid);
  }

  @Patch(':taxUuid/restore')
  async restoreUserTax(@Request() req, @Param('taxUuid') taxUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.taxesService.restoreUserTax(user, taxUuid);
  }
}

