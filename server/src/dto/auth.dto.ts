import { Equals, IsAlphanumeric, IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsStrongPassword, ValidateIf, } from 'class-validator';

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

  @ValidateIf((o) => o.password !== o.repeatPassword)
  @IsNotEmpty()
  @IsEmpty({ message: 'register.errors.passwordMismatch' })
  repeatPassword: string;

  @IsOptional()
  @IsEmail(undefined, { message: 'register.errors.emailInvalid' })
  email?: string;
}

