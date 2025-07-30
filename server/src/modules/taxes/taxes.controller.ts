import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { TaxesService } from './taxes.service';
import { Tax } from 'src/entities/tax.entity';
import { TaxDto } from 'src/dto/tax.dto';

@Controller('taxes')
@UseGuards(ProtectedAuthGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  async getUserTaxes(@Request() req): Promise<Tax[]> {
    const userUuid: string = req.user.uuid;
    return this.taxesService.getUserTaxes(userUuid);
  }

  @Get(':taxUuid')
  async getUserTaxByUuid(@Request() req, @Param('taxUuid') taxUuid: string): Promise<Tax> {
    const userUuid: string = req.user.uuid;
    return this.taxesService.getUserTaxByUuid(userUuid, taxUuid);
  }

  @Post()
  async createUserTax(@Request() req, @Body() taxDto: TaxDto): Promise<Tax> {
    const userUuid: string = req.user.uuid;
    return this.taxesService.createUserTax(userUuid, taxDto);
  }

  @Put(':taxUuid')
  async updateUserTax(@Request() req, @Param('taxUuid') taxUuid: string, @Body() taxDto: TaxDto): Promise<Tax> {
    const userUuid: string = req.user.uuid;
    return this.taxesService.updateUserTax(userUuid, taxUuid, taxDto);
  }

  @Delete(':taxUuid')
  async deleteUserTax(@Request() req, @Param('taxUuid') taxUuid: string): Promise<void> {
    const userUuid: string = req.user.uuid;
    return this.taxesService.deleteUserTax(userUuid, taxUuid);
  }
}

