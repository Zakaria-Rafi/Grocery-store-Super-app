import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker/locale/fr';
import { User } from '../../../users/user.entity';

define(User, () => {
  const user = new User();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = `${firstName}.${lastName}@example.com`;
  user.password = 'password';
  user.role = Math.random() > 0.5 ? 'admin' : 'user';
  user.billingAddress = faker.location.streetAddress();
  user.homeAddress = faker.location.streetAddress();
  user.zipCode = faker.location.zipCode();
  user.phoneNumber = faker.phone.number();
  user.country = faker.location.country();
  user.created_at = new Date();
  user.updated_at = new Date();
  return user;
});
