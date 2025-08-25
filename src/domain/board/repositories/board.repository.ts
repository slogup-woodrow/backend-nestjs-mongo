import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from '../entities/board.entity';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { FindBoardDto } from '../dtos/request/find-board.dto';
import { Pagination } from 'src/shared/decorators/paginated-query.decorator';
import { constants } from '../board.constants';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const createdBoard = new this.boardModel(createBoardDto);
    return createdBoard.save();
  }

  async findBoard(findBoardDto: FindBoardDto): Promise<Board> {
    const filter = this.buildFilter(findBoardDto);
    const result = await this.boardModel.findOne(filter).exec();

    if (!result) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    return result;
  }

  async findBoardListAndCount(
    findBoardDto: FindBoardDto,
    pagination: Pagination,
  ): Promise<{ list: Board[]; count: number }> {
    const filter = this.buildFilter(findBoardDto);

    let query = this.boardModel.find(filter);

    if (pagination) {
      query = query
        .limit(pagination.pageSize)
        .skip((pagination.page - 1) * pagination.pageSize);
    }

    const [list, count] = await Promise.all([
      query.sort({ createdAt: -1 }).exec(),
      this.boardModel.countDocuments(filter).exec(),
    ]);

    return { list, count };
  }

  async findBoardById(id: string): Promise<Board> {
    const result = await this.boardModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!result) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    return result;
  }

  async updateBoard(
    id: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    const result = await this.boardModel
      .findOneAndUpdate({ _id: id }, updateBoardDto, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    return result;
  }

  async deleteBoard(id: string): Promise<void> {
    const result = await this.boardModel
      .findOneAndUpdate({ _id: id }, { deletedAt: new Date() }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }
  }

  async hardDeleteBoard(id: string): Promise<Board> {
    const result = await this.boardModel.findOneAndDelete({ _id: id }).exec();

    if (!result) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    return result;
  }

  async incrementViewCount(id: string): Promise<Board> {
    const result = await this.boardModel
      .findOneAndUpdate({ _id: id }, { $inc: { viewCount: 1 } }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    return result;
  }

  private buildFilter(findBoardDto: FindBoardDto): any {
    const { title, author } = findBoardDto;
    const filter: any = {
      deletedAt: null,
    };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    return filter;
  }
}
