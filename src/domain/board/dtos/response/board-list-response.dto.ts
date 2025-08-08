import { PickType } from '@nestjs/swagger';
import { Board } from '../../entities/board.entity';

export class BoardListResponseDto extends PickType(Board, [
  '_id',
  'title',
  'author',
  'viewCount',
  'isActive',
  'createdAt',
  'updatedAt',
] as const) {
  /**
   * 엔티티에서 리스트용 DTO로 변환하는 팩토리 메소드
   * @param entity
   * @returns BoardListResponseDto
   */
  static of(entity: Board): BoardListResponseDto {
    const dto = new BoardListResponseDto();
    dto._id = entity._id;
    dto.title = entity.title;
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
   * @returns BoardListResponseDto 배열
   */
  static listOf(entities: Board[]): BoardListResponseDto[] {
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
   * 시간 차이 계산 (예: 3시간 전, 2일 전)
   * @returns 상대적 시간 표시
   */
  getRelativeTime(): string {
    if (!this.createdAt) return '';

    const now = new Date();
    const created = new Date(this.createdAt);
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return this.getFormattedCreatedAt();
  }
}
