import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('BoardController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // E2E 테스트에서 ValidationPipe 명시적으로 설정
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false, // query parameter 허용을 위해 false로 설정
        transform: true,
      }),
    );

    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterEach(async () => {
    // 테스트 후 데이터 정리
    const collections = connection.db.collections();
    for (const collection of await collections) {
      await collection.deleteMany({});
    }
    await app.close();

    // MongoDB 연결 완전히 종료
    await connection.close();
  });

  describe('게시글 생성 (POST /boards)', () => {
    describe('Given 유효한 게시글 데이터가 주어졌을 때', () => {
      it('When POST /boards를 호출하면 Then 201 상태코드와 함께 게시글을 생성해야 한다', () => {
        const createBoardDto = {
          title: '새 게시글',
          content: '새 내용입니다.',
          author: '작성자',
        };

        return request(app.getHttpServer())
          .post('/boards')
          .send(createBoardDto)
          .expect(201)
          .expect((res) => {
            expect(res.body.row).toBeDefined();
            expect(res.body.row.title).toBe(createBoardDto.title);
            expect(res.body.row.content).toBe(createBoardDto.content);
            expect(res.body.row.author).toBe(createBoardDto.author);
            expect(res.body.row._id).toBeDefined();
            expect(res.body.row.createdAt).toBeDefined();
            expect(res.body.row.updatedAt).toBeDefined();
          });
      });
    });

    describe('Given 필수 필드가 누락된 데이터가 주어졌을 때', () => {
      it('When POST /boards를 호출하면 Then 400 상태코드를 반환해야 한다 (ValidationPipe)', () => {
        const invalidDto = {
          title: '제목만 있음',
          // content, author 누락
        };

        return request(app.getHttpServer())
          .post('/boards')
          .send(invalidDto)
          .expect(400);
      });
    });
  });

  describe('게시글 목록 조회 (GET /boards)', () => {
    describe('Given 빈 데이터베이스일 때', () => {
      it('When GET /boards를 호출하면 Then 404 상태코드를 반환해야 한다 (빈 목록)', () => {
        return request(app.getHttpServer()).get('/boards').expect(404);
      });
    });

    describe('Given 게시글들이 존재할 때', () => {
      it('When GET /boards를 호출하면 Then 200 상태코드와 함께 게시글 목록을 반환해야 한다', async () => {
        // Given: 테스트용 게시글 생성
        const createBoardDto = {
          title: '목록 테스트 게시글',
          content: '목록 조회를 위한 테스트 내용',
          author: '테스트 작성자',
        };

        await request(app.getHttpServer()).post('/boards').send(createBoardDto);

        // When & Then
        return request(app.getHttpServer())
          .get('/boards')
          .expect(200)
          .expect((res) => {
            expect(res.body.rows).toBeDefined();
            expect(Array.isArray(res.body.rows)).toBe(true);
            expect(res.body.count).toBeDefined();
            expect(typeof res.body.count).toBe('number');
          });
      });
    });

    describe('Given 빈 데이터베이스에 페이지네이션 파라미터가 주어졌을 때', () => {
      it('When GET /boards?page=1&pageSize=5를 호출하면 Then 404 상태코드를 반환해야 한다 (빈 목록)', () => {
        return request(app.getHttpServer())
          .get('/boards?page=1&pageSize=5')
          .expect(404);
      });
    });

    describe('Given 검색 조건이 주어졌을 때', () => {
      it('When GET /boards?title=검색어를 호출하면 Then 조건에 맞는 게시글만 반환해야 한다', async () => {
        // Given: 검색용 게시글 생성
        const searchableTitle = '검색가능한제목';
        const createBoardDto = {
          title: searchableTitle,
          content: '검색 테스트용 내용',
          author: '검색 테스트 작성자',
        };

        await request(app.getHttpServer()).post('/boards').send(createBoardDto);

        // When & Then
        return request(app.getHttpServer())
          .get(`/boards?title=${searchableTitle}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.rows).toBeDefined();
            if (res.body.rows.length > 0) {
              expect(res.body.rows[0].title).toContain(searchableTitle);
            }
          });
      });
    });
  });

  describe('게시글 상세 조회 (GET /boards/:id)', () => {
    let createdBoardId: string;

    beforeEach(async () => {
      // Given: 테스트용 게시글 생성
      const createBoardDto = {
        title: '상세 조회 테스트 게시글',
        content: '상세 조회를 위한 테스트 내용',
        author: '상세 테스트 작성자',
      };

      const response = await request(app.getHttpServer())
        .post('/boards')
        .send(createBoardDto);

      createdBoardId = response.body.row._id;
    });

    describe('Given 존재하는 게시글 ID가 주어졌을 때', () => {
      it('When GET /boards/:id를 호출하면 Then 200 상태코드와 함께 게시글 상세 정보를 반환해야 한다', () => {
        return request(app.getHttpServer())
          .get(`/boards/${createdBoardId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.row).toBeDefined();
            expect(res.body.row._id).toBe(createdBoardId);
            expect(res.body.row.title).toBeDefined();
            expect(res.body.row.content).toBeDefined();
            expect(res.body.row.author).toBeDefined();
          });
      });
    });

    describe('Given 존재하지 않는 게시글 ID가 주어졌을 때', () => {
      it('When GET /boards/:id를 호출하면 Then 404 상태코드를 반환해야 한다', () => {
        const nonExistentId = '507f1f77bcf86cd799439999';

        return request(app.getHttpServer())
          .get(`/boards/${nonExistentId}`)
          .expect(404);
      });
    });
  });

  describe('게시글 수정 (PUT /boards/:id)', () => {
    let createdBoardId: string;

    beforeEach(async () => {
      // Given: 테스트용 게시글 생성
      const createBoardDto = {
        title: '수정 테스트 게시글',
        content: '수정을 위한 테스트 내용',
        author: '수정 테스트 작성자',
      };

      const response = await request(app.getHttpServer())
        .post('/boards')
        .send(createBoardDto);

      createdBoardId = response.body.row._id;
    });

    describe('Given 유효한 수정 데이터가 주어졌을 때', () => {
      it('When PUT /boards/:id를 호출하면 Then 200 상태코드와 함께 수정된 게시글을 반환해야 한다', () => {
        const updateBoardDto = {
          title: '수정된 제목',
          content: '수정된 내용',
        };

        return request(app.getHttpServer())
          .put(`/boards/${createdBoardId}`)
          .send(updateBoardDto)
          .expect(200)
          .expect((res) => {
            expect(res.body.row).toBeDefined();
            expect(res.body.row._id).toBe(createdBoardId);
            expect(res.body.row.title).toBe(updateBoardDto.title);
            expect(res.body.row.content).toBe(updateBoardDto.content);
          });
      });
    });

    describe('Given 존재하지 않는 게시글 ID가 주어졌을 때', () => {
      it('When PUT /boards/:id를 호출하면 Then 404 상태코드를 반환해야 한다', () => {
        const nonExistentId = '507f1f77bcf86cd799439999';
        const updateBoardDto = {
          title: '수정 시도',
          content: '존재하지 않는 게시글 수정 시도',
        };

        return request(app.getHttpServer())
          .put(`/boards/${nonExistentId}`)
          .send(updateBoardDto)
          .expect(404);
      });
    });
  });

  describe('게시글 삭제 (DELETE /boards/:id)', () => {
    let createdBoardId: string;

    beforeEach(async () => {
      // Given: 테스트용 게시글 생성
      const createBoardDto = {
        title: '삭제 테스트 게시글',
        content: '삭제를 위한 테스트 내용',
        author: '삭제 테스트 작성자',
      };

      const response = await request(app.getHttpServer())
        .post('/boards')
        .send(createBoardDto);

      createdBoardId = response.body.row._id;
    });

    describe('Given 존재하는 게시글 ID가 주어졌을 때', () => {
      it('When DELETE /boards/:id를 호출하면 Then 200 상태코드를 반환하고 게시글이 삭제되어야 한다', async () => {
        // When: 게시글 삭제
        await request(app.getHttpServer())
          .delete(`/boards/${createdBoardId}`)
          .expect(200);

        // Then: 삭제된 게시글은 조회되지 않아야 함 (Soft Delete로 인한 404)
        return request(app.getHttpServer())
          .get(`/boards/${createdBoardId}`)
          .expect(404);
      });
    });

    describe('Given 존재하지 않는 게시글 ID가 주어졌을 때', () => {
      it('When DELETE /boards/:id를 호출하면 Then 404 상태코드를 반환해야 한다', () => {
        const nonExistentId = '507f1f77bcf86cd799439999';

        return request(app.getHttpServer())
          .delete(`/boards/${nonExistentId}`)
          .expect(404);
      });
    });
  });
});
