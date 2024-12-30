import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Código de autorização do github' })
  @IsNotEmpty({ message: 'Código de autorização não informado' })
  code: string;
}
