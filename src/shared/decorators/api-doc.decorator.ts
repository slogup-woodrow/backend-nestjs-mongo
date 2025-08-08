import { applyDecorators } from '@nestjs/common';
import { ApiDocOption } from '../interfaces/api-doc-option.interface';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { ObjectResponse } from '../dtos/object-response.dto';
import { ListResponse } from '../dtos/list-response.dto';

/**
 * Decorator - Swagger Api 정의
 *
 * @Example
 * ```ts
 * @ApiDocs({
 *   summary:"주문리스트 조회",
 *   description:"고객이 구매한 상품 주문내역 리스트를 조회합니다."
 *   responseModel:Order,
 *   isArrayResponse:true
 * })
 * ```
 * @param options - Swagger 작성시 입력가능한 옵션객체
 *
 */
export const ApiDoc = (options: ApiDocOption) => {
  const {
    responseModel,
    summary,
    description,
    isArrayResponse = false,
    authUserOnly = false,
    deprecated = false,
  } = options;

  const decorators = [];
  const hasObjectResponseModel = responseModel && !isArrayResponse;
  const hasListResponseModel = responseModel && isArrayResponse;
  const shouldAddModelSchema = responseModel;

  /**
   * 문서 정의 Decorator 등록
   */
  const apiOperation = ApiOperation({
    summary,
    description,
    deprecated,
  });
  decorators.push(apiOperation);

  /**
   * 공통 응답형식 스키마 등록 (응답 Wrapper)
   */
  const extraModels = [ObjectResponse, ListResponse];
  if (shouldAddModelSchema) {
    extraModels.push(responseModel);
  }
  const apiExtraModels = ApiExtraModels(...extraModels);
  decorators.push(apiExtraModels);

  /**
   * 인증 필요시 헤더 스키마 등록
   */
  // if (authUserOnly) {
  //   const authHeader = ApiHeader({
  //     name: 'x-auth-token',
  //     description: 'JWT 토큰',
  //     required: true,
  //   });
  //   decorators.push(authHeader);
  // }

  /**
   * 단일 객체 응답 스키마 등록
   */
  if (hasObjectResponseModel) {
    const objectResponse = ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ObjectResponse) },
          {
            required: ['row'],
            properties: {
              row: {
                $ref: getSchemaPath(responseModel),
              },
            },
          },
        ],
      },
    });
    decorators.push(objectResponse);
  }

  /**
   * 리스트 객체 응답 스키마 등록
   */
  if (hasListResponseModel) {
    const listResponse = ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ListResponse) },
          {
            required: ['rows'],
            properties: {
              rows: {
                type: 'array',
                items: { $ref: getSchemaPath(responseModel) },
              },
            },
          },
        ],
      },
    });
    decorators.push(listResponse);
  }

  /**
   * 오류 응답 스키마 등록
   */
  // 400 Bad request
  // const badRequestErrorOptions = createErrorResponseSchemaExamples(
  //   '잘못된 요청',
  //   {
  //     statusCode: 400,
  //     message: 'validation 오류 메시지',
  //     error: 'Bad Request',
  //   },
  // );
  // const badRequestErrorSchema = ApiBadRequestResponse(badRequestErrorOptions);
  // decorators.push(badRequestErrorSchema);

  // 401 Not authorized
  // if (authUserOnly) {
  //   const notAuthorizedErrorOptions = createErrorResponseSchemaExamples(
  //     '인증 필요',
  //     {
  //       statusCode: 401,
  //       message: '인증이 필요합니다.',
  //       error: 'NotAuthorized',
  //     },
  //   );
  //   const notAuthenticatedErrorSchema = ApiUnauthorizedResponse(
  //     notAuthorizedErrorOptions,
  //   );
  //   decorators.push(notAuthenticatedErrorSchema);
  // }

  // 403 Forbidden
  // const forbiddenErrorOptions = createErrorResponseSchemaExamples(
  //   '접근권한 없음',
  //   {
  //     statusCode: 403,
  //     message: '권한이 없습니다',
  //     error: 'Forbidden',
  //   },
  // );
  // const forbiddenErrorSchema = ApiForbiddenResponse(forbiddenErrorOptions);
  // decorators.push(forbiddenErrorSchema);

  // 404 Not found
  // const notFoundErrorOptions = createErrorResponseSchemaExamples(
  //   '데이터가 없음',
  //   {
  //     statusCode: 404,
  //     message: '데이터가 없습니다',
  //     error: 'Not found',
  //   },
  // );
  // const notFoundErrorSchema = ApiNotFoundResponse(notFoundErrorOptions);
  // decorators.push(notFoundErrorSchema);

  // 409 Conflict
  // const conflictErrorOptions = createErrorResponseSchemaExamples(
  //   '중복데이터 등록',
  //   {
  //     statusCode: 409,
  //     message: '중복된 데이터입니다.',
  //     error: 'Conflict',
  //   },
  // );
  // const conflictErrorSchema = ApiConflictResponse(conflictErrorOptions);
  // decorators.push(conflictErrorSchema);

  // 500 서버 오류
  // const internalServerErrorOptions = createErrorResponseSchemaExamples(
  //   '서버오류',
  //   {
  //     statusCode: 500,
  //     message: 'Internal server error',
  //     error: 'Internal server error',
  //   },
  // );
  // const internalServerErrorSchema = ApiInternalServerErrorResponse(
  //   internalServerErrorOptions,
  // );
  // decorators.push(internalServerErrorSchema);

  return applyDecorators(...decorators);
};

/**
 * Swagger Error 스키마 등록시 예시입력을 위한 Helper
 * @param description - 오류명
 * @param examples - 오류객체 예시 객체정보
 */
const createErrorResponseSchemaExamples = (
  description: string,
  examples: {
    statusCode: number;
    message: string;
    error: string;
  },
) => {
  return {
    description,
    schema: {
      type: 'object',
      required: ['statusCode', 'message', 'error'],
      properties: {
        statusCode: {
          type: 'number',
          description: 'Http 응답코드',
          example: examples.statusCode,
        },
        message: {
          type: 'string',
          description: '오류 메시지',
          example: examples.message,
        },
        error: {
          type: 'string',
          description: '오류 코드',
          example: examples.error,
        },
      },
    },
  };
};
