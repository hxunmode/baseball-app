/** 논리 게임판 (원본 canvas와 동일) */
export const LOGICAL_W = 400;
export const LOGICAL_H = 600;

export const BALL_SIZE = 40;
export const GLOVE_W = 130;
export const GLOVE_H = 78;
export const GLOVE_Y = 512;
/** 원본: ballY > 520 */
export const CATCH_LINE = 520;
/** 원본: ballY > 600 */
export const MISS_LINE = 600;

export const GAME_DURATION_SEC = 45;

/** 원본 팀 버튼 순서 */
export const KBO_TEAMS = [
  'LG',
  '두산',
  'SSG',
  '키움',
  'KIA',
  'KT',
  '롯데',
  '삼성',
  '한화',
  'NC',
] as const;

export type KboTeam = (typeof KBO_TEAMS)[number];

export const FIELD_GREEN = '#1b4332';
export const FIELD_LIGHT = '#2d6a4f';
export const BUTTON_BG = '#8B2E2E';
