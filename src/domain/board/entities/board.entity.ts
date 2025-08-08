import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @ApiProperty({
    description: '게시글 ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id?: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요!',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '오늘도 좋은 하루 보내세요!',
  })
  @Prop({ required: true })
  content: string;

  @ApiProperty({
    description: '작성자명',
    example: '홍길동',
  })
  @Prop({ required: true })
  author: string;

  @ApiProperty({
    description: '조회수',
    example: 0,
  })
  @Prop({ default: 0 })
  viewCount: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt?: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
