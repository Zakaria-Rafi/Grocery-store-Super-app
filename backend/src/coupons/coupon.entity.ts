import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['PERCENTAGE', 'FIXED'] })
  discountType: 'PERCENTAGE' | 'FIXED';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ default: false })
  isGlobal: boolean;

  @Column({ type: 'int', default: 1 })
  usageLimit: number;

  @Column({ type: 'timestamp', nullable: false })
  expiryDate: Date;


  @ManyToMany(() => Product, { nullable: true })
  @JoinTable()
  products: Product[];

  @ManyToMany(() => User, { nullable: true })
  @JoinTable()
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
