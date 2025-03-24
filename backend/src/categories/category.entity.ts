import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
  } from 'typeorm';
  import { Product } from '../products/product.entity';
  
  @Entity()
  export class Category {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @ManyToMany(() => Product, (product) => product.categories)
    products: Product[];
  }
  