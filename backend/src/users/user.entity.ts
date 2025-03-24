import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer'; // Import to exclude sensitive fields
import { Invoice } from '../invoices/invoice.entity';
import { Cart } from '../cart/cart.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true, length: 255 })
  homeAddress: string;

  @Column({ nullable: true, length: 255 })
  billingAddress: string;

  @Column({ nullable: true, length: 20 })
  zipCode: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true, length: 15 })
  phoneNumber: string; // Add this line

  @OneToMany(() => Invoice, invoice => invoice.user)
  invoices: Invoice[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Exclude()
  @Column({ nullable: true })
  resetToken: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry: Date;
}
