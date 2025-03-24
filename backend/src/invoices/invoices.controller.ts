import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateInvoiceManualDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './invoice.entity';
import { InvoicesService } from './invoices.service';
import { FullRefundDto,PartialRefundDto } from './dto/RefundDto.dto';
@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all invoices (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all invoices',
    type: [Invoice],
  })
  // Get all invoices (admin only)
  getAllInvoices() {
    return this.invoicesService.getAllInvoices();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get invoices for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of invoices for the user',
    type: [Invoice],
  })
  // Get invoices for the authenticated user 
  async getInvoicesByUser(@Req() req) {
    return this.invoicesService.getInvoicesByUser(req.user.id);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get an invoice by ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Details of the invoice',
    type: Invoice,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the invoice' })
  // Get an invoice by ID (admin only)
  getInvoiceById(@Param('id') id: number) {
    return this.invoicesService.getInvoiceById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new invoice manually (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Invoice successfully created',
    type: Invoice,
  })
  @ApiBody({
    type: CreateInvoiceManualDto,
    description: 'Details of the invoice to create',
  })
  // Create a new invoice manually (admin only)
  async createInvoiceManual(
    @Body() createInvoiceManualDto: CreateInvoiceManualDto,
  ): Promise<Invoice> {
    const { userId, products, status } = createInvoiceManualDto;
    return this.invoicesService.createInvoiceManual(userId, products, status);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update an invoice completely (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Invoice successfully updated',
    type: Invoice,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the invoice to update',
  })
  @ApiBody({
    type: UpdateInvoiceDto,
    description: 'Details to update the invoice',
  })
  // Update an invoice completely (admin only)
  updateInvoice(
    @Param('id') id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(id, updateInvoiceDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Partially update an invoice (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Invoice successfully updated',
    type: Invoice,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the invoice to partially update',
  })
  @ApiBody({
    type: UpdateInvoiceDto,
    description: 'Partial update details for the invoice',
  })
  // Partially update an invoice (admin only)
  partialUpdateInvoice(
    @Param('id') id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an invoice (admin only)' })
  @ApiResponse({ status: 204, description: 'Invoice successfully deleted' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the invoice to delete',
  })
  // Delete an invoice (admin only)
  deleteInvoice(@Param('id') id: number) {
    return this.invoicesService.deleteInvoice(id);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiResponse({ status: 200, description: 'PDF file of the invoice' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the invoice' })
  @Header('Content-Type', 'application/pdf')
  // Download invoice PDF 
  async getInvoicePDF(@Param('id') id: string, @Res() res: Response) {
    try {
      // Generate the PDF file
      const { buffer, filename } =
        await this.invoicesService.generateInvoicePDF(Number(id));
      // Set headers for the PDF file
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      });
      // Send the PDF file
      res.send(buffer);
    } catch {
      res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Fully refund an invoice (admin only)' })
  @ApiResponse({ status: 200, description: 'Invoice refunded successfully' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the invoice to refund' })
  @ApiBody({ type: FullRefundDto, description: 'Details for the full refund' })
  // Fully refund an invoice (admin only)
  async refundInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) refundDto: FullRefundDto
  ) {
    try {
      // Process the full refund
      const refundedInvoice = await this.invoicesService.processFullRefund(id, refundDto.reason);
      return {
        success: true,
        message: 'Invoice refunded successfully',
        data: refundedInvoice
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Refund failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/partial-refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Partially refund an invoice (admin only)' })
  @ApiResponse({ status: 200, description: 'Invoice partially refunded successfully' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the invoice to partially refund' })
  @ApiBody({ type: PartialRefundDto, description: 'Details for the partial refund' })
  // Partially refund an invoice (admin
  async partialRefundInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) partialRefundDto: PartialRefundDto
  ) {
    try {
      // Process the partial refund
      const refundedInvoice = await this.invoicesService.processPartialRefund(
        id,
        partialRefundDto.items,
        partialRefundDto.reason
      );
      return {
        success: true,
        message: 'Invoice partially refunded successfully',
        data: refundedInvoice
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Partial refund failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
}
