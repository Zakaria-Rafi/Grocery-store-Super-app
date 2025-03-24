import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';
import { Coupon } from '../coupons/coupon.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceProduct } from './invoice-product.entity';
import { Invoice } from './invoice.entity';
import { RefundItem } from './RefundItem.entity';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';
@Injectable()
export class InvoicesService {
  jwtService: any;
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InvoiceProduct)
    private readonly invoiceProductRepository: Repository<InvoiceProduct>,
    @InjectRepository(RefundItem)
    private refundItemRepository: Repository<RefundItem>,
    private readonly stripeService: StripeService,
    private readonly paypalService: PayPalService,
  ) {}
  // get all invoices
  async getAllInvoices(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      relations: ['user', 'products', 'products.product'],
    });
  }
  // get invoice by ID
  async getInvoiceById(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['user', 'products', 'products.product', 'coupon'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }
  //* create invoice
  async createInvoice(
    userId: number,
    products: { productId: number; quantity: number }[],
    status: string,
    totalPrice: number,
    coupon: Coupon,
    paimentmethod: string,
    paymentIntentId?: string,
  ): Promise<Invoice> {
    if (!Array.isArray(products)) {
      throw new BadRequestException(
        'Invalid products format. Expected an array.',
      );
    }
    // check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    // create invoice
    const invoice = this.invoiceRepository.create({
      user,
      status,
      amount: totalPrice,
      orderNumber,
      coupon,
      paimentmethod,
    });

    if (paymentIntentId) {
      invoice.PaymentIntentId = paymentIntentId;
    }
    const savedInvoice = await this.invoiceRepository.save(invoice);
    // create invoice products
    for (const { productId, quantity } of products) {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const invoiceProduct = this.invoiceProductRepository.create({
        invoice: savedInvoice,
        product,
        quantity,
        price: product.price,
      });

      await this.invoiceProductRepository.save(invoiceProduct);
    }

    return savedInvoice;
  }
  // Create a manual invoice
  async createInvoiceManual(
    userId: number,
    products: { productId: number; quantity: number }[],
    status: string,
  ): Promise<Invoice> {
    if (!Array.isArray(products)) {
      throw new BadRequestException(
        'Invalid products format. Expected an array.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let amount = 0;
    const productEntities = await Promise.all(
      products.map(async (product) => {
        const productEntity = await this.productRepository.findOne({
          where: { id: product.productId },
        });
        if (!productEntity) {
          throw new NotFoundException(
            `Product with ID ${product.productId} not found`,
          );
        }
        amount += productEntity.price * product.quantity;
        return {
          product: productEntity,
          quantity: product.quantity,
        };
      }),
    );

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // create invoice
    const invoice = await this.invoiceRepository.save(
      this.invoiceRepository.create({
        user,
        status,
        amount,
        orderNumber,
      }),
    );
    // create invoice products
    await Promise.all(
      productEntities.map(async ({ product, quantity }) => {
        return this.invoiceProductRepository.save(
          this.invoiceProductRepository.create({
            invoice,
            product,
            quantity,
            price: product.price,
          }),
        );
      }),
    );

    return (await this.invoiceRepository.findOne({
      where: { id: invoice.id },
      relations: ['products', 'user'],
    })) as Invoice;
  }

  async updateInvoice(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['user', 'products', 'products.product'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // udpate products
    if (updateInvoiceDto.products) {
      // remove existing products
      await this.invoiceProductRepository.delete({ invoice: { id } });

      // create new products
      const newProducts = await Promise.all(
        updateInvoiceDto.products.map(async (productData) => {
          const product = await this.productRepository.findOne({
            where: { id: productData.productId },
          });
          // check if product exists
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${productData.productId} not found`,
            );
          }
          // create invoice product
          const invoiceProduct = this.invoiceProductRepository.create({
            invoice: invoice, // Passer l'objet invoice complet
            product: product,
            quantity: productData.quantity,
            price: product.price,
          });

          return this.invoiceProductRepository.save(invoiceProduct);
        }),
      );

      // udpate invoice products
      invoice.products = newProducts;
    }

    // update invoice data
    if (updateInvoiceDto.status) {
      invoice.status = updateInvoiceDto.status;
    }
    if (updateInvoiceDto.created_at) {
      invoice.created_at = new Date(updateInvoiceDto.created_at);
    }
    if (updateInvoiceDto.amount) {
      invoice.amount = updateInvoiceDto.amount;
    }

    // save invoice changes to the database
    return this.invoiceRepository.save(invoice);
  }

  // delete invoice by ID
  async deleteInvoice(id: number): Promise<void> {
    const result = await this.invoiceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }
  // get invoices by user
  async getInvoicesByUser(userId: number): Promise<Invoice[]> {
    try {
      return this.invoiceRepository.find({ where: { user: { id: userId } } });
    } catch {
      throw new UnauthorizedException('Invalid user ID');
    }
  }
  // generate invoice PDF
  async generateInvoicePDF(
    id: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    // get invoice by ID and include user and products
    const invoice = await this.getInvoiceById(id);
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: `Facture ${invoice.orderNumber}`,
        Author: 'Trinity Shop',
      },
    });
    // create buffer array
    const buffers: Buffer[] = [];
  
    doc.on('data', buffers.push.bind(buffers));
  
    doc.font('Helvetica-Bold');
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();
  
    doc.font('Helvetica');
    doc.fontSize(12);
    // invoice details order number and date
    doc.text(`Numéro de facture: ${invoice.orderNumber}`);
    doc.text(
      `Date: ${new Date(invoice.created_at).toLocaleDateString('fr-FR')}`,
    );
    doc.moveDown();
  
    doc.font('Helvetica-Bold');
    doc.text('Client:');
    doc.font('Helvetica');
    doc.text(`${invoice.user.firstName} ${invoice.user.lastName}`);
    doc.text(`Email: ${invoice.user.email}`);
    doc.moveDown();
  
    doc.font('Helvetica-Bold');
    // invoice products table
    doc.text('Produits:', { underline: true });
    doc.moveDown(0.5);
  
    const tableStartX = 50;
    let currentY = doc.y;
  
    doc
      .lineWidth(1)
      .moveTo(tableStartX, currentY - 5)
      .lineTo(550, currentY - 5)
      .stroke();
  
    // table headers product name, quantity, unit price, total
    doc.text('Produit', tableStartX, currentY);
    doc.text('Quantité', 250, currentY);
    doc.text('Prix unitaire', 350, currentY);
    doc.text('Total', 450, currentY);
  
    doc
      .lineWidth(1)
      .moveTo(tableStartX, currentY + 15)
      .lineTo(550, currentY + 15)
      .stroke();
  
    currentY += 20;
    // loop through invoice products and add to table
    doc.font('Helvetica');
    let totalTTC = 0;
    invoice.products.forEach((item) => {
      doc.text(item.product.name, tableStartX, currentY);
      doc.text(item.quantity.toString(), 250, currentY);
      doc.text(`${Number(item.product.price).toFixed(2)} €`, 350, currentY);
      const total = Number(item.product.price) * item.quantity;
      doc.text(`${total.toFixed(2)} €`, 450, currentY);
      totalTTC += total;
      currentY += 20;
    });
  
    doc
      .lineWidth(1)
      .moveTo(tableStartX, currentY + 15)
      .lineTo(550, currentY + 15)
      .stroke();
  
    currentY += 20;
    doc.font('Helvetica-Bold');
    doc.text('Total TTC:', tableStartX, currentY);
    doc.text(`${totalTTC.toFixed(2).replace('.', ',')} €`, 450, currentY);
  
    doc.end();
    // return buffer and filename
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () =>
        resolve({
          buffer: Buffer.concat(chunks),
          filename: `facture_${invoice.orderNumber}.pdf`,
        }),
      );
    });
  }
  

  
  
  
  // Fully refund an invoice
  async processFullRefund(invoiceId: number, reason?: string): Promise<Invoice> {
    // get invoice by ID and include products
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['products', 'products.product'],
    });
    // check if invoice exists
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'REFUNDED')
      throw new BadRequestException('Already refunded');

    let refundId: string;
    // process refund based on payment method
    switch (invoice.paimentmethod) {
      case 'STRIPE':
        const { refundId: stripeRefundId } =
          await this.stripeService.createRefund(
            invoice.PaymentIntentId,
            invoice.amount,
          );
        refundId = stripeRefundId;
        break;
      case 'PAYPAL':
        refundId = await this.paypalService.createRefund(
          invoice.PaymentIntentId,
          invoice.amount,
        );
        break;
      case 'CASH':
        refundId = `CASH-${Date.now()}`;
        break;
    }
    // create refund item
    const refundItem = this.refundItemRepository.create({
      invoice,
      amount: invoice.amount,
      paymentMethod: invoice.paimentmethod,
      refundId,
      reason,
    });
    // save refund item
    await this.refundItemRepository.save(refundItem);

    // Update stock
    for (const item of invoice.products) {
      await this.productRepository.increment(
        { id: item.product.id },
        'stock',
        item.quantity,
      );
    }
    // update invoice status and refunded amount
    invoice.status = 'REFUNDED';
    invoice.refundedAmount = invoice.amount;
    // save invoice
    return this.invoiceRepository.save(invoice);
  }
  // Partially refund an invoice
  async processPartialRefund(invoiceId: number, items: any[], reason?: string): Promise<Invoice> {
    // get invoice by ID and include products
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['products', 'products.product'],
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'REFUNDED') throw new BadRequestException('Already refunded');
    // calculate refund amount
    const refundAmount = this.calculatePartialRefundAmount(invoice, items);
    let refundId: string;

    switch (invoice.paimentmethod) {
      case 'STRIPE':
        const { refundId: stripeRefundId } =
          await this.stripeService.createRefund(
            invoice.PaymentIntentId,
            refundAmount,
          );
        refundId = stripeRefundId;
        break;
      case 'PAYPAL':
        refundId = await this.paypalService.createRefund(
          invoice.PaymentIntentId,
          refundAmount,
        );
        break;
      case 'CASH':
        refundId = `CASH-${Date.now()}`;
        break;
    }

    const refundItem = this.refundItemRepository.create({
      invoice,
      amount: refundAmount,
      paymentMethod: invoice.paimentmethod,
      refundId,
      reason,
    });

    await this.refundItemRepository.save(refundItem);

    // Update stock for refunded items
    for (const item of items) {
      await this.productRepository.increment(
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }

    invoice.status = 'PARTIALLY_REFUNDED';
    invoice.refundedAmount = (invoice.refundedAmount || 0) + refundAmount;
    return this.invoiceRepository.save(invoice);
  }

  private calculatePartialRefundAmount(invoice: Invoice, items: any[]): number {
    let total = 0;
    for (const item of items) {
      const invoiceProduct = invoice.products.find(
        (p) => p.product.id === item.productId,
      );
      if (!invoiceProduct)
        throw new BadRequestException(
          `Product ${item.productId} not found in invoice`,
        );
      if (item.quantity > invoiceProduct.quantity) {
        throw new BadRequestException(
          `Cannot refund more than purchased quantity`,
        );
      }
      total += invoiceProduct.price * item.quantity;
    }
    return total;
  }
}
