import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker/locale/fr';
import { Category } from '../../../categories/category.entity';

define(Category, () => {
  const category = new Category();
  category.name = faker.commerce.productName();
  category.created_at = new Date();
  category.updated_at = new Date();
  return category;
});
