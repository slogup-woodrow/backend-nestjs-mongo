import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, FilterQuery } from 'mongoose';
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

  async createBoard(
    createBoardDto: CreateBoardDto,
    session?: ClientSession,
  ): Promise<Board> {
    try {
      const board = new this.boardModel(createBoardDto);

      if (session) {
        return await board.save({ session });
      }
      return await board.save();
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException(constants.errorMessages.CONFLICT_EXAMPLE);
      }
      throw new BadRequestException(
        constants.errorMessages.FAIL_TO_CREATE_BOARD,
      );
    }
  }

  async findBoard(findBoardDto: FindBoardDto): Promise<Board> {
    const filter = this.buildFilterQuery(findBoardDto);
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
    const filter = this.buildFilterQuery(findBoardDto);

    let query = this.boardModel.find(filter);

    if (pagination) {
      query = query
        .limit(pagination.pageSize)
        .skip((pagination.page - 1) * pagination.pageSize);
    }

    const [list, count] = await Promise.all([
      query.exec(),
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
    session?: ClientSession,
  ): Promise<Board> {
    try {
      const options = { new: true, ...(session && { session }) };

      const result = await this.boardModel.findByIdAndUpdate(
        id,
        updateBoardDto,
        options,
      );

      return result;
    } catch (e) {
      if (e.status === 404) {
        throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);
      }
      if (e.code === 11000) {
        throw new ConflictException(constants.errorMessages.CONFLICT_EXAMPLE);
      }
      throw new BadRequestException(
        constants.errorMessages.FAIL_TO_UPDATE_BOARD,
      );
    }
  }

  async deleteBoard(id: string): Promise<void> {
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

  private buildFilterQuery(
    findBoardDto: FindBoardDto,
  ): FilterQuery<BoardDocument> {
    const { title, author, id } = findBoardDto;

    const filter: FilterQuery<BoardDocument> = {};

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
