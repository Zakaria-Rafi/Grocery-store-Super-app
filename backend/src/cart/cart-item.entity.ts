import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../products/product.entity';

@Entity()
// cart item entity
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceBeforeDiscount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  couponDiscountPer: number;

  @Column({ nullable: true })
  appliedCouponCode: string;
}
