import { faker } from '@faker-js/faker/locale/fr';
import { Product } from '../../../products/product.entity';
import { define, factory } from 'typeorm-seeding';
import { Category } from '../../../categories/category.entity';

define(Product, () => {
  const product = new Product();
  product.name = faker.commerce.productName();
  product.description = faker.commerce.productDescription();
  let barcode = '';
  for (let i = 0; i < 12; i++) {
    barcode += faker.string.numeric();
  }
  product.barcode = barcode;
  product.brand = faker.company.name();
  product.ingredients = faker.lorem.words(3);
  product.allergens = faker.lorem.words(3);
  product.deleted = faker.datatype.boolean();
  const categories = [];
  for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
    categories.push(factory(Category)() as any);
  }
  product.categories = categories;
  const price = faker.number.float({ min: 0, max: 200, fractionDigits: 2 });
  product.price = price;
  product.priceBeforeTax = price - price * 0.2;
  product.stock = faker.number.int({ min: 0, max: 1000 });
  product.taxRate = 0.2;
  product.imagesUrl = [faker.image.url(), faker.image.url()];
  product.nutritionalValues = faker.lorem.words(3);
  product.created_at = new Date();
  product.updated_at = new Date();
  return product;
});
