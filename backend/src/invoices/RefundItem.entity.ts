import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class RefundItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, invoice => invoice.refunds)
  invoice: Invoice;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column()
  refundId: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}