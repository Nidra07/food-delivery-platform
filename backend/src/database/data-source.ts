import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Role],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
