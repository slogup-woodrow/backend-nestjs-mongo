import { Injectable } from '@nestjs/common';
import { BoardRepository } from '../repositories/board.repository';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { FindBoardDto } from '../dtos/request/find-board.dto';
import { Board } from '../entities/board.entity';
import { Pagination } from 'src/shared/decorators/paginated-query.decorator';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto);
  }

  async findAll(
    findBoardDto: FindBoardDto,
    pagination?: Pagination,
  ): Promise<{
    boards: Board[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;

    const { list, count } = await this.boardRepository.findBoardListAndCount(
      findBoardDto,
      { page, pageSize },
    );

    const totalPages = Math.ceil(count / pageSize);

    return {
      boards: list,
      total: count,
      page,
      limit: pageSize,
      totalPages,
    };
  }

  async findOne(query: any): Promise<Board | null> {
    if (query.id || query._id) {
      return this.boardRepository.findBoardById(query.id || query._id);
    }

    const findDto = new FindBoardDto();
    if (query.title) findDto.title = query.title;
    if (query.author) findDto.author = query.author;

    return this.boardRepository.findBoard(findDto);
  }

  async findById(id: string): Promise<Board | null> {
    const board = await this.boardRepository.findBoardById(id);
    if (board) {
      await this.boardRepository.incrementViewCount(id);
      return this.boardRepository.findBoardById(id);
    }
    return null;
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board | null> {
    return this.boardRepository.updateBoard(id, updateBoardDto);
  }

  async delete(id: string): Promise<Board | null> {
    return this.boardRepository.deleteBoard(id);
  }
}
