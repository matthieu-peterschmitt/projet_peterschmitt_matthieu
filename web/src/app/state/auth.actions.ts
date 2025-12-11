import { LoginCredentials, RegisterData } from '../interfaces/user.interface';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public credentials: LoginCredentials) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public data: RegisterData) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class RefreshToken {
  static readonly type = '[Auth] Refresh Token';
  constructor(public refreshToken: string) {}
}

export class SetTokens {
  static readonly type = '[Auth] Set Tokens';
  constructor(
    public accessToken: string,
    public refreshToken: string,
  ) {}
}

export class LoadCurrentUser {
  static readonly type = '[Auth] Load Current User';
}
