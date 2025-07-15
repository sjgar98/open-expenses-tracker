import { IsAlphanumeric, IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class SignInDto {
  @IsAlphanumeric(undefined, { message: 'login.errors.invalidCredentials' })
  username: string;

  password: string;
}

export class SignUpDto {
  @IsAlphanumeric(undefined, { message: 'register.errors.passwordComposition' })
  username: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'register.errors.passwordComposition' }
  )
  password: string;

  @IsOptional()
  @IsEmail(undefined, { message: 'register.errors.emailInvalid' })
  email?: string;
}
