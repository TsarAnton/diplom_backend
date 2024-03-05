import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CoreModule, AuthModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '2003',
    database: 'coursework_db',
    entities: ["./core/entities/*.entity{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
    migrations: ["./migrations/*{.ts,.js"],
    migrationsTableName: "migrate_typeorm",
    migrationsRun: true
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
