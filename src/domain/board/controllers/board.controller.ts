import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BoardService } from '../services/board.service';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { FindBoardDto } from '../dtos/request/find-board.dto';
import { Board } from '../entities/board.entity';
import { ApiDoc } from 'src/shared/decorators/api-doc.decorator';
import {
  PaginatedQuery,
  Pagination,
} from 'src/shared/decorators/paginated-query.decorator';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiDoc({
    summary: '게시판 생성',
    description: '게시판 생성',
  })
  @Post()
  async create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardService.create(createBoardDto);
  }

  @ApiDoc({
    summary: '게시판 리스트 조회',
    description: '게시판 리스트 조회',
  })
  @Get()
  async findAll(
    @Query() findBoardDto: FindBoardDto,
    @PaginatedQuery() pagination: Pagination,
  ): Promise<{
    boards: Board[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.boardService.findAll(findBoardDto, pagination);
  }

  @ApiDoc({
    summary: '게시판 상세 조회',
    description: '게시판 상세 조회',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Board | null> {
    return this.boardService.findById(id);
  }

  @ApiDoc({
    summary: '게시판 상세 수정',
    description: '게시판 상세 수정',
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<Board | null> {
    return this.boardService.update(id, updateBoardDto);
  }

  @ApiDoc({
    summary: '게시판 게시물 삭제',
    description: '게시판 게시물 삭제',
  })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Board | null> {
    return this.boardService.delete(id);
  }
}
