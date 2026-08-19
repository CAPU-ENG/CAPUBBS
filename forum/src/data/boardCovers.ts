import boardCover1 from '../assets/board/b1.webp';
import boardCover2 from '../assets/board/b2.webp';
import boardCover3 from '../assets/board/b3.webp';
import boardCover4 from '../assets/board/b4.webp';
import boardCover5 from '../assets/board/b5.webp';
import boardCover6 from '../assets/board/b6.webp';
import boardCover7 from '../assets/board/b7.webp';
import boardCover9 from '../assets/board/b9.webp';
import boardCover28 from '../assets/board/b28.webp';
import type { DemoBoardId } from './boardDemo';

const boardCoverImages: Record<DemoBoardId, string> = {
  1: boardCover1,
  2: boardCover2,
  3: boardCover3,
  4: boardCover4,
  5: boardCover5,
  6: boardCover6,
  7: boardCover7,
  9: boardCover9,
  28: boardCover28,
};

export function getBoardCoverImage(boardId: DemoBoardId) {
  return boardCoverImages[boardId];
}
