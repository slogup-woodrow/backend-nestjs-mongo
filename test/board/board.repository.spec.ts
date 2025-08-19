import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { BoardRepository } from '../../src/domain/board/repositories/board.repository';
import {
  Board,
  BoardDocument,
} from '../../src/domain/board/entities/board.entity';
import { CreateBoardDto } from '../../src/domain/board/dtos/request/create-board.dto';
import { UpdateBoardDto } from '../../src/domain/board/dtos/request/update-board.dto';
import { FindBoardDto } from '../../src/domain/board/dtos/request/find-board.dto';
import { Pagination } from '../../src/shared/decorators/paginated-query.decorator';
import { faker } from '@faker-js/faker';

describe('BoardRepository', () => {
  let repository: BoardRepository;
  let model: Model<BoardDocument>;

  const createMockBoard = (): Board => ({
    _id: faker.database.mongodbObjectId(),
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    content: faker.lorem.paragraphs(2),
    author: faker.person.fullName(),
    viewCount: faker.number.int({ min: 0, max: 100 }),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  let mockBoard: Board;
  let mockBoardDocument: any;

  const mockQuery = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    findOneAndDelete: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn().mockReturnValue(mockQuery),
    findOne: jest.fn().mockReturnValue(mockQuery),
    findOneAndUpdate: jest.fn().mockReturnValue(mockQuery),
    findOneAndDelete: jest.fn().mockReturnValue(mockQuery),
    countDocuments: jest.fn().mockReturnValue(mockQuery),
    create: jest.fn(),
  };

  beforeEach(async () => {
    // 각 테스트마다 새로운 mock 데이터 생성
    mockBoard = createMockBoard();
    mockBoardDocument = {
      ...mockBoard,
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardRepository,
        {
          provide: getModelToken(Board.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<BoardRepository>(BoardRepository);
    model = module.get<Model<BoardDocument>>(getModelToken(Board.name));

    // MockModel constructor를 통해 새 인스턴스 생성 시 mockBoardDocument 반환
    Object.setPrototypeOf(mockModel, Model);
    mockModel.constructor = jest
      .fn()
      .mockImplementation(() => mockBoardDocument);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('게시글 생성', () => {
    describe('Given 유효한 게시글 생성 데이터가 주어졌을 때', () => {
      it('When createBoard를 호출하면 Then 새로운 게시글을 생성하고 저장해야 한다', async () => {
        // Given
        const createBoardDto: CreateBoardDto = {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          content: faker.lorem.paragraphs(2),
          author: faker.person.fullName(),
        };
        mockBoardDocument.save.mockResolvedValue(mockBoard);

        // When
        const result = await repository.createBoard(createBoardDto);

        // Then
        expect(mockBoardDocument.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });
  });

  describe('게시글 조회', () => {
    describe('Given 검색 조건이 주어졌을 때', () => {
      it('When findBoard를 호출하면 Then buildFilter를 통해 조건을 생성하고 해당 게시글을 조회해야 한다', async () => {
        // Given
        const searchTerm = faker.lorem.word();
        const findBoardDto: FindBoardDto = { title: searchTerm };
        mockQuery.exec.mockResolvedValue(mockBoard);

        // When
        const result = await repository.findBoard(findBoardDto);

        // Then
        expect(model.findOne).toHaveBeenCalledWith({
          deletedAt: null,
          title: { $regex: searchTerm, $options: 'i' },
        });
        expect(mockQuery.exec).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });

    describe('Given 작성자 검색 조건이 주어졌을 때', () => {
      it('When findBoard를 호출하면 Then 작성자 조건으로 검색해야 한다', async () => {
        // Given
        const authorName = faker.person.fullName();
        const findBoardDto: FindBoardDto = { author: authorName };
        mockQuery.exec.mockResolvedValue(mockBoard);

        // When
        await repository.findBoard(findBoardDto);

        // Then
        expect(model.findOne).toHaveBeenCalledWith({
          deletedAt: null,
          author: { $regex: authorName, $options: 'i' },
        });
      });
    });

    describe('Given 존재하지 않는 게시글을 검색할 때', () => {
      it('When findBoard를 호출하면 Then NotFoundException을 던져야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = { title: faker.lorem.sentence() };
        mockQuery.exec.mockResolvedValue(null);

        // When & Then
        await expect(repository.findBoard(findBoardDto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('게시글 목록 조회', () => {
    describe('Given 페이지네이션이 있을 때', () => {
      it('When findBoardListAndCount를 호출하면 Then limit과 skip을 적용하여 조회해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = {};
        const pagination: Pagination = { page: 2, pageSize: 10 };
        const mockList = [mockBoard];
        const mockCount = 1;

        mockQuery.exec
          .mockResolvedValueOnce(mockList) // find query
          .mockResolvedValueOnce(mockCount); // countDocuments query

        // When
        const result = await repository.findBoardListAndCount(
          findBoardDto,
          pagination,
        );

        // Then
        expect(model.find).toHaveBeenCalledWith({ deletedAt: null });
        expect(mockQuery.limit).toHaveBeenCalledWith(10);
        expect(mockQuery.skip).toHaveBeenCalledWith(10); // (page-1) * pageSize = (2-1) * 10
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(model.countDocuments).toHaveBeenCalledWith({ deletedAt: null });
        expect(result).toEqual({ list: mockList, count: mockCount });
      });
    });

    describe('Given 페이지네이션이 없을 때', () => {
      it('When findBoardListAndCount를 호출하면 Then limit과 skip 없이 전체 조회해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = {};
        const mockList = [mockBoard];
        const mockCount = 1;

        mockQuery.exec
          .mockResolvedValueOnce(mockList)
          .mockResolvedValueOnce(mockCount);

        // When
        const result = await repository.findBoardListAndCount(
          findBoardDto,
          null,
        );

        // Then
        expect(model.find).toHaveBeenCalledWith({ deletedAt: null });
        expect(mockQuery.limit).not.toHaveBeenCalled();
        expect(mockQuery.skip).not.toHaveBeenCalled();
        expect(result).toEqual({ list: mockList, count: mockCount });
      });
    });
  });

  describe('게시글 ID로 조회', () => {
    describe('Given 유효한 게시글 ID가 주어졌을 때', () => {
      it('When findBoardById를 호출하면 Then 해당 ID와 삭제되지 않은 조건으로 조회해야 한다', async () => {
        // Given
        const id = faker.database.mongodbObjectId();
        mockQuery.exec.mockResolvedValue(mockBoard);

        // When
        const result = await repository.findBoardById(id);

        // Then
        expect(model.findOne).toHaveBeenCalledWith({
          _id: id,
          deletedAt: null,
        });
        expect(mockQuery.exec).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });
  });

  describe('게시글 수정', () => {
    describe('Given 유효한 게시글 ID와 수정 데이터가 주어졌을 때', () => {
      it('When updateBoard를 호출하면 Then findOneAndUpdate로 게시글을 수정해야 한다', async () => {
        // Given
        const id = faker.database.mongodbObjectId();
        const updateBoardDto: UpdateBoardDto = {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          content: faker.lorem.paragraphs(2),
        };
        const updatedBoard = { ...mockBoard, ...updateBoardDto };
        mockQuery.exec.mockResolvedValue(updatedBoard);

        // When
        const result = await repository.updateBoard(id, updateBoardDto);

        // Then
        expect(model.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: id },
          updateBoardDto,
          { new: true },
        );
        expect(mockQuery.exec).toHaveBeenCalledTimes(1);
        expect(result).toEqual(updatedBoard);
      });
    });
  });

  describe('게시글 삭제 (Soft Delete)', () => {
    describe('Given 유효한 게시글 ID가 주어졌을 때', () => {
      it('When deleteBoard를 호출하면 Then deletedAt을 설정하여 소프트 삭제해야 한다', async () => {
        // Given
        const id = faker.database.mongodbObjectId();
        const deletedBoard = { ...mockBoard, deletedAt: new Date() };
        mockQuery.exec.mockResolvedValue(deletedBoard);

        // When
        const result = await repository.deleteBoard(id);

        // Then
        expect(model.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: id },
          { deletedAt: expect.any(Date) },
          { new: true },
        );
        expect(mockQuery.exec).toHaveBeenCalledTimes(1);
        expect(result).toEqual(deletedBoard);
      });
    });
  });

  describe('게시글 완전 삭제 (Hard Delete)', () => {
    describe('Given 유효한 게시글 ID가 주어졌을 때', () => {
      it('When hardDeleteBoard를 호출하면 Then 게시글을 데이터베이스에서 완전히 삭제해야 한다', async () => {
        // Given
        const id = faker.database.mongodbObjectId();
        mockQuery.exec.mockResolvedValue(mockBoard);

        // When
        const result = await repository.hardDeleteBoard(id);

        // Then
        expect(model.findOneAndDelete).toHaveBeenCalledWith({ _id: id });
        expect(mockQuery.exec).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });
  });

  describe('조회수 증가', () => {
    describe('Given 유효한 게시글 ID가 주어졌을 때', () => {
      it('When incrementViewCount를 호출하면 Then 조회수를 1 증가시켜야 한다', async () => {
        // Given
        const id = faker.database.mongodbObjectId();
        const incrementedBoard = { ...mockBoard, viewCount: 1 };
        mockQuery.exec.mockResolvedValue(incrementedBoard);

        // When
        const result = await repository.incrementViewCount(id);

        // Then
        expect(model.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: id },
          { $inc: { viewCount: 1 } },
          { new: true },
        );
        expect(mockQuery.exec).toHaveBeenCalledTimes(1);
        expect(result).toEqual(incrementedBoard);
      });
    });
  });

  describe('필터 생성', () => {
    describe('Given 제목과 작성자가 모두 포함된 검색 조건이 주어졌을 때', () => {
      it('When buildFilter를 통해 조회하면 Then 두 조건이 모두 포함된 필터를 생성해야 한다', async () => {
        // Given
        const titleSearch = faker.lorem.word();
        const authorSearch = faker.person.fullName();
        const findBoardDto: FindBoardDto = {
          title: titleSearch,
          author: authorSearch,
        };
        mockQuery.exec.mockResolvedValue(mockBoard);

        // When
        await repository.findBoard(findBoardDto);

        // Then
        expect(model.findOne).toHaveBeenCalledWith({
          deletedAt: null,
          title: { $regex: titleSearch, $options: 'i' },
          author: { $regex: authorSearch, $options: 'i' },
        });
      });
    });

    describe('Given 검색 조건이 없을 때', () => {
      it('When buildFilter를 통해 조회하면 Then 기본 필터만 적용되어야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = {};
        mockQuery.exec.mockResolvedValue(mockBoard);

        // When
        await repository.findBoard(findBoardDto);

        // Then
        expect(model.findOne).toHaveBeenCalledWith({
          deletedAt: null,
        });
      });
    });
  });
});
