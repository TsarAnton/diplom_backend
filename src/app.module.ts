import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule,
    AuthModule, 
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
