import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';
import { Coupon } from '../coupons/coupon.entity';
// Cart entity
@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.carts, { nullable: false })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string; // PENDING, PAID, CANCELED

  @ManyToOne(() => Coupon, { nullable: true })
  coupon: Coupon | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
