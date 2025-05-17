import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { jwtModule } from './modules.config';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    jwtModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './.tmp/db',
      synchronize: true,
      logging: true,
      entities: [User, Task],
    }),
    TasksModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
  exports: [ConfigModule],
})
export class AppModule {}
