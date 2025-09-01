import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindBoardDto {
  @ApiPropertyOptional({
    description: '제목 검색 키워드',
    example: '안녕',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: '작성자 검색 키워드',
    example: '홍길',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'ID 검색',
    example: '68ac4205d4a9098654af5db8',
  })
  @IsOptional()
  @IsString()
  id?: string;
}
