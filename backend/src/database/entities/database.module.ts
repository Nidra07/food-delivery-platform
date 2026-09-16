import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
