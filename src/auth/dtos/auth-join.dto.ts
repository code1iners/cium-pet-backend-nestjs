import { JoinMethod } from '@prisma/client';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class AuthJoinDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 20)
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  method: JoinMethod;
}
