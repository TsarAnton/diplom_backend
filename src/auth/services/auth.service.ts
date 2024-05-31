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
      id: user.id,
      login: user.login,
      roles: (await this.userService.readUserRoles(user.id)).map(role => ({
          id: role.id,
          name: role.name
        })
      ),
    }
    return result;
  }

  async login(user: any) {
    const payload = {
      id: user.id,
      login: user.login,
      roles: user.roles,
    };
    return {
        access_token: this.JwtService.sign(payload),
    };
  }
}
