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

  async generateBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto);
  }

  async getBoardListAndCount(
    findBoardDto: FindBoardDto,
    pagination?: Pagination,
  ): Promise<{ list: Board[]; count: number }> {
    const { list, count } = await this.boardRepository.findBoardListAndCount(
      findBoardDto,
      pagination,
    );

    // 빈 결과도 정상적으로 반환 (404 던지지 않음)
    return {
      list: list || [],
      count: count || 0,
    };
  }

  async getBoard(findBoardDto: FindBoardDto): Promise<Board> {
    return this.boardRepository.findBoard(findBoardDto);
  }

  async findById(id: string): Promise<Board> {
    return this.boardRepository.findBoardById(id);
  }

  async modifyBoard(
    id: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    return this.boardRepository.updateBoard(id, updateBoardDto);
  }

  async removeBoard(id: string): Promise<void> {
    await this.boardRepository.deleteBoard(id);
  }
}
