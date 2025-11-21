import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BoardService } from '../services/board.service';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { FindBoardDto } from '../dtos/request/find-board.dto';
import { BoardResponseDto } from '../dtos/response/board-response.dto';
import { BoardListResponseDto } from '../dtos/response/board-list-response.dto';
import { ApiDoc } from 'src/shared/decorators/api-doc.decorator';
import {
  PaginatedQuery,
  Pagination,
} from 'src/shared/decorators/paginated-query.decorator';
import { ObjectResponse } from 'src/shared/dtos/object-response.dto';
import { ListResponse } from 'src/shared/dtos/list-response.dto';
import { ParseMongoIdPipe } from 'src/shared/pipes/mongo-id-validation.pipe';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiDoc({
    summary: '게시판 생성',
    description: '게시판 생성',
    responseModel: BoardResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async post(
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<ObjectResponse<BoardResponseDto>> {
    const result = await this.boardService.generateBoard(createBoardDto);

    return new ObjectResponse(BoardResponseDto.of(result));
  }

  @ApiDoc({
    summary: '게시판 리스트 조회',
    description: '게시판 리스트 조회',
    responseModel: BoardListResponseDto,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBoards(
    @Query() findBoardDto: FindBoardDto,
    @PaginatedQuery() pagination: Pagination,
  ): Promise<ListResponse<BoardListResponseDto>> {
    const { list, count } = await this.boardService.getBoardListAndCount(
      findBoardDto,
      pagination,
    );

    return new ListResponse(BoardListResponseDto.listOf(list), count);
  }

  @ApiDoc({
    summary: '게시판 상세 조회',
    description: '게시판 상세 조회',
    responseModel: BoardResponseDto,
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBoard(
    @Param('id', ParseMongoIdPipe) id: string,
  ): Promise<ObjectResponse<BoardResponseDto>> {
    const result = await this.boardService.getBoard({ id });
    return new ObjectResponse(BoardResponseDto.of(result));
  }

  @ApiDoc({
    summary: '게시판 상세 수정',
    description: '게시판 상세 수정',
    responseModel: BoardResponseDto,
  })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async putBoard(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<ObjectResponse<BoardResponseDto>> {
    const result = await this.boardService.modifyBoard(id, updateBoardDto);
    return new ObjectResponse(BoardResponseDto.of(result));
  }

  @ApiDoc({
    summary: '게시판 게시물 삭제',
    description: '게시판 게시물 삭제',
    responseModel: BoardResponseDto,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoard(@Param('id', ParseMongoIdPipe) id: string): Promise<void> {
    await this.boardService.removeBoard(id);
  }
}
