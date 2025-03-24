import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { InvoiceProduct } from '../invoices/invoice-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceBeforeTax: number | null;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ unique: true })
  barcode: string;

  @Column({ type: 'json', nullable: true })
  imagesUrl: string[];

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  ingredients: string;

  @Column({ nullable: true })
  allergens: string;

  @Column({ nullable: true })
  nutritionalValues: string;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Category, (category) => category.products, {
    eager: true,
  })
  @JoinTable()
  categories: Category[];

  @OneToMany(() => InvoiceProduct, (invoiceProduct) => invoiceProduct.product)
  invoices: InvoiceProduct[];
}
