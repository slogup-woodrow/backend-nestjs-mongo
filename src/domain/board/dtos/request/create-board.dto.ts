import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요!',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '오늘도 좋은 하루 보내세요!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '작성자명',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  author: string;
}
