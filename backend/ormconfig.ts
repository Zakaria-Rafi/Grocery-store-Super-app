import { User } from './src/users/user.entity';

export default {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Automatically load entities 
  //  "barcode": "1234567890123"

  synchronize: process.env.NODE_ENV === 'development',
  seeds: ['src/database/seeding/seeds/**/*{.ts,.js}'],
  factories: ['src/database/seeding/factories/**/*{.ts,.js}'],
};