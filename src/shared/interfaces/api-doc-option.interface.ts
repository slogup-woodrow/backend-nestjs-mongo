import { Type } from '@nestjs/common';

/**
 * Controller 함수내 Swagger API 문서작성시 입력가능한 옵션 interface
 */
export interface ApiDocOption {
  /**
   * API 설명
   */
  summary: string;
  /**
   * API 설명 상세
   */
  description?: string;
  /**
   * 응답 객체 Class
   */
  responseModel?: Type<any>;
  /**
   * 응답 객체가 배열 형식일 경우 'true' 로 설정
   */
  isArrayResponse?: boolean;
  /**
   * 인증된 유저만 호출가능할 경우 'true' 로 설정
   * 설정시 Api Header JWT 입력 스펙을 자동으로 추가
   */
  authUserOnly?: boolean;
  /**
   * 디플리케이티드 여부
   */
  deprecated?: boolean;
}
