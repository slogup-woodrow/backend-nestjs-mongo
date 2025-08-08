import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiPropertyOptional({
    description: '수정할 게시글 제목',
    example: '수정된 제목입니다',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: '수정할 게시글 내용',
    example: '수정된 내용입니다',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: '게시글 활성화 상태',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
