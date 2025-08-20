# 테스트 전략 및 가이드

## 개요

본 프로젝트는 계층별 테스트 전략을 통해 효율적이고 안정적인 테스트 환경을 구축합니다.

## 테스트 구조

```bash
test/
├── board/                    # 도메인별 테스트
│   ├── board.controller.e2e-spec.ts    # E2E 테스트 (API 통합 테스트)
│   ├── board.repository.spec.ts        # Repository 단위 테스트
│   └── board.service.spec.ts           # Service 단위 테스트
├── utils/                    # 테스트 유틸리티
└── README.md
```

## 계층별 테스트 전략

### 1. Service Layer 테스트 (`*.service.spec.ts`)

**목적**: 비즈니스 로직 검증 및 Repository 호출 확인

**특징**:
- ✅ **고정된 Mock 데이터 사용** (faker 사용 안함)
- ✅ Repository 메서드 호출 여부 및 횟수 검증
- ✅ 예외 처리 로직 검증
- ✅ 예측 가능한 테스트 결과

**예시**:
```typescript
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
```

**이유**: 
- Service는 비즈니스 로직에 집중해야 하므로 데이터 변화보다는 로직 흐름이 중요
- 고정된 데이터로 테스트 안정성 확보
- Repository 호출 패턴과 예외 처리 검증에 집중

### 2. Repository Layer 테스트 (`*.repository.spec.ts`)

**목적**: 데이터 액세스 로직 및 MongoDB 쿼리 검증

**특징**:
- ✅ **Faker 라이브러리 사용**
- ✅ 다양한 데이터 케이스 테스트
- ✅ MongoDB 쿼리 빌더 검증
- ✅ 데이터 변환 및 매핑 검증

**예시**:
```typescript
import { faker } from '@faker-js/faker';

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
```

**이유**:
- 다양한 데이터 형태로 견고성 검증
- MongoDB 쿼리의 다양한 시나리오 테스트
- 실제 데이터와 유사한 형태로 테스트

### 3. Controller Layer 테스트 (E2E) (`*.e2e-spec.ts`)

**목적**: API 통합 테스트 및 전체 플로우 검증

**특징**:
- ✅ **Faker 라이브러리 사용**
- ✅ 실제 HTTP 요청/응답 테스트
- ✅ 전체 애플리케이션 통합 테스트
- ✅ API 스펙 및 데이터 검증

**예시**:
```typescript
import { faker } from '@faker-js/faker';

const createBoardData = {
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(),
  author: faker.person.fullName(),
};
```

**이유**:
- 실제 사용자 입력과 유사한 다양한 데이터 테스트
- API의 다양한 시나리오 검증
- 전체 시스템의 통합성 확인

## 테스트 데이터 전략

### Mock 데이터 vs Faker 데이터

| 계층 | 데이터 타입 | 이유 |
|------|-------------|------|
| **Service** | 고정 Mock 데이터 | 비즈니스 로직 검증에 집중, 예측 가능한 결과 |
| **Repository** | Faker 생성 데이터 | 다양한 데이터 케이스로 견고성 검증 |
| **Controller (E2E)** | Faker 생성 데이터 | 실제 사용 시나리오와 유사한 테스트 |

## 테스트 작성 가이드

### 1. Given-When-Then 패턴 사용

```typescript
describe('게시글 생성', () => {
  it('유효한 데이터로 게시글을 생성하면 성공해야 한다', async () => {
    // Given - 테스트 조건 설정
    const createBoardDto = { /* ... */ };
    
    // When - 테스트 실행
    const result = await service.generateBoard(createBoardDto);
    
    // Then - 결과 검증
    expect(result).toBeDefined();
  });
});
```

### 2. 의미있는 테스트 그룹화

- `describe` 블록으로 기능별 그룹화
- 긍정적/부정적 케이스 모두 테스트
- 에지 케이스 포함

### 3. Mock 초기화

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

## 테스트 실행 명령어

```bash
# 전체 테스트
pnpm run test

# 특정 파일 테스트
pnpm run test board.service.spec.ts

# Watch 모드
pnpm run test:watch

# E2E 테스트
pnpm run test:e2e

# 커버리지
pnpm run test:cov
```

## 베스트 프랙티스

### ✅ DO

- 계층별 테스트 전략 준수
- Given-When-Then 패턴 사용
- 의미있는 테스트 케이스명 작성
- Mock과 Faker를 적절히 구분하여 사용
- 테스트 간 독립성 보장

### ❌ DON'T

- Service 테스트에서 Faker 남용
- Repository 테스트에서 고정 데이터만 사용
- 테스트 간 의존성 생성
- 의미없는 테스트 케이스 작성
- Mock 초기화 누락

## 참고사항

- **Service**: 비즈니스 로직과 Repository 호출에 집중
- **Repository**: 데이터 액세스와 쿼리 로직에 집중  
- **E2E**: 전체 플로우와 API 스펙에 집중
- 각 계층의 책임에 맞는 테스트 전략 적용