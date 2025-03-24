import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateInvoiceManualDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FullRefundDto, PartialRefundDto } from './dto/RefundDto.dto';
import { HttpException } from '@nestjs/common';

describe('InvoicesController', () => {
    let controller: InvoicesController;
    let service: InvoicesService;

    const mockInvoicesService = {
        getAllInvoices: jest.fn(),
        getInvoicesByUser: jest.fn(),
        getInvoiceById: jest.fn(),
        createInvoiceManual: jest.fn(),
        updateInvoice: jest.fn(),
        deleteInvoice: jest.fn(),
        generateInvoicePDF: jest.fn(),
        processFullRefund: jest.fn(),
        processPartialRefund: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InvoicesController],
            providers: [
                {
                    provide: InvoicesService,
                    useValue: mockInvoicesService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<InvoicesController>(InvoicesController);
        service = module.get<InvoicesService>(InvoicesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllInvoices', () => {
        it('should return all invoices', async () => {
            const result = ['invoice1', 'invoice2'];
            jest.spyOn(service, 'getAllInvoices').mockResolvedValue(result as any);
            
            expect(await controller.getAllInvoices()).toBe(result);
        });
    });

    describe('getInvoicesByUser', () => {
        it('should return user invoices', async () => {
            const result = ['invoice1'];
            const req = { user: { id: 1 }};
            jest.spyOn(service, 'getInvoicesByUser').mockResolvedValue(result as any);
            
            expect(await controller.getInvoicesByUser(req)).toBe(result);
        });
    });

    describe('getInvoiceById', () => {
        it('should return single invoice', async () => {
            const result = { id: 1 };
            jest.spyOn(service, 'getInvoiceById').mockResolvedValue(result as any);
            
            expect(await controller.getInvoiceById(1)).toBe(result);
        });
    });

    describe('createInvoiceManual', () => {
        it('should create invoice', async () => {
            const dto: CreateInvoiceManualDto = {
                userId: 1,
                products: [],
                status: 'pending'
            };
            const result = { id: 1, ...dto };
            jest.spyOn(service, 'createInvoiceManual').mockResolvedValue(result as any);
            
            expect(await controller.createInvoiceManual(dto)).toBe(result);
        });
    });

    describe('updateInvoice', () => {
        it('should update invoice', async () => {
            const dto: UpdateInvoiceDto = { status: 'paid' };
            const result = { id: 1, ...dto };
            jest.spyOn(service, 'updateInvoice').mockResolvedValue(result as any);
            
            expect(await controller.updateInvoice(1, dto)).toBe(result);
        });
    });

    describe('deleteInvoice', () => {
        it('should delete invoice', async () => {
            const result = { deleted: true };
            jest.spyOn(service, 'deleteInvoice').mockResolvedValue(result as any);
            
            expect(await controller.deleteInvoice(1)).toBe(result);
        });
    });

    describe('refundInvoice', () => {
        it('should process full refund', async () => {
            const dto: FullRefundDto = { reason: 'test reason' };
            const result = { success: true };
            jest.spyOn(service, 'processFullRefund').mockResolvedValue(result as any);
            
            expect(await controller.refundInvoice(1, dto)).toEqual({
                success: true,
                message: 'Invoice refunded successfully',
                data: result
            });
        });

        it('should handle refund error', async () => {
            const dto: FullRefundDto = { reason: 'test reason' };
            jest.spyOn(service, 'processFullRefund').mockRejectedValue(new Error('Refund failed'));
            
            await expect(controller.refundInvoice(1, dto)).rejects.toThrow(HttpException);
        });
    });

    describe('partialRefundInvoice', () => {
        it('should process partial refund', async () => {
            const dto: PartialRefundDto = { 
                items: [{ productId: 1, quantity: 1 }],
                reason: 'test reason'
            };
            const result = { success: true };
            jest.spyOn(service, 'processPartialRefund').mockResolvedValue(result as any);
            
            expect(await controller.partialRefundInvoice(1, dto)).toEqual({
                success: true,
                message: 'Invoice partially refunded successfully',
                data: result
            });
        });

        it('should handle partial refund error', async () => {
            const dto: PartialRefundDto = {
                items: [{ productId: 1, quantity: 1 }],
                reason: 'test reason'
            };
            jest.spyOn(service, 'processPartialRefund').mockRejectedValue(new Error('Partial refund failed'));
            
            await expect(controller.partialRefundInvoice(1, dto)).rejects.toThrow(HttpException);
        });
    });
});