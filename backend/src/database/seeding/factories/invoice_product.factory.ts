// src/database/factories/invoice.factory.ts
import { define, factory } from 'typeorm-seeding';
import { faker } from '@faker-js/faker/locale/fr';
import { InvoiceProduct } from '../../../invoices/invoice-product.entity';
import { Invoice } from '../../../invoices/invoice.entity';
import { Product } from '../../../products/product.entity';

define(InvoiceProduct, () => {
  const invoiceProduct = new InvoiceProduct();
  invoiceProduct.quantity = faker.number.int({ min: 1, max: 100 });
  invoiceProduct.invoice = factory(Invoice)() as any;
  invoiceProduct.product = factory(Product)() as any;
  invoiceProduct.price = faker.number.int({ min: 1, max: 100 });
  return invoiceProduct;
});
