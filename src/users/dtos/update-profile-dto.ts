import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Biografia do usuário' })
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Tecnologias que o usuário utiliza' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, {
    message: 'Você só pode atribuir até 5 techs no seu perfil',
  })
  techs?: string[];
}
