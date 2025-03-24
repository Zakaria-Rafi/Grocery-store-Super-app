import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../products/product.entity';
// entity for invoice products link table
@Entity()
export class InvoiceProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.products, { nullable: false, onDelete: 'CASCADE' })
  invoice: Invoice;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
