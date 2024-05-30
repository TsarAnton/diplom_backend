import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CoreModule } from 'src/core/core.module';
import { config as dotenvConfig } from 'dotenv';
import { UserService } from 'src/core/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/entities/user.entity';
import { Role } from 'src/core/entities/role.entity';
import { RoleService } from 'src/core/services/role.service';
import { UserRole } from 'src/core/entities/user-role.entity';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    PassportModule,
    //CoreModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRED },
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRole,
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    LocalStrategy, 
    JwtStrategy, 
    UserService, 
    RoleService
  ],
  exports: [AuthService],
})
export class AuthModule {}

