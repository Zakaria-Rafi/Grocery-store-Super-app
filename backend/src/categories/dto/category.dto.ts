import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  @Expose()
  id: number;
  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;
}
