# backend-nestjs

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

## 소개

이 애플리케이션은 NestJS 기반의 백엔드 서버로, 효율적이고 확장성 있는 서버 애플리케이션을 구축하기 위해 설계되었습니다.

## 프로젝트 구조

- 본 프로젝트는 DDD 패턴을 참고하여, 도메인별로 디렉토리를 분리하여 관리합니다.

```bash
backend-nestjs/
|-- src/
|   |-- app.controller.ts
|   |-- app.module.ts
|   |-- app.service.ts
|   |-- main.ts
|   |-- domain/
|   |   |-- board/            # 예시 board 도메인
|   |       |-- controllers/  # 컨트롤러
|   |       |-- dtos/         # DTO (request/response)
|   |       |-- entities/     # 엔티티
|   |       |-- repositories/ # 레포지토리
|   |       |-- services/     # 서비스
|   |-- shared/               # 공통 모듈, 상수, 데코레이터 등
|   |   |-- constants/        # 상수
|   |   |-- decorators/       # 데코레이터
|   |   |-- dtos/             # 공통 DTO
|   |   |-- interfaces/       # 인터페이스
|   |   |-- schemas/          # MongoDB 스키마
|-- test/                     # 테스트 코드
    |-- utils/                # 테스트 환경 변수 및 앱 실행 헬퍼 함수 등
    |-- domain/
        |-- fixture           # 실제 API 호출 함수 모음
        |-- mocks             # 테스트용 목 데이터
        |-- scenarios         # 실제 테스트 시나리오 코드
|-- package.json
|-- README.md
```

## 기술 스택

- **언어**: TypeScript
- **프레임워크**: NestJS
- **데이터베이스**: MongoDB, Mongoose
- **테스트**: Jest
- **API 문서화**: Swagger
- **배포/운영**: AWS

## API 문서

| 환경     | 바로가기                                                             |
| -------- | -------------------------------------------------------------------- |
| **로컬** | [Swagger (localhost)](http://localhost:3000/api-docs)                |
| **개발** | [Swagger (dev)](https://dev-api.yourdomain.com/api-docs) (설정 필요) |
| **운영** | [Swagger (prod)](https://api.yourdomain.com/api-docs) (설정 필요)    |

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run start:dev

# 프로덕션 빌드 및 실행
pnpm run build
pnpm run start:prod
```

## 테스트

```bash
# 단위 테스트
pnpm run test

# e2e 테스트
pnpm run test:e2e

# 커버리지
pnpm run test:cov
```

## 환경 변수

- 환경 변수는 `envs/` 디렉토리 및 `.env` 파일을 통해 관리합니다.

## MongoDB 스키마 관리

- MongoDB 스키마는 `src/shared/schemas/`에서 관리합니다.
- 도메인별 엔티티는 각 도메인의 `entities/` 디렉토리에서 관리합니다.

## 코딩 컨벤션

- 클래스: UpperCamelCase
- 메서드/변수: lowerCamelCase
- 상수: UPPER_SNAKE_CASE
- 디렉토리/파일: 소문자, 하이픈(-) 구분

## 예외 처리

### HttpExceptionFilter

- **위치**: `src/shared/filters/http-exception.filter.ts`
- **등록**: `app.module.ts`에서 APP_FILTER로 전역 등록
- **로깅**: Winston을 활용한 에러 로깅 시스템 적용

#### 주요 기능

1. **다국어 지원**: Accept-Language 헤더를 기반으로 한국어/기타 언어 메시지 제공
2. **상태 코드별 응답 처리**:
   - 500번대 에러: `statusCode`, `message`, `stack` 포함
   - 400번대 에러: `statusCode`, `errorCode`, `message`, `data`, `error` 포함
3. **에러 컨텍스트**: 커스텀 에러 코드와 추가 데이터 지원

#### 응답 형식

**기본 4xx 에러 응답**:
```json
{
  "statusCode": 404,
  "message": "Board not found",
  "error": "NotFoundException"
}
```

**errorCode가 있는 에러 객체 사용시**:
```json
{
  "statusCode": 401,
  "errorCode": "COMMON_ERROR_MESSAGE_BEARER_TOKEN_NEEDED",
  "message": "해당 API 요청은 Bearer 토큰을 필요로 합니다",
  "error": "UnauthorizedException"
}
```

#### 사용법

개발자는 단순히 에러 객체를 던지기만 하면 됩니다:

```typescript
// 다국어 지원 에러 객체 (필터가 Accept-Language 헤더 기반으로 언어 선택)
throw new NotFoundException(constants.errorMessages.NOT_FOUND_BOARD);

// 단순 문자열 에러
throw new NotFoundException('Board not found');
```

HttpExceptionFilter가 자동으로:
- Accept-Language 헤더를 확인하여 적절한 언어의 메시지 선택
- errorCode, data 필드가 있으면 응답에 포함

**5xx 에러 응답**:
```json
{
  "statusCode": 500,
  "message": "내부 서버 오류",
  "stack": "에러 스택 트레이스"
}
```

#### 설정

- **main.ts**: Global Validation Pipe와 함께 설정
- **다국어**: `commonConstants.props.languages`를 통한 언어 설정
- **로깅**: Winston을 통한 구조화된 로그 관리

---