import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from '../entities/board.entity';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { FindBoardDto } from '../dtos/request/find-board.dto';
import { Pagination } from 'src/shared/decorators/paginated-query.decorator';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const createdBoard = new this.boardModel(createBoardDto);
    return createdBoard.save();
  }

  async findBoard(findBoardDto: FindBoardDto): Promise<Board | null> {
    const filter = this.buildFilter(findBoardDto);
    return this.boardModel.findOne(filter).exec();
  }

  async findBoardListAndCount(
    findBoardDto: FindBoardDto,
    pagination: Pagination,
  ): Promise<{ list: Board[]; count: number }> {
    const filter = this.buildFilter(findBoardDto);

    const [list, count] = await Promise.all([
      this.boardModel
        .find(filter)
        .limit(pagination.pageSize)
        .skip((pagination.page - 1) * pagination.pageSize)
        .sort({ createdAt: -1 })
        .exec(),
      this.boardModel.countDocuments(filter).exec(),
    ]);

    return { list, count };
  }

  async findBoardById(id: string): Promise<Board | null> {
    return this.boardModel.findById(id).exec();
  }

  async updateBoard(
    id: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board | null> {
    return this.boardModel
      .findByIdAndUpdate(id, updateBoardDto, { new: true })
      .exec();
  }

  async deleteBoard(id: string): Promise<Board | null> {
    return this.boardModel.findByIdAndDelete(id).exec();
  }

  async incrementViewCount(id: string): Promise<Board | null> {
    return this.boardModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .exec();
  }

  private buildFilter(findBoardDto: FindBoardDto): any {
    const { title, author } = findBoardDto;
    const filter: any = { isActive: true };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    return filter;
  }
}
