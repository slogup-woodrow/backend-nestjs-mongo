import { PickType } from '@nestjs/swagger';
import { Board } from '../../entities/board.entity';

export class BoardResponseDto extends PickType(Board, [
  '_id',
  'title',
  'content',
  'author',
  'viewCount',
  'isActive',
  'createdAt',
  'updatedAt',
] as const) {
  /**
   * 엔티티에서 DTO로 변환하는 팩토리 메소드
   * @param entity
   * @returns BoardResponseDto
   */
  static of(entity: Board): BoardResponseDto {
    const dto = new BoardResponseDto();
    dto._id = entity._id;
    dto.title = entity.title;
    dto.content = entity.content;
    dto.author = entity.author;
    dto.viewCount = entity.viewCount;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  /**
   * 여러 엔티티를 DTO 배열로 변환하는 팩토리 메소드
   * @param entities Board 엔티티 배열
   * @returns BoardResponseDto 배열
   */
  static listOf(entities: Board[]): BoardResponseDto[] {
    return entities.map((entity) => this.of(entity));
  }

  /**
   * 생성일시를 한국 시간 형태로 포맷팅
   * @returns 포맷된 생성일시 (예: 2024-01-01)
   */
  getFormattedCreatedAt(): string {
    if (!this.createdAt) return '';
    return this.createdAt.toLocaleDateString('ko-KR');
  }

  /**
   * 조회수를 포맷팅된 문자열로 반환
   * @returns 포맷된 조회수 (예: 1,000)
   */
  getFormattedViewCount(): string {
    return this.viewCount?.toLocaleString('ko-KR') || '0';
  }

  /**
   * 게시글 활성화 상태를 문자열로 반환
   * @returns 활성화 상태 텍스트
   */
  getStatusText(): string {
    return this.isActive ? '활성' : '비활성';
  }

  /**
   * 게시글 요약 내용 반환 (첫 100자)
   * @returns 요약된 내용
   */
  getSummaryContent(): string {
    if (!this.content) return '';
    return this.content.length > 100
      ? this.content.substring(0, 100) + '...'
      : this.content;
  }
}
