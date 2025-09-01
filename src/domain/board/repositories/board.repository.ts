import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    try {
      const filter = this.buildFilter(findBoardDto);
      const result = await this.boardModel.findOne(filter).exec();

      if (!result) {
        throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
      }

      return result;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
      }
      throw error;
    }
  }

  async findBoardListAndCount(
    findBoardDto: FindBoardDto,
    pagination: Pagination,
  ): Promise<{ list: Board[]; count: number }> {
    try {
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

      // Empty collections are valid - return 200 with empty array

      return { list, count };
    } catch (error) {
      if (error.name === 'CastError') {
        // Invalid query parameters return empty results for lists
        return { list: [], count: 0 };
      }
      throw error;
    }
  }

  async findBoardById(id: string): Promise<Board> {
    try {
      const result = await this.boardModel
        .findOne({ _id: id, deletedAt: null })
        .exec();

      if (!result) {
        throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
      }

      return result;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
      }
      throw error;
    }
  }

  async updateBoard(
    id: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    // First check if board exists and not deleted
    const existingBoard = await this.boardModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!existingBoard) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    // Update the board
    const updateResult = await this.boardModel.updateOne(
      { _id: id, deletedAt: null },
      updateBoardDto,
    );

    if (updateResult.modifiedCount !== 1) {
      throw new BadRequestException(
        constants.errorMessages.FAIL_TO_UPDATE_BOARD,
      );
    }

    // Return the updated board
    return await this.boardModel.findById(id);
  }

  async deleteBoard(id: string): Promise<void> {
    // First check if board exists
    const exists = await this.boardModel.exists({ _id: id, deletedAt: null });
    if (!exists) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD.en);
    }

    // Perform soft delete
    const updateResult = await this.boardModel.updateOne(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
    );

    if (updateResult.modifiedCount !== 1) {
      throw new BadRequestException(
        constants.errorMessages.FAIL_TO_DELETE_BOARD,
      );
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
    // First check if board exists and not deleted
    const exists = await this.boardModel.exists({ _id: id, deletedAt: null });
    if (!exists) {
      throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
    }

    // Increment view count
    const updateResult = await this.boardModel.updateOne(
      { _id: id, deletedAt: null },
      { $inc: { viewCount: 1 } },
    );

    if (updateResult.modifiedCount !== 1) {
      throw new BadRequestException(
        constants.errorMessages.FAIL_TO_UPDATE_BOARD,
      );
    }

    // Return the updated board
    return await this.boardModel.findById(id);
  }

  private buildFilter(findBoardDto: FindBoardDto): any {
    const { title, author, id } = findBoardDto;
    const filter: any = {
      deletedAt: null,
    };

    if (id) {
      filter._id = id;
    }
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    return filter;
  }
}
