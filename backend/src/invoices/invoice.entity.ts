import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { InvoiceProduct } from './invoice-product.entity';
import { Coupon } from '../coupons/coupon.entity';
import { RefundItem } from './RefundItem.entity';
@Entity()
// Invoice entity class
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.invoices)
  user: User;
  
  @Column({ unique: true })
  orderNumber: string;

  @Column({ 
    type: 'enum', 
    enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'PENDING'
  })
  status: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @OneToMany(() => InvoiceProduct, (invoiceProduct) => invoiceProduct.invoice, { eager: true })
  products: InvoiceProduct[];

  @ManyToOne(() => Coupon, { nullable: true })
  coupon: Coupon;

  @Column({ nullable: true })
  paimentmethod: string;


  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundedAmount: number;
  

  @OneToMany(() => RefundItem, refundItem => refundItem.invoice)
  refunds: RefundItem[];
  
  @Column({ nullable: true })
  PaymentIntentId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
