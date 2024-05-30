import { Injectable } from '@nestjs/common';
import { UserService } from 'src/core/services/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
      private JwtService: JwtService,
      private userService: UserService,
    ) {}

  async validateUser(login: string, password: string): Promise<any> {
    const user = await this.userService.readOne({ login: login, password: password});
    if(user === null) {
      return null;
    }

    const result = {
      login: user.login,
      roles: (await this.userService.readUserRoles(user.id)).map(role => role.name),
    }
    return result;
  }

  async login(user: any) {
    const payload = {
        login: user.login,
        roles: user.roles,
    };
    return {
        access_token: this.JwtService.sign(payload),
    };
  }
}
