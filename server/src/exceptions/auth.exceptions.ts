import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('login.errors.invalidCredentials', HttpStatus.UNAUTHORIZED);
  }
}

export class UserNameTakenException extends HttpException {
  constructor() {
    super('register.errors.usernameTaken', HttpStatus.BAD_REQUEST);
  }
}

export class UserEmailTakenException extends HttpException {
  constructor() {
    super('register.errors.emailTaken', HttpStatus.BAD_REQUEST);
  }
}
