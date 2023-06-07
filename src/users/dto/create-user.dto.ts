import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly first_name: string;

  @IsString()
  readonly last_name: string;

  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly avatar?: string;
}
