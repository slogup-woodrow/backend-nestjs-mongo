import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { constants } from '../board.constants';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true, collection: 'Board', autoIndex: true })
export class Board {
  @ApiProperty({
    description: '게시글 ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id?: string;

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

  @ApiProperty({
    description: '삭제일시',
    example: null,
    required: false,
  })
  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요!',
  })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '오늘도 좋은 하루 보내세요!',
  })
  @Prop({ type: String, required: true })
  content: string;

  @ApiProperty({
    description: '작성자명',
    example: '홍길동',
  })
  @Prop({ type: String, required: true })
  author: string;

  @ApiProperty({
    description: '조회수',
    example: 0,
  })
  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const BoardSchema = SchemaFactory.createForClass(Board);

BoardSchema.index(
  { title: 1 },
  {
    unique: true, //unique,
    sparse: true, //null값 제외
    name: constants.props.index.BOARD_UNIQUE_TITLE,
  },
);
