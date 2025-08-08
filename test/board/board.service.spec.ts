import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BoardService } from '../../src/domain/board/services/board.service';
import { BoardRepository } from '../../src/domain/board/repositories/board.repository';
import { CreateBoardDto } from '../../src/domain/board/dtos/request/create-board.dto';
import { UpdateBoardDto } from '../../src/domain/board/dtos/request/update-board.dto';
import { FindBoardDto } from '../../src/domain/board/dtos/request/find-board.dto';
import { Board } from '../../src/domain/board/entities/board.entity';
import { Pagination } from '../../src/shared/decorators/paginated-query.decorator';

describe('BoardService', () => {
  let service: BoardService;
  let repository: BoardRepository;

  const mockBoard: Board = {
    _id: '507f1f77bcf86cd799439011',
    title: '테스트 게시글',
    content: '테스트 내용입니다.',
    author: '작성자',
    viewCount: 0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockBoardRepository = {
    createBoard: jest.fn(),
    findBoardListAndCount: jest.fn(),
    findBoard: jest.fn(),
    findBoardById: jest.fn(),
    updateBoard: jest.fn(),
    deleteBoard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: BoardRepository,
          useValue: mockBoardRepository,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    repository = module.get<BoardRepository>(BoardRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('게시글 생성', () => {
    describe('Given 유효한 게시글 생성 데이터가 주어졌을 때', () => {
      it('When generateBoard를 호출하면 Then 리포지토리의 createBoard를 호출하고 생성된 게시글을 반환해야 한다', async () => {
        // Given
        const createBoardDto: CreateBoardDto = {
          title: '새 게시글',
          content: '새 내용',
          author: '새 작성자',
        };
        mockBoardRepository.createBoard.mockResolvedValue(mockBoard);

        // When
        const result = await service.generateBoard(createBoardDto);

        // Then
        expect(repository.createBoard).toHaveBeenCalledWith(createBoardDto);
        expect(repository.createBoard).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });
  });

  describe('게시글 목록 조회', () => {
    describe('Given 검색 조건과 페이지네이션이 주어졌을 때', () => {
      it('When getBoardListAndCount를 호출하면 Then 리포지토리에서 목록과 개수를 조회해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = { title: '검색어' };
        const pagination: Pagination = { page: 1, pageSize: 10 };
        const mockResult = { list: [mockBoard], count: 1 };

        mockBoardRepository.findBoardListAndCount.mockResolvedValue(mockResult);

        // When
        const result = await service.getBoardListAndCount(
          findBoardDto,
          pagination,
        );

        // Then
        expect(repository.findBoardListAndCount).toHaveBeenCalledWith(
          findBoardDto,
          pagination,
        );
        expect(repository.findBoardListAndCount).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockResult);
      });
    });

    describe('Given 페이지네이션이 없을 때', () => {
      it('When getBoardListAndCount를 호출하면 Then 페이지네이션 없이 전체 목록을 조회해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = {};
        const mockResult = { list: [mockBoard], count: 1 };

        mockBoardRepository.findBoardListAndCount.mockResolvedValue(mockResult);

        // When
        const result = await service.getBoardListAndCount(findBoardDto);

        // Then
        expect(repository.findBoardListAndCount).toHaveBeenCalledWith(
          findBoardDto,
          undefined,
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('Given 검색 결과가 없을 때', () => {
      it('When getBoardListAndCount를 호출하면 Then 빈 목록과 0개 개수를 반환해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = { title: '존재하지않는검색어' };
        const pagination: Pagination = { page: 1, pageSize: 10 };
        const mockResult = { list: [], count: 0 };

        mockBoardRepository.findBoardListAndCount.mockResolvedValue(mockResult);

        // When
        const result = await service.getBoardListAndCount(
          findBoardDto,
          pagination,
        );

        // Then
        expect(result.list).toHaveLength(0);
        expect(result.count).toBe(0);
      });
    });
  });

  describe('게시글 조회', () => {
    describe('Given 유효한 검색 조건이 주어졌을 때', () => {
      it('When getBoard를 호출하면 Then 리포지토리의 findBoard를 호출하고 게시글을 반환해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = { id: '507f1f77bcf86cd799439011' };
        mockBoardRepository.findBoard.mockResolvedValue(mockBoard);

        // When
        const result = await service.getBoard(findBoardDto);

        // Then
        expect(repository.findBoard).toHaveBeenCalledWith(findBoardDto);
        expect(repository.findBoard).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });

    describe('Given 존재하지 않는 게시글을 조회할 때', () => {
      it('When getBoard를 호출하면 Then NotFoundException이 발생해야 한다', async () => {
        // Given
        const findBoardDto: FindBoardDto = { id: 'nonexistent' };
        mockBoardRepository.findBoard.mockRejectedValue(
          new NotFoundException('Board not found'),
        );

        // When & Then
        await expect(service.getBoard(findBoardDto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('게시글 ID로 조회', () => {
    describe('Given 유효한 게시글 ID가 주어졌을 때', () => {
      it('When findById를 호출하면 Then 리포지토리의 findBoardById를 호출하고 게시글을 반환해야 한다', async () => {
        // Given
        const id = '507f1f77bcf86cd799439011';
        mockBoardRepository.findBoardById.mockResolvedValue(mockBoard);

        // When
        const result = await service.findById(id);

        // Then
        expect(repository.findBoardById).toHaveBeenCalledWith(id);
        expect(repository.findBoardById).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBoard);
      });
    });

    describe('Given 존재하지 않는 게시글 ID가 주어졌을 때', () => {
      it('When findById를 호출하면 Then NotFoundException이 발생해야 한다', async () => {
        // Given
        const id = 'nonexistent';
        mockBoardRepository.findBoardById.mockRejectedValue(
          new NotFoundException('Board not found'),
        );

        // When & Then
        await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('게시글 수정', () => {
    describe('Given 유효한 게시글 ID와 수정 데이터가 주어졌을 때', () => {
      it('When modifyBoard를 호출하면 Then 리포지토리의 updateBoard를 호출하고 수정된 게시글을 반환해야 한다', async () => {
        // Given
        const id = '507f1f77bcf86cd799439011';
        const updateBoardDto: UpdateBoardDto = {
          title: '수정된 제목',
          content: '수정된 내용',
        };
        const updatedBoard = { ...mockBoard, ...updateBoardDto };
        mockBoardRepository.updateBoard.mockResolvedValue(updatedBoard);

        // When
        const result = await service.modifyBoard(id, updateBoardDto);

        // Then
        expect(repository.updateBoard).toHaveBeenCalledWith(id, updateBoardDto);
        expect(repository.updateBoard).toHaveBeenCalledTimes(1);
        expect(result).toEqual(updatedBoard);
      });
    });

    describe('Given 존재하지 않는 게시글 ID가 주어졌을 때', () => {
      it('When modifyBoard를 호출하면 Then NotFoundException이 발생해야 한다', async () => {
        // Given
        const id = 'nonexistent';
        const updateBoardDto: UpdateBoardDto = { title: '수정 시도' };
        mockBoardRepository.updateBoard.mockRejectedValue(
          new NotFoundException('Board not found'),
        );

        // When & Then
        await expect(service.modifyBoard(id, updateBoardDto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('게시글 삭제', () => {
    describe('Given 유효한 게시글 ID가 주어졌을 때', () => {
      it('When removeBoard를 호출하면 Then 리포지토리의 deleteBoard를 호출해야 한다', async () => {
        // Given
        const id = '507f1f77bcf86cd799439011';
        mockBoardRepository.deleteBoard.mockResolvedValue(undefined);

        // When
        await service.removeBoard(id);

        // Then
        expect(repository.deleteBoard).toHaveBeenCalledWith(id);
        expect(repository.deleteBoard).toHaveBeenCalledTimes(1);
      });
    });

    describe('Given 존재하지 않는 게시글 ID가 주어졌을 때', () => {
      it('When removeBoard를 호출하면 Then 리포지토리의 deleteBoard를 호출하지만 에러를 발생시키지 않아야 한다', async () => {
        // Given
        const id = 'nonexistent';
        mockBoardRepository.deleteBoard.mockResolvedValue(undefined);

        // When & Then
        await expect(service.removeBoard(id)).resolves.not.toThrow();
        expect(repository.deleteBoard).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('서비스 레이어 로직', () => {
    describe('Given 서비스가 비즈니스 로직을 처리해야 할 때', () => {
      it('When 각 메서드를 호출하면 Then 적절한 리포지토리 메서드만 호출하고 추가 로직은 없어야 한다', async () => {
        // Given
        const createDto: CreateBoardDto = {
          title: 'test',
          content: 'test',
          author: 'test',
        };
        const findDto: FindBoardDto = { title: 'test' };
        const updateDto: UpdateBoardDto = { title: 'updated' };
        const id = '507f1f77bcf86cd799439011';

        mockBoardRepository.createBoard.mockResolvedValue(mockBoard);
        mockBoardRepository.findBoard.mockResolvedValue(mockBoard);
        mockBoardRepository.updateBoard.mockResolvedValue(mockBoard);
        mockBoardRepository.deleteBoard.mockResolvedValue(undefined);

        // When
        await service.generateBoard(createDto);
        await service.getBoard(findDto);
        await service.modifyBoard(id, updateDto);
        await service.removeBoard(id);

        // Then - 각 메서드가 정확히 한 번씩만 호출되었는지 확인
        expect(repository.createBoard).toHaveBeenCalledTimes(1);
        expect(repository.findBoard).toHaveBeenCalledTimes(1);
        expect(repository.updateBoard).toHaveBeenCalledTimes(1);
        expect(repository.deleteBoard).toHaveBeenCalledTimes(1);
      });
    });
  });
});
