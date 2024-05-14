import { Injectable } from '@nestjs/common';
//import { UserService } from 'src/core/services/user.service';
//import { UserToRoleService } from 'src/core/services/user-to-role.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private JwtService: JwtService//,
    //private userService: UserService,
    //private UserToRoleService: UserToRoleService,
    ) {}

  async validateUser(login: string, password: string): Promise<any> {
    // const user = await this.userService.readByLoginPassword(login, password);
    // if(user === null) {
    //   return null;
    // }
    // const rolesObj = await this.UserToRoleService.readUserRoles(user);
    // const roles = [];
    // for(let i = 0; i < rolesObj.totalRecordsNumber; i++) {
    //     roles.push(rolesObj.entities[i].role.name);
    // }
    // if (user && user.password === password) {
    //   const result = {
    //     login: user.login,
    //     roles: roles,
    //   }
    //   return result;
    // }
    return null;
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
