import { IsAlphanumeric, IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class SignInDto {
  @IsAlphanumeric(undefined, { message: 'Username must be alphanumeric' })
  username: string;

  password: string;
}

export class SignUpDto {
  @IsAlphanumeric(undefined, { message: 'Username must be alphanumeric' })
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
  @IsEmail(undefined, { message: 'Email must be a valid email address' })
  email?: string;
}
